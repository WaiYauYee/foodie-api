// models/userModel.js
// All SQL for the `users` table lives here.
// Every function takes an optional `db` (pool or transaction client).
const pool = require("../db/database");

// Columns safe to send to the client (no password_hash)
const PUBLIC_COLUMNS = `
  user_id, email, first_name, last_name, gender, birth_date, height_cm,
  start_weight_kg, current_weight_kg, goal_weight_kg,
  activity_level, dietary_goal, goal_origin,
  target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g,
  macro_goal_origin, onboarding_completed, tried_other_apps, primary_goal, diet_type
`;

// Whitelist: request field -> DB column (used by updateProfile)
const PROFILE_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  gender: "gender",
  birthDate: "birth_date",
  heightCm: "height_cm",
};

const UserModel = {
  async findByEmail(email, db = pool) {
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS}, password_hash, is_active
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(userId, db = pool) {
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS} FROM users WHERE user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },

  async emailExists(email, db = pool) {
    const { rows } = await db.query(
      "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    return rows.length > 0;
  },

  /** Creates a user with default profile/goal values. */
  async create({ userId, email, firstName, lastName, passwordHash }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO users (
         user_id, email, first_name, last_name, password_hash,
         gender, birth_date, height_cm, is_active,
         start_weight_kg, current_weight_kg, goal_weight_kg,
         activity_level, dietary_goal, goal_origin,
         target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g,
         macro_goal_origin, onboarding_completed, tried_other_apps, primary_goal, diet_type,
         created_at, updated_at
       ) VALUES (
         $1,$2,$3,$4,$5,
         'male', NULL, 170, true,
         70, 70, 65,
         NULL, NULL, 'Standard',
         2000, 120, 250, 60, 30,
         'Standard', false, false, NULL, 'Classic',
         NOW(), NOW()
       )
       RETURNING user_id, email, first_name, last_name`,
      [userId, email, firstName.trim(), lastName.trim(), passwordHash]
    );
    return rows[0];
  },

  async completeOnboarding(userId, data, db = pool) {
    const { rows } = await db.query(
      `UPDATE users SET
         gender = $1, birth_date = $2, height_cm = $3,
         start_weight_kg = $4, current_weight_kg = $4, goal_weight_kg = $5,
         activity_level = $6, dietary_goal = $7, diet_type = $8,
         primary_goal = $9, tried_other_apps = $10,
         onboarding_completed = true, updated_at = NOW()
       WHERE user_id = $11
       RETURNING ${PUBLIC_COLUMNS}`,
      [
        data.gender,
        data.birthDate || null,
        data.heightCm,
        data.startWeight,
        data.goalWeight,
        data.activityLevel,
        data.dietaryGoal || null,
        data.dietType,
        data.primaryGoal,
        data.triedOtherApps,
        userId,
      ]
    );
    return rows[0] || null;
  },

  /** Dynamic update; only whitelisted fields are used. Returns null if no fields or user missing. */
  async updateProfile(userId, fields, db = pool) {
    const sets = [];
    const values = [];
    for (const [key, column] of Object.entries(PROFILE_FIELDS)) {
      if (fields[key]) {
        values.push(typeof fields[key] === "string" ? fields[key].trim() : fields[key]);
        sets.push(`${column} = $${values.length}`);
      }
    }
    if (sets.length === 0) return undefined; // nothing to update

    values.push(userId);
    const { rows } = await db.query(
      `UPDATE users SET ${sets.join(", ")}, updated_at = NOW()
       WHERE user_id = $${values.length}
       RETURNING ${PUBLIC_COLUMNS}`,
      values
    );
    return rows[0] || null;
  },

  async updateGoals(userId, g, db = pool) {
    const { rows } = await db.query(
      `UPDATE users SET
         start_weight_kg   = COALESCE($1, start_weight_kg),
         current_weight_kg = COALESCE($1, current_weight_kg),
         goal_weight_kg    = COALESCE($2, goal_weight_kg),
         activity_level    = COALESCE($3, activity_level),
         dietary_goal      = COALESCE($4, dietary_goal),
         target_calories   = COALESCE($5, target_calories),
         target_protein_g  = COALESCE($6, target_protein_g),
         target_carbs_g    = COALESCE($7, target_carbs_g),
         target_fat_g      = COALESCE($8, target_fat_g),
         target_fiber_g    = COALESCE($9, target_fiber_g),
         updated_at        = NOW()
       WHERE user_id = $10
       RETURNING ${PUBLIC_COLUMNS}`,
      [
        g.startWeightKg, g.goalWeightKg, g.activityLevel, g.dietaryGoal,
        g.targetCalories, g.targetProteinG, g.targetCarbsG, g.targetFatG, g.targetFiberG,
        userId,
      ]
    );
    return rows[0] || null;
  },

  async updatePassword(userId, passwordHash, db = pool) {
    const { rowCount } = await db.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2",
      [passwordHash, userId]
    );
    return rowCount > 0;
  },

  /** Extra profile row from the user_profile table (if you use it). */
  async findExtendedProfile(userId, db = pool) {
    const { rows } = await db.query(
      "SELECT * FROM user_profile WHERE user_id = $1",
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = UserModel;
