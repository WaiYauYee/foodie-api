// models/revokedTokenModel.js
const pool = require("../db/database");

const RevokedTokenModel = {
  async revoke(jti, userId, expiresAt, db = pool) {
    await db.query(
      `INSERT INTO revoked_tokens (jti, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (jti) DO NOTHING`,
      [jti, userId, expiresAt]
    );
  },

  async isRevoked(jti, db = pool) {
    const { rows } = await db.query(
      "SELECT 1 FROM revoked_tokens WHERE jti = $1",
      [jti]
    );
    return rows.length > 0;
  },

  async purgeExpired(db = pool) {
    await db.query("DELETE FROM revoked_tokens WHERE expires_at < now()");
  },
};

module.exports = RevokedTokenModel;