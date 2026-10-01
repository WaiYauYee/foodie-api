// models/passwordResetTokenModel.js
const pool = require("../db/database");

const PasswordResetTokenModel = {
  async create({ userId, tokenHash, expiresAt }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, created_at, expires_at)
       VALUES ($1, $2, NOW(), $3)
       RETURNING token_id`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  },

  /** Returns a token row only if it is unexpired and unused. */
  async findValid(tokenHash, db = pool) {
    const { rows } = await db.query(
      `SELECT token_id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async markUsed(tokenId, db = pool) {
    await db.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_id = $1",
      [tokenId]
    );
  },
};

module.exports = PasswordResetTokenModel;