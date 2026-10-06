// models/passwordResetTokenModel.js

const pool = require("../db/database");

const PasswordResetTokenModel = {
  async create(
    { userId, codeHash, expiresAt, requestedIp = null },
    db = pool
  ) {
    const { rows } = await db.query(
      `INSERT INTO password_reset_tokens (
         user_id,
         code_hash,
         requested_ip,
         created_at,
         expires_at
       )
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING id, user_id, created_at, expires_at`,
      [userId, codeHash, requestedIp, expiresAt]
    );

    return rows[0];
  },

  /**
   * Returns a reset record only if:
   * - the code/token matches
   * - it has not expired
   * - it has not already been used
   */
  async findValid(codeHash, db = pool) {
    const { rows } = await db.query(
      `SELECT
         id,
         user_id,
         code_hash,
         attempts,
         created_at,
         expires_at,
         used_at
       FROM password_reset_tokens
       WHERE code_hash = $1
         AND expires_at > NOW()
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [codeHash]
    );

    return rows[0] || null;
  },

  async markUsed(id, db = pool) {
    await db.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [id]
    );
  },

  async incrementAttempts(id, db = pool) {
    const { rows } = await db.query(
      `UPDATE password_reset_tokens
       SET attempts = attempts + 1
       WHERE id = $1
       RETURNING attempts`,
      [id]
    );

    return rows[0] || null;
  },
};

module.exports = PasswordResetTokenModel;