import { query } from '../config/database';
import { CanvasObject } from '@living-taskboard/shared';

export interface BoardVersion {
  id: string;
  boardId: string;
  version: number;
  snapshot: CanvasObject[];
  description?: string;
  createdBy: string;
  createdAt: Date;
}

export class VersionService {
  // Create a new version snapshot
  async createVersion(
    boardId: string,
    userId: string,
    objects: CanvasObject[],
    description?: string
  ): Promise<BoardVersion> {
    // Get next version number
    const versionResult = await query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM board_versions WHERE board_id = $1',
      [boardId]
    );
    const nextVersion = versionResult.rows[0].next_version;

    // Insert new version
    const result = await query(
      `INSERT INTO board_versions (board_id, version, snapshot, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [boardId, nextVersion, JSON.stringify(objects), description, userId]
    );

    return this.mapVersion(result.rows[0]);
  }

  // Get all versions for a board
  async getVersions(boardId: string): Promise<BoardVersion[]> {
    const result = await query(
      `SELECT bv.*, u.name as user_name
       FROM board_versions bv
       JOIN users u ON bv.created_by = u.id
       WHERE bv.board_id = $1
       ORDER BY bv.version DESC`,
      [boardId]
    );

    return result.rows.map(this.mapVersion);
  }

  // Get a specific version
  async getVersion(boardId: string, version: number): Promise<BoardVersion | null> {
    const result = await query(
      'SELECT * FROM board_versions WHERE board_id = $1 AND version = $2',
      [boardId, version]
    );

    if (result.rows.length === 0) return null;
    return this.mapVersion(result.rows[0]);
  }

  // Get version by ID
  async getVersionById(versionId: string): Promise<BoardVersion | null> {
    const result = await query(
      'SELECT * FROM board_versions WHERE id = $1',
      [versionId]
    );

    if (result.rows.length === 0) return null;
    return this.mapVersion(result.rows[0]);
  }

  // Restore a version
  async restoreVersion(boardId: string, versionId: string, userId: string): Promise<void> {
    // Get the version to restore
    const version = await this.getVersionById(versionId);
    if (!version || version.boardId !== boardId) {
      throw new Error('Version not found');
    }

    // Get current objects for comparison
    const currentObjects = await query(
      'SELECT * FROM canvas_objects WHERE board_id = $1',
      [boardId]
    );

    // Create a new version with current state before restoring
    await this.createVersion(
      boardId,
      userId,
      currentObjects.rows,
      `Before restoring to version ${version.version}`
    );

    // Delete current objects
    await query('DELETE FROM canvas_objects WHERE board_id = $1', [boardId]);

    // Insert restored objects
    for (const obj of version.snapshot) {
      await query(
        `INSERT INTO canvas_objects (
          id, board_id, type, position, size, rotation, z_index, locked, visible,
          layer_id, group_id, data, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          obj.id,
          boardId,
          obj.type,
          JSON.stringify(obj.position),
          JSON.stringify(obj.size),
          obj.rotation,
          obj.zIndex,
          obj.locked,
          obj.visible,
          obj.layerId,
          obj.groupId,
          JSON.stringify(obj.data),
          userId
        ]
      );
    }
  }

  // Get diff between two versions
  async getDiff(boardId: string, fromVersion: number, toVersion: number): Promise<any> {
    const [from, to] = await Promise.all([
      this.getVersion(boardId, fromVersion),
      this.getVersion(boardId, toVersion)
    ]);

    if (!from || !to) {
      throw new Error('Version not found');
    }

    const fromMap = new Map(from.snapshot.map(obj => [obj.id, obj]));
    const toMap = new Map(to.snapshot.map(obj => [obj.id, obj]));

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    // Find added and modified
    for (const [id, obj] of toMap) {
      if (!fromMap.has(id)) {
        added.push(id);
      } else {
        const fromObj = fromMap.get(id)!;
        if (JSON.stringify(fromObj) !== JSON.stringify(obj)) {
          modified.push(id);
        }
      }
    }

    // Find removed
    for (const id of fromMap.keys()) {
      if (!toMap.has(id)) {
        removed.push(id);
      }
    }

    return {
      added,
      removed,
      modified,
      fromSnapshot: from.snapshot,
      toSnapshot: to.snapshot
    };
  }

  // Auto-save version (called periodically)
  async autoSave(boardId: string, userId: string, objects: CanvasObject[]): Promise<void> {
    // Check if we need a new version (5 minute interval)
    const lastVersion = await query(
      `SELECT created_at FROM board_versions
       WHERE board_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [boardId]
    );

    if (lastVersion.rows.length > 0) {
      const lastSave = new Date(lastVersion.rows[0].created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      if (lastSave > fiveMinutesAgo) {
        return; // Too soon for auto-save
      }
    }

    await this.createVersion(boardId, userId, objects, 'Auto-save');
  }

  private mapVersion(row: any): BoardVersion {
    return {
      id: row.id,
      boardId: row.board_id,
      version: row.version,
      snapshot: typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot,
      description: row.description,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}

export const versionService = new VersionService();
