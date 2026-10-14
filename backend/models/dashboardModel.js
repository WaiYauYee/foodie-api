// models/dashboardModel.js
const pool = require("../db/database");

const DashboardModel = {
  /**
   * One row per calendar day for the last `days` days (oldest -> today),
   * in the USER's timezone. Days with no log come back as zeros (logged = false),
   * so the chart always gets exactly `days` points.
   * Source: daily_summaries (kept up to date by triggers on meal_entries / water_logs).
   */
  async getDailyHistory(userId, days, db = pool) {
    const { rows } = await db.query(
      `WITH bounds AS (
         SELECT (now() AT TIME ZONE COALESCE(
                  (SELECT timezone FROM user_profiles WHERE user_id = $1),
                  'Asia/Kuala_Lumpur'))::date AS today
       )
       SELECT to_char(b.today - n.i, 'YYYY-MM-DD')          AS date,
              COALESCE(s.total_calories,  0)::float8        AS calories,
              COALESCE(s.total_protein_g, 0)::float8        AS protein,
              COALESCE(s.total_carbs_g,   0)::float8        AS carbs,
              COALESCE(s.total_fat_g,     0)::float8        AS fat,
              COALESCE(s.total_fiber_g,   0)::float8        AS fiber,
              COALESCE(s.water_ml,        0)::int           AS "waterMl",
              COALESCE(s.meal_count,      0)::int           AS "mealCount",
              (COALESCE(s.meal_count, 0) > 0)               AS logged
       FROM bounds b
       CROSS JOIN generate_series(0, $2::int - 1) AS n(i)
       LEFT JOIN daily_summaries s
              ON s.user_id = $1 AND s.summary_date = b.today - n.i
       ORDER BY n.i DESC`,
      [userId, days]
    );
    return rows;
  },
};

module.exports = DashboardModel;