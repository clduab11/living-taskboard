import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { generateToken } from '../utils/jwt';
import { User, SubscriptionTier } from '@living-taskboard/shared';

export class AuthService {
  async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, subscription_tier)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, avatar, subscription_tier, created_at, updated_at`,
      [email, passwordHash, name, SubscriptionTier.FREE]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier
    });

    return { user, token };
  }

  async login(email: string, password: string) {
    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier
    });

    // Remove password hash from response
    delete user.password_hash;

    return { user, token };
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await query(
      `SELECT id, email, name, avatar, subscription_tier, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  async updateUser(userId: string, updates: Partial<User>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.avatar) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(updates.avatar);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, name, avatar, subscription_tier, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }
}

export const authService = new AuthService();
