// models/weightModel.js
const pool = require("../db/database");

const COLS = `
  id,
  user_id                                         AS "userId",
  weight_kg::float8                               AS weight,
  bmi::float8                                     AS bmi,
  (EXTRACT(EPOCH FROM recorded_at) * 1000)::float8 AS "recordedAt",
  (EXTRACT(EPOCH FROM created_at)  * 1000)::float8 AS "createdAt",
  note
`;

const WeightModel = {
  /** Newest first. */
  async list(userId, limit = 365, db = pool) {
    const { rows } = await db.query(
      `SELECT ${COLS} FROM weight_entries
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows.map((r) => ({
      ...r,
      recordedAt: Math.round(r.recordedAt),
      createdAt: Math.round(r.createdAt),
    }));
  },

  /**
   * height_cm is copied from the profile so the generated bmi column
   * is a snapshot of that day. local_date is filled by trg_weight_local_date.
   * Returns null if the user has no profile row.
   */
  async add(userId, { weightKg, recordedAt = null, note = null }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO weight_entries (user_id, weight_kg, height_cm, recorded_at, note)
       SELECT $1, $2, p.height_cm, COALESCE($3::timestamptz, now()), $4
       FROM user_profiles p
       WHERE p.user_id = $1
       RETURNING ${COLS}`,
      [userId, weightKg, recordedAt, note]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      recordedAt: Math.round(rows[0].recordedAt),
      createdAt: Math.round(rows[0].createdAt),
    };
  },

  /** Ownership is enforced in the WHERE clause. */
  async remove(userId, entryId, db = pool) {
    const { rowCount } = await db.query(
      `DELETE FROM weight_entries WHERE id = $1 AND user_id = $2`,
      [entryId, userId]
    );
    return rowCount > 0;
  },

  /** Latest entry = current weight (v_current_weight logic). */
  async latest(userId, db = pool) {
    const { rows } = await db.query(
      `SELECT weight_kg::float8 AS weight, bmi::float8 AS bmi
       FROM weight_entries
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = WeightModel;