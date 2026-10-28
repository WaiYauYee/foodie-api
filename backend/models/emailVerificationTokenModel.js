// models/emailVerificationTokenModel.js
const pool = require("../db/database");

const EmailVerificationTokenModel = {
  async create({ userId, codeHash, expiresAt, requestedIp = null }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO email_verification_tokens (user_id, code_hash, requested_ip, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at, expires_at`,
      [userId, codeHash, requestedIp, expiresAt]
    );
    return rows[0];
  },

  async findLatestActive(userId, db = pool) {
    const { rows } = await db.query(
      `SELECT id, user_id, code_hash, attempts, created_at, expires_at
       FROM email_verification_tokens
       WHERE user_id = $1 AND expires_at > NOW() AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },

  async invalidateAllForUser(userId, db = pool) {
    await db.query(
      `UPDATE email_verification_tokens SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );
  },

  async markUsed(id, db = pool) {
    await db.query(
      `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
      [id]
    );
  },

  async incrementAttempts(id, db = pool) {
    await db.query(
      `UPDATE email_verification_tokens SET attempts = attempts + 1 WHERE id = $1`,
      [id]
    );
  },
};

module.exports = EmailVerificationTokenModel;