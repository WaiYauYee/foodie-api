// models/notificationModel.js
const pool = require("../db/database");
const withTransaction = require("../db/withTransaction");

const NotificationModel = {
  async get(userId, db = pool) {
    const prefs = await db.query(
      `SELECT meal_reminders_enabled, water_reminder_enabled, weight_reminders_enabled
       FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );
    if (!prefs.rows[0]) return null;

    const times = await db.query(
      `SELECT meal_type, to_char(remind_at, 'HH24:MI') AS remind_at
       FROM meal_reminder_times WHERE user_id = $1
       ORDER BY remind_at`,
      [userId]
    );

    const p = prefs.rows[0];
    return {
      mealRemindersEnabled: p.meal_reminders_enabled,
      waterReminderEnabled: p.water_reminder_enabled,
      weightRemindersEnabled: p.weight_reminders_enabled,
      mealTimes: times.rows.map((t) => ({ mealType: t.meal_type, time: t.remind_at })),
    };
  },

  /** Partial update: only supplied fields change. Returns null if the user has no prefs row. */
  async update(userId, body, db) {
    const run = async (c) => {
      const { rowCount } = await c.query(
        `UPDATE notification_preferences SET
           meal_reminders_enabled   = COALESCE($1, meal_reminders_enabled),
           water_reminder_enabled   = COALESCE($2, water_reminder_enabled),
           weight_reminders_enabled = COALESCE($3, weight_reminders_enabled)
         WHERE user_id = $4`,
        [
          body.mealRemindersEnabled ?? null,
          body.waterReminderEnabled ?? null,
          body.weightRemindersEnabled ?? null,
          userId,
        ]
      );
      if (rowCount === 0) return null;

      for (const t of body.mealTimes || []) {
        await c.query(
          `INSERT INTO meal_reminder_times (user_id, meal_type, remind_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, meal_type) DO UPDATE SET remind_at = EXCLUDED.remind_at`,
          [userId, t.mealType, t.time]
        );
      }
      return NotificationModel.get(userId, c);
    };
    return db ? run(db) : withTransaction(run);
  },
};

module.exports = NotificationModel;