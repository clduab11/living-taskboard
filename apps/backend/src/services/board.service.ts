import { query } from '../config/database';
import { Board, BoardVisibility, BoardRole, SubscriptionTier } from '@living-taskboard/shared';
import { config } from '../config/env';

export class BoardService {
  async createBoard(
    userId: string,
    name: string,
    description: string | undefined,
    visibility: BoardVisibility,
    settings?: any
  ) {
    // Check board limit based on subscription
    const userResult = await query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [userId]
    );

    const subscriptionTier = userResult.rows[0]?.subscription_tier as SubscriptionTier;
    const boardLimit = config.limits[subscriptionTier]?.boards || 5;

    if (boardLimit !== -1) {
      const countResult = await query(
        'SELECT COUNT(*) as count FROM boards WHERE owner_id = $1',
        [userId]
      );

      if (parseInt(countResult.rows[0].count) >= boardLimit) {
        throw new Error(`Board limit reached for ${subscriptionTier} tier`);
      }
    }

    // Create board
    const defaultSettings = {
      backgroundColor: '#ffffff',
      gridEnabled: true,
      snapToGrid: false,
      gridSize: 20,
      ...settings
    };

    const result = await query(
      `INSERT INTO boards (name, description, owner_id, visibility, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, userId, visibility, JSON.stringify(defaultSettings)]
    );

    const board = result.rows[0];

    // Add owner permission
    await query(
      `INSERT INTO board_permissions (board_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [board.id, userId, BoardRole.OWNER]
    );

    return board;
  }

  async getBoard(boardId: string, userId?: string) {
    const result = await query(
      'SELECT * FROM boards WHERE id = $1',
      [boardId]
    );

    if (result.rows.length === 0) {
      throw new Error('Board not found');
    }

    const board = result.rows[0];

    // Check permissions
    if (board.visibility === BoardVisibility.PRIVATE) {
      if (!userId) {
        throw new Error('Authentication required');
      }

      const hasAccess = await this.checkBoardAccess(boardId, userId);
      if (!hasAccess) {
        throw new Error('Access denied');
      }
    }

    return board;
  }

  async getBoardsByUser(userId: string) {
    const result = await query(
      `SELECT DISTINCT b.*
       FROM boards b
       LEFT JOIN board_permissions bp ON b.id = bp.board_id
       WHERE b.owner_id = $1 OR bp.user_id = $1
       ORDER BY b.updated_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async updateBoard(
    boardId: string,
    userId: string,
    updates: Partial<Board>
  ) {
    // Check if user is owner or editor
    const role = await this.getUserBoardRole(boardId, userId);
    if (!role || (role !== BoardRole.OWNER && role !== BoardRole.EDITOR)) {
      throw new Error('Insufficient permissions');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.visibility) {
      fields.push(`visibility = $${paramCount++}`);
      values.push(updates.visibility);
    }

    if (updates.settings) {
      fields.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(updates.settings));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(boardId);

    const result = await query(
      `UPDATE boards SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async deleteBoard(boardId: string, userId: string) {
    // Check if user is owner
    const role = await this.getUserBoardRole(boardId, userId);
    if (role !== BoardRole.OWNER) {
      throw new Error('Only board owner can delete');
    }

    await query('DELETE FROM boards WHERE id = $1', [boardId]);
  }

  async checkBoardAccess(boardId: string, userId: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM boards b
       LEFT JOIN board_permissions bp ON b.id = bp.board_id
       WHERE b.id = $1 AND (b.owner_id = $2 OR bp.user_id = $2)`,
      [boardId, userId]
    );

    return result.rows.length > 0;
  }

  async getUserBoardRole(boardId: string, userId: string): Promise<BoardRole | null> {
    // Check if owner
    const ownerResult = await query(
      'SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    );

    if (ownerResult.rows.length > 0) {
      return BoardRole.OWNER;
    }

    // Check permission
    const permResult = await query(
      'SELECT role FROM board_permissions WHERE board_id = $1 AND user_id = $2',
      [boardId, userId]
    );

    return permResult.rows[0]?.role || null;
  }

  async shareBoardWithUser(
    boardId: string,
    ownerId: string,
    targetEmail: string,
    role: BoardRole
  ) {
    // Verify owner
    const ownerRole = await this.getUserBoardRole(boardId, ownerId);
    if (ownerRole !== BoardRole.OWNER) {
      throw new Error('Only board owner can share');
    }

    // Find target user
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [targetEmail]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const targetUserId = userResult.rows[0].id;

    // Add or update permission
    await query(
      `INSERT INTO board_permissions (board_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (board_id, user_id)
       DO UPDATE SET role = $3`,
      [boardId, targetUserId, role]
    );

    return { success: true };
  }
}

export const boardService = new BoardService();
