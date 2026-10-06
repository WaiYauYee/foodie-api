// models/userModel.js
// All SQL for users / user_profiles / user_goals / weight_entries (identity + profile side) lives here.
// Functions take an optional `db` (pool or transaction client).
// Multi-statement functions (create, completeOnboarding, updateGoals) open their own
// transaction when no client is passed in.
const pool = require("../db/database");
const withTransaction = require("../db/withTransaction");

// "Lightly Active" / "Gradual-Gain" -> "lightly_active" / "gradual_gain" (enum values are lowercase snake_case)
const toEnum = (v) =>
  typeof v === "string" ? v.trim().toLowerCase().replace(/[\s-]+/g, "_") : v;

// Run fn inside the caller's client, or in a fresh transaction
const inTx = (db, fn) => (db ? fn(db) : withTransaction(fn));

// ---------------------------------------------------------------------
// One SELECT that rebuilds the old flat "users" row from the new tables.
// Column aliases match the old names, so toUserDto() in the controller keeps working.
//   users + user_profiles      -> identity / profile
//   user_goals (valid_to NULL) -> current goal
//   weight_entries (latest)    -> current_weight_kg
// ---------------------------------------------------------------------
const USER_COLUMNS = `
  u.id                         AS user_id,
  u.email,
  p.first_name, p.last_name, p.gender, p.birth_date, p.height_cm,
  g.start_weight_kg,
  w.weight_kg                  AS current_weight_kg,
  g.goal_weight_kg,
  g.activity_level,
  g.dietary_goal,
  g.calorie_origin             AS goal_origin,
  g.target_calories,
  g.target_protein_g, g.target_carbs_g, g.target_fat_g, g.target_fiber_g,
  g.target_water_ml,
  g.macro_origin               AS macro_goal_origin,
  (p.onboarding_completed_at IS NOT NULL) AS onboarding_completed,
  p.tried_other_apps, p.primary_goal, p.diet_type
`;

const USER_FROM = `
  FROM users u
  JOIN user_profiles p ON p.user_id = u.id
  LEFT JOIN user_goals g ON g.user_id = u.id AND g.valid_to IS NULL
  LEFT JOIN LATERAL (
    SELECT weight_kg FROM weight_entries
    WHERE user_id = u.id
    ORDER BY recorded_at DESC LIMIT 1
  ) w ON true
`;

// Whitelist: request field -> user_profiles column (used by updateProfile)
const PROFILE_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  gender: "gender",
  birthDate: "birth_date",
  heightCm: "height_cm",
  dietType: "diet_type",
  primaryGoal: "primary_goal",
  timezone: "timezone",
  locale: "locale",
};
const ENUM_FIELDS = new Set(["gender", "dietType", "primaryGoal"]);

const UserModel = {
  /** Includes password_hash + is_active for login. Never send this row to the client. */
  async findByEmail(email, db = pool) {
    const { rows } = await db.query(
      `SELECT ${USER_COLUMNS}, u.password_hash, u.is_active
       ${USER_FROM}
       WHERE u.email = $1 AND u.deleted_at IS NULL`, // email is citext -> already case-insensitive
      [email]
    );
    return rows[0] || null;
  },

  async findById(userId, db = pool) {
    const { rows } = await db.query(
      `SELECT ${USER_COLUMNS} ${USER_FROM}
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  },

  async emailExists(email, db = pool) {
    const { rows } = await db.query(
      "SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );
    return rows.length > 0;
  },

  /**
   * Creates users + user_profiles in one transaction.
   * The trg_new_profile_defaults trigger then creates notification prefs,
   * reminder times and the pal profile. No goal row yet: that happens at onboarding.
   */
  async create({ userId, email, firstName, lastName, passwordHash }, db) {
    return inTx(db, async (c) => {
      await c.query(
        `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`,
        [userId, email, passwordHash]
      );
      const { rows } = await c.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name)
         VALUES ($1, $2, $3)
         RETURNING user_id, first_name, last_name`,
        [userId, firstName.trim(), lastName.trim()]
      );
      return { user_id: rows[0].user_id, email, first_name: rows[0].first_name, last_name: rows[0].last_name };
    });
  },

  /**
   * Onboarding touches 3 tables:
   *   user_profiles  -> body data + preferences + onboarding_completed_at
   *   user_goals     -> first (or replacement) goal version
   *   weight_entries -> first weigh-in (this IS the "current weight" now)
   */
  async completeOnboarding(userId, data, db) {
    return inTx(db, async (c) => {
      const prof = await c.query(
        `UPDATE user_profiles SET
           gender = $1, birth_date = $2, height_cm = $3,
           diet_type = $4, primary_goal = $5, tried_other_apps = $6,
           onboarding_completed_at = now()
         WHERE user_id = $7
         RETURNING user_id`,
        [
          toEnum(data.gender),
          data.birthDate,
          data.heightCm,
          toEnum(data.dietType),
          toEnum(data.primaryGoal),
          data.triedOtherApps,
          userId,
        ]
      );
      if (prof.rowCount === 0) return null;

      // close any existing goal (re-onboarding), then open a new version
      await c.query(
        `UPDATE user_goals SET valid_to = now() WHERE user_id = $1 AND valid_to IS NULL`,
        [userId]
      );
      const customCal = data.targetCalories != null;
      const customMacro = [data.targetProteinG, data.targetCarbsG, data.targetFatG, data.targetFiberG]
        .some((v) => v != null);

      await c.query(
        `INSERT INTO user_goals (
           user_id, start_weight_kg, goal_weight_kg, activity_level, dietary_goal,
           calorie_origin, target_calories,
           macro_origin, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          userId,
          data.startWeight,
          data.goalWeight,
          toEnum(data.activityLevel),
          toEnum(data.dietaryGoal),
          customCal ? "custom" : "standard",
          data.targetCalories,
          customMacro ? "custom" : "standard",
          data.targetProteinG,
          data.targetCarbsG,
          data.targetFatG,
          data.targetFiberG,
        ]
      );

      // local_date is filled by trg_weight_local_date (user's timezone)
      await c.query(
        `INSERT INTO weight_entries (user_id, weight_kg, height_cm) VALUES ($1, $2, $3)`,
        [userId, data.startWeight, data.heightCm]
      );

      return UserModel.findById(userId, c);
    });
  },

  /**
   * Dynamic update of user_profiles; only whitelisted fields are used.
   * Returns undefined if no fields were supplied, null if the user is missing.
   */
  async updateProfile(userId, fields, db = pool) {
    const sets = [];
    const values = [];
    for (const [key, column] of Object.entries(PROFILE_FIELDS)) {
      let v = fields[key];
      if (v === undefined || v === null || v === "") continue;
      if (typeof v === "string") v = v.trim();
      if (ENUM_FIELDS.has(key)) v = toEnum(v);
      values.push(v);
      sets.push(`${column} = $${values.length}`);
    }
    if (sets.length === 0) return undefined; // nothing to update

    values.push(userId);
    const { rowCount } = await db.query(
      `UPDATE user_profiles SET ${sets.join(", ")}
       WHERE user_id = $${values.length}`,
      values
    );
    if (rowCount === 0) return null;
    return UserModel.findById(userId, db);
  },

  /**
   * Goals are versioned: close the current row, open a new one with the merged values.
   * Returns null if the user has no current goal (not onboarded) or doesn't exist.
   */
  async updateGoals(userId, g, db) {
    return inTx(db, async (c) => {
      const { rows } = await c.query(
        `SELECT * FROM user_goals WHERE user_id = $1 AND valid_to IS NULL FOR UPDATE`,
        [userId]
      );
      const cur = rows[0];
      if (!cur) return null;

      const pick = (incoming, existing) => (incoming !== undefined && incoming !== null ? incoming : existing);
      const customCal = g.targetCalories != null;
      const customMacro = [g.targetProteinG, g.targetCarbsG, g.targetFatG, g.targetFiberG]
        .some((v) => v != null);

      await c.query(`UPDATE user_goals SET valid_to = now() WHERE id = $1`, [cur.id]);

      await c.query(
        `INSERT INTO user_goals (
           user_id, start_weight_kg, goal_weight_kg, activity_level, dietary_goal,
           calorie_origin, target_calories,
           macro_origin, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g,
           target_water_ml
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          userId,
          pick(g.startWeightKg, cur.start_weight_kg),
          pick(g.goalWeightKg, cur.goal_weight_kg),
          pick(toEnum(g.activityLevel), cur.activity_level),
          pick(toEnum(g.dietaryGoal), cur.dietary_goal),
          customCal ? "custom" : cur.calorie_origin,
          pick(g.targetCalories, cur.target_calories),
          customMacro ? "custom" : cur.macro_origin,
          pick(g.targetProteinG, cur.target_protein_g),
          pick(g.targetCarbsG, cur.target_carbs_g),
          pick(g.targetFatG, cur.target_fat_g),
          pick(g.targetFiberG, cur.target_fiber_g),
          pick(g.targetWaterMl, cur.target_water_ml),
        ]
      );

      return UserModel.findById(userId, c);
    });
  },

  async updatePassword(userId, passwordHash, db = pool) {
    const { rowCount } = await db.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2 AND deleted_at IS NULL", // updated_at via trigger
      [passwordHash, userId]
    );
    return rowCount > 0;
  },

  async touchLastLogin(userId, db = pool) {
    await db.query("UPDATE users SET last_login_at = now() WHERE id = $1", [userId]);
  },

  /** Extra profile fields not in the main DTO (user_profile table is now user_profiles). */
  async findExtendedProfile(userId, db = pool) {
    const { rows } = await db.query(
      `SELECT timezone, locale, onboarding_completed_at, created_at
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = UserModel;