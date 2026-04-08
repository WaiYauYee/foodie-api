// controller/authController.js
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken'); 
const pool = require("../config/db");

// ============================================
// VALIDATION HELPERS
// ============================================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

const validateSignUpData = (data) => {
  // Check if data exists
  if (!data) {
    return { valid: false, message: "Request body is required" };
  }

  // Check required fields exist and are not empty
  if (!data.firstName || !data.firstName.trim()) {
    return { valid: false, message: "First name is required" };
  }
  if (!data.lastName || !data.lastName.trim()) {
    return { valid: false, message: "Last name is required" };
  }
  if (!data.email) {
    return { valid: false, message: "Email is required" };
  }
  if (!data.password) {
    return { valid: false, message: "Password is required" };
  }
  if (!data.confirmPassword) {
    return { valid: false, message: "Confirm password is required" };
  }

  // Validate email format
  if (!validateEmail(data.email)) {
    return { valid: false, message: "Invalid email format" };
  }

  // Check passwords match
  if (data.password !== data.confirmPassword) {
    return { valid: false, message: "Passwords do not match" };
  }

  // Validate password strength
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    return { valid: false, message: passwordValidation.message };
  }

  return { valid: true };
};

const validateOnboardingData = (data) => {
  if (!data) return { valid: false, message: "Onboarding data is missing" };
  if (data.triedOtherApps === undefined) return { valid: false, message: "Answer is required" };
  if (!data.dietType) return { valid: false, message: "Diet Type is required" };
  if (!data.primaryGoal) return { valid: false, message: "Primary goal is required" };
  if (!data.gender) return { valid: false, message: "Gender is required" };
  if (!data.birthDate) return { valid: false, message: "Date of birth is required" };
  if (!data.heightCm) return { valid: false, message: "Valid height is required" };
  if (!data.startWeight) return { valid: false, message: "Start weight is required" };
  if (!data.goalWeight) return { valid: false, message: "Goal weight is required" };
  if (!data.activityLevel) return { valid: false, message: "Activity level is required" };
  if (!data.dietaryGoal) return { valid: false, message: "Dietary goal is required" };
  return { valid: true };
};

// ============================================
// SIGNUP HANDLER
// ============================================

const signup = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('Received signup data:', req.body);
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // 1. VALIDATE INPUT
    const validation = validateSignUpData({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // 2. CHECK IF EMAIL ALREADY EXISTS
    const emailCheckResult = await client.query(
      'SELECT user_id FROM users  WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (emailCheckResult.rows.length > 0) {
      await client.release();
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3. HASH PASSWORD
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. BEGIN TRANSACTION
    await client.query("BEGIN");

    try {
      // 5. CREATE USER
      const userId = uuidv4();
      const userInsertResult = await client.query(
        `INSERT INTO users (
          user_id,
          email,
          first_name,
          last_name,
          password_hash,
          gender,
          birth_date,
          height_cm,
          is_active,
          start_weight_kg,
          current_weight_kg,
          goal_weight_kg,
          activity_level,
          dietary_goal,
          goal_origin,
          target_calories,
          target_protein_g,
          target_carbs_g,
          target_fat_g,
          target_fiber_g,
          macro_goal_origin,
          onboarding_completed,
          tried_other_apps,
          primary_goal,
          diet_type,
          created_at,
          updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,NOW(),NOW()
        )
        RETURNING user_id, email, first_name, last_name`,
        [
          userId,
          email,
          firstName.trim(),
          lastName.trim(),
          passwordHash,
          "male",       // gender
          null,         // birth_date (default null if unknown)
          170,          // height_cm
          true,         // is_active
          70,           // start_weight_kg
          70,           // current_weight_kg
          65,           // goal_weight_kg
          null,         // activity_level
          null,         // dietary_goal
          "Standard",   // goal_origin
          2000,         // target_calories
          120,          // target_protein_g
          250,          // target_carbs_g
          60,           // target_fat_g
          30,           // target_fiber_g
          "Standard",   // macro_goal_origin
          false,        // onboarding_completed
          false,        // tried_other_apps
          null,         // primary_goal
          "Classic"     // diet_type
        ]
      );

      if (userInsertResult.rows.length === 0) {
        await client.query("ROLLBACK");
        await client.release();
        return res.status(500).json({
          success: false,
          message: "Failed to create user",
        });
      }

      // 7. COMMIT TRANSACTION
      await client.query("COMMIT");

      // 8. RETURN SUCCESS RESPONSE
      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        userId: userId,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("SignUp Error:", error);

    if (error.message.includes("duplicate key value")) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.release();
  }
};

// ============================================
// ONBOARDING HANDLER
// ============================================

const completeOnboarding = async (req, res) => {
  const client = await pool.connect();

  try {
    const { userId } = req.params;
    const {
      gender,
      birthDate,
      heightCm,
      startWeight,
      goalWeight,
      activityLevel,
      dietaryGoal,
      triedOtherApps,
      dietType,
      primaryGoal,
    } = req.body;

    // 1. VALIDATE INPUT
    const validation = validateOnboardingData({
      gender,
      birthDate,
      heightCm,
      startWeight,
      goalWeight,
      activityLevel,
      dietaryGoal,
      dietType,
      primaryGoal,
      triedOtherApps,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // 2. BEGIN TRANSACTION
    await client.query("BEGIN");

    try {
      // 3. UPDATE USER TABLE
      const updateResult = await client.query(
        `UPDATE users
        SET 
          gender = $1,
          birth_date = $2,
          height_cm = $3,
          start_weight_kg = $4,
          goal_weight_kg = $5,
          activity_level = $6,
          dietary_goal = $7,
          diet_type = $8,
          primary_goal = $9,
          tried_other_apps = $10,
          onboarding_completed = true,
          updated_at = NOW()
        WHERE user_id = $11`,
        [
          gender,
          birthDate || null,
          heightCm,
          startWeight,
          goalWeight,
          activityLevel,
          dietaryGoal || null,
          dietType,
          primaryGoal,
          triedOtherApps,
          userId,
        ]
      );

      // 5. COMMIT TRANSACTION
      await client.query("COMMIT");

      const user = updateResult.rows[0];

      // 7. RETURN SUCCESS RESPONSE
      return res.status(200).json({
        success: true,
        message: "Onboarding completed successfully",
        user: user,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("Complete Onboarding Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.release();
  }
};

// ============================================
// LOGIN HANDLER
// ============================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDATE INPUT
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. GET USER BY EMAIL (include profile columns)
    const userResult = await pool.query(
      `SELECT 
         user_id, email, first_name, last_name, password_hash, is_active,
         gender, birth_date, height_cm,
         start_weight_kg, current_weight_kg, goal_weight_kg,
         activity_level, dietary_goal, goal_origin,
         target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g,
         macro_goal_origin, onboarding_completed, tried_other_apps, primary_goal, diet_type
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    // 3. CHECK IF USER IS ACTIVE
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // 4. VERIFY PASSWORD
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. GENERATE JWT
    const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
    );

    // Check if onboarding is completed
    if (!user.onboarding_completed) {
      return res.status(200).json({
        success: true,
        message: "Login successful, onboarding pending",
        token,
        onboardingRequired: true,
        user: {
          userId: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      });
    }

    // 6. RETURN SUCCESS WITH USER DATA
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        gender: user.gender,
        birthDate: user.birth_date,
        heightCm: user.height_cm,
        startWeight: user.start_weight_kg,
        currentWeight: user.current_weight_kg,
        goalWeight: user.goal_weight_kg,
        activityLevel: user.activity_level,
        dietaryGoal: user.dietary_goal,
        goalOrigin: user.goal_origin,
        targetCalories: user.target_calories,
        targetProtein: user.target_protein_g,
        targetCarbs: user.target_carbs_g,
        targetFat: user.target_fat_g,
        targetFiber: user.target_fiber_g,
        macroGoalOrigin: user.macro_goal_origin,
        onboardingComplete: user.onboarding_completed,
        triedOtherApps: user.tried_other_apps,
        primaryGoal: user.primary_goal,
        dietType: user.diet_type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET USER PROFILE
// ============================================

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await pool.query(
      `SELECT user_id, email, first_name, last_name, gender, birth_date, height_cm
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    const profileResult = await pool.query(
      `SELECT * FROM user_profile WHERE user_id = $1`,
      [userId]
    );

    const profile = profileResult.rows[0] || null;

    return res.status(200).json({
      success: true,
      user: user,
      profile: profile,
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, gender, birthDate, heightCm } = req.body;

    // Dynamically build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName.trim());
    }
    if (lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName.trim());
    }
    if (gender) {
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (birthDate) {
      updates.push(`birth_date = $${paramCount++}`);
      values.push(birthDate);
    }
    if (heightCm) {
      updates.push(`height_cm = $${paramCount++}`);
      values.push(heightCm);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // Always update the timestamp
    updates.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE user_id = $${paramCount}
      RETURNING 
        user_id, email, first_name, last_name, gender, birth_date, height_cm,
        start_weight_kg, current_weight_kg, goal_weight_kg,
        activity_level, dietary_goal, goal_origin,
        target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g,
        macro_goal_origin, onboarding_completed, tried_other_apps, primary_goal, diet_type
    `;
    values.push(userId);

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// UPDATE USER PROFILE GOALS
// ============================================

const updateUserProfileGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      startWeightKg,
      goalWeightKg,
      activityLevel,
      dietaryGoal,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatG,
      targetFiberG,
    } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET
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
       RETURNING *
      `,
      [
        startWeightKg,
        goalWeightKg,
        activityLevel,
        dietaryGoal,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatG,
        targetFiberG,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile goals updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update Profile Goals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Generate a secure reset token
 * @returns { token: string, hash: string }
 */
const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Plain reset token (for email)
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  // TODO: Implement email sending using nodemailer or similar
  // Example:
  // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  // await sendEmail(email, 'Password Reset Request', resetLink);
  
  console.log(`[EMAIL] Password reset token for ${email}: ${resetToken}`);
  // For now, just log it for testing
};

const requestPasswordReset = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    // 1. VALIDATE INPUT
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // 2. FIND USER BY EMAIL
    const userResult = await client.query(
      'SELECT user_id, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: "If this email exists, you'll receive a password reset link",
      });
    }

    const user = userResult.rows[0];

    // 3. GENERATE RESET TOKEN
    const { token, hash } = generateResetToken();
    
    // 4. CALCULATE EXPIRY TIME (1 hour from now)
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // 5. BEGIN TRANSACTION
    await client.query("BEGIN");

    try {
      // 6. INSERT RESET TOKEN INTO password_reset_tokens TABLE
      const tokenResult = await client.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, created_at, expires_at)
         VALUES ($1, $2, NOW(), $3)
         RETURNING token_id`,
        [user.user_id, hash, expiresAt]
      );

      if (tokenResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          message: "Failed to create reset token",
        });
      }

      // 7. COMMIT TRANSACTION
      await client.query("COMMIT");

      // 8. SEND EMAIL WITH RESET TOKEN
      await sendPasswordResetEmail(user.email, token);

      // 9. RETURN SUCCESS
      return res.status(200).json({
        success: true,
        message: "Password reset email sent. Please check your inbox.",
      });

    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    }

  } catch (error) {
    console.error("Request Password Reset Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.release();
  }
};

const resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token, newPassword } = req.body;

    // 1. VALIDATE INPUT
    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // 2. VALIDATE PASSWORD STRENGTH
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // 3. HASH THE TOKEN TO FIND IT IN DATABASE
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 4. BEGIN TRANSACTION
    await client.query("BEGIN");

    try {
      // 5. FIND VALID RESET TOKEN
      const tokenResult = await client.query(
        `SELECT token_id, user_id FROM password_reset_tokens
         WHERE token_hash = $1 
         AND expires_at > NOW() 
         AND used_at IS NULL
         LIMIT 1`,
        [tokenHash]
      );

      if (tokenResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      const resetToken = tokenResult.rows[0];

      // 6. HASH NEW PASSWORD
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // 7. UPDATE USER PASSWORD
      const updateResult = await client.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING user_id`,
        [passwordHash, resetToken.user_id]
      );

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 8. MARK RESET TOKEN AS USED
      await client.query(
        `UPDATE password_reset_tokens 
         SET used_at = NOW()
         WHERE token_id = $1`,
        [resetToken.token_id]
      );

      // 9. COMMIT TRANSACTION
      await client.query("COMMIT");

      // 10. RETURN SUCCESS
      return res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      });

    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    }

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.release();
  }
};

const logout = async (req, res) => {
  try {
    // If you implement token blacklisting, add the token to blacklist here
    // const token = req.headers.authorization?.split(' ')[1];
    // await blacklistToken(token);

    // Otherwise, just respond success
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

module.exports = {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  updateUserProfileGoals,
  completeOnboarding,
  requestPasswordReset,
  resetPassword,
  logout
};