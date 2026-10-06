// controller/authController.js
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken'); 

const withTransaction = require("../db/withTransaction");
const UserModel = require("../models/userModel");
const PasswordResetTokenModel = require("../models/passwordResetTokenModel");
const {
  validateEmail,
  validatePassword,
  validateSignUpData,
  validateOnboardingData,
} = require("../utils/validators");

const saltRounds = 10;

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

// DB row (snake_case) -> API shape (camelCase)
const toUserDto = (u) => ({
  userId: u.user_id,
  email: u.email,
  firstName: u.first_name,
  lastName: u.last_name,
  gender: u.gender,
  birthDate: u.birth_date,
  heightCm: u.height_cm,
  startWeight: u.start_weight_kg,
  currentWeight: u.current_weight_kg,
  goalWeight: u.goal_weight_kg,
  activityLevel: u.activity_level,
  dietaryGoal: u.dietary_goal,
  goalOrigin: u.goal_origin,
  targetCalories: u.target_calories,
  targetProtein: u.target_protein_g,
  targetCarbs: u.target_carbs_g,
  targetFat: u.target_fat_g,
  targetFiber: u.target_fiber_g,
  macroGoalOrigin: u.macro_goal_origin,
  onboardingComplete: u.onboarding_completed,
  triedOtherApps: u.tried_other_apps,
  primaryGoal: u.primary_goal,
  dietType: u.diet_type,
});

// ---------------- SIGNUP ----------------

// ============================================
// SIGNUP HANDLER
// ============================================

const signup = async (req, res) => {

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
    if (await UserModel.emailExists(email)) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // 3. HASH PASSWORD
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    await UserModel.create({ userId, email, firstName, lastName, passwordHash });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      userId,
    });

  } catch (error) {
    if (error.code === "23505") {
      // unique violation (race condition on email)
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    return serverError(res, "SignUp Error", error);
  }
};

// ---------------- ONBOARDING ----------------

// ============================================
// ONBOARDING HANDLER
// ============================================

const completeOnboarding = async (req, res) => {

  try {
    const { userId } = req.params;

    // 1. VALIDATE INPUT
    const validation = validateOnboardingData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const user = await UserModel.completeOnboarding(userId, req.body);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
 
    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: toUserDto(user),
    });

  } catch (error) {
    return serverError(res, "Complete Onboarding Error", error);
  }
};

// ---------------- LOGIN ----------------

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
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

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
      user: toUserDto(user),
    });
  } catch (error) {
    return serverError(res, "Login Error", error);
  }
};

// ---------------- PROFILE ----------------

// ============================================
// GET USER PROFILE
// ============================================

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = await UserModel.findExtendedProfile(userId);

    return res.status(200).json({ success: true, user: toUserDto(user), profile });
  } catch (error) {
    return serverError(res, "Get User Profile Error", error);
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.updateProfile(userId, req.body);

    if (user === undefined) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }
    if (user === null) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toUserDto(user),
    });
  } catch (error) {
    return serverError(res, "Update Profile Error", error);
  }
};

// ============================================
// UPDATE USER PROFILE GOALS
// ============================================

const updateUserProfileGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.updateGoals(userId, req.body);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
 
    return res.status(200).json({
      success: true,
      message: "Profile goals updated successfully",
      user: toUserDto(user),
    });
  } catch (error) {
    return serverError(res, "Update Profile Goals Error", error);
  }
};

// ---------------- PASSWORD RESET ----------------

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
  try {
    const { email } = req.body;

    // 1. VALIDATE INPUT
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // 2. FIND USER
    const user = await UserModel.findByEmail(email);

    // Keep response generic for security
    const genericResponse = {
      success: true,
      message: "If this email exists, you'll receive a password reset code",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // 3. GENERATE 6-DIGIT OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. HASH OTP BEFORE STORING
    const codeHash = hashToken(code);

    // 5. STORE RESET CODE
    await PasswordResetTokenModel.create({
      userId: user.user_id,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      requestedIp: req.ip,
    });

    // 6. SEND OTP TO USER
    await sendPasswordResetEmail(user.email, code);

    // 7. GENERIC RESPONSE
    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error("Request Password Reset Error:", error);

    return serverError(res, "Request Password Reset Error", error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    // 1. VALIDATE OTP
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit reset code is required",
      });
    }

    // 2. VALIDATE PASSWORD
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // 3. VALIDATE PASSWORD STRENGTH
    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // 4. HASH NEW PASSWORD
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 5. FIND OTP + UPDATE PASSWORD IN ONE TRANSACTION
    const outcome = await withTransaction(async (client) => {
      const resetToken = await PasswordResetTokenModel.findValid(
        hashToken(code),
        client
      );

      if (!resetToken) {
        return "INVALID_CODE";
      }

      // Optional: prevent excessive attempts
      if (resetToken.attempts >= 5) {
        return "TOO_MANY_ATTEMPTS";
      }

      const updated = await UserModel.updatePassword(
        resetToken.user_id,
        passwordHash,
        client
      );

      if (!updated) {
        return "USER_NOT_FOUND";
      }

      await PasswordResetTokenModel.markUsed(
        resetToken.id,
        client
      );

      return "OK";
    });

    // 6. HANDLE RESULT
    if (outcome === "INVALID_CODE") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    if (outcome === "TOO_MANY_ATTEMPTS") {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new reset code.",
      });
    }

    if (outcome === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 7. SUCCESS
    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    return serverError(res, "Reset Password Error", error);
  }
};

// ---------------- LOGOUT ----------------

const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out successfully" });
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