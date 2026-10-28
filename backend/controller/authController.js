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
const { sendPasswordResetEmail } = require("../utils/mailer");
const RevokedTokenModel = require("../models/revokedTokenModel");
const EmailVerificationTokenModel = require("../models/emailVerificationTokenModel");
const { sendVerificationEmail } = require("../utils/mailer");

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
  targetWater: u.target_water_ml,
});

// ---------------- SIGNUP ----------------

// ============================================
// SIGNUP HANDLER
// ============================================

const signup = async (req, res) => {

  try {
    // console.log('Received signup data:', req.body);
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
    const existing = await UserModel.findSignupAccountByEmail(email);
    if (existing && existing.email_verified_at) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // 3. HASH PASSWORD
    const passwordHash = await bcrypt.hash(password, saltRounds);
    let target;

    if (existing) {
      // Abandoned, never-verified signup: safe to overwrite
      await UserModel.updateUnverifiedSignup(existing.user_id, { firstName, lastName, passwordHash });
      target = { user_id: existing.user_id, email: existing.email };
    } else {
      const userId = uuidv4();
      await UserModel.create({ userId, email, firstName, lastName, passwordHash });
      target = { user_id: userId, email };
    }

    // 4. SEND VERIFICATION CODE
    await issueVerificationCode(target, req.ip);

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email for a verification code.",
      verificationRequired: true,
      email,
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

    // Avoid user to probe verification status
    if (!user.email_verified_at) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
        email: user.email,
      });
    }

    // 5. GENERATE JWT
    const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d', jwtid: uuidv4() }
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

const num = (v, min, max) =>
  v === undefined || v === null || (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max);

const ACTIVITY = ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"];
const DIETARY = ["maintain", "gradual_gain", "rapid_gain", "gradual_lose", "rapid_lose"];
const ORIGINS = ["standard", "custom"];
const norm = (v) => String(v).trim().toLowerCase().replace(/[\s-]+/g, "_");

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const b = req.body;

    if (b.gender && !["male", "female"].includes(norm(b.gender)))
      return res.status(400).json({ success: false, message: "Invalid gender" });
    if (!num(b.heightCm, 100, 250))
      return res.status(400).json({ success: false, message: "Height must be between 100 and 250 cm" });
    if (b.birthDate && !(new Date(b.birthDate) < new Date()))
      return res.status(400).json({ success: false, message: "Birth date must be in the past" });
    if (b.firstName !== undefined && !String(b.firstName).trim())
      return res.status(400).json({ success: false, message: "First name cannot be empty" });
    if (b.lastName !== undefined && !String(b.lastName).trim())
      return res.status(400).json({ success: false, message: "Last name cannot be empty" });

    const user = await UserModel.updateProfile(userId, b);
    if (user === undefined)
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    if (user === null)
      return res.status(404).json({ success: false, message: "User not found" });

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
    const g = req.body;

    const bad = (message) => res.status(400).json({ success: false, message });

    if (!num(g.startWeightKg, 20, 500) || !num(g.goalWeightKg, 20, 500))
      return bad("Weight must be between 20 and 500 kg");
    if (!num(g.targetCalories, 800, 6000)) return bad("Calories must be between 800 and 6000");
    if (!num(g.targetWaterMl, 500, 8000)) return bad("Water goal must be between 500 and 8000 ml");
    for (const k of ["targetProteinG", "targetCarbsG", "targetFatG", "targetFiberG"])
      if (!num(g[k], 0, 2000)) return bad(`${k} is out of range`);
    if (g.activityLevel && !ACTIVITY.includes(norm(g.activityLevel))) return bad("Invalid activity level");
    if (g.dietaryGoal && !DIETARY.includes(norm(g.dietaryGoal).replace(/_weight$/, "")))
      return bad("Invalid dietary goal");
    if (g.goalOrigin && !ORIGINS.includes(norm(g.goalOrigin))) return bad("Invalid goal origin");
    if (g.macroGoalOrigin && !ORIGINS.includes(norm(g.macroGoalOrigin))) return bad("Invalid macro origin");

    const user = await UserModel.updateGoals(userId, g);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or onboarding not completed" });
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
// const sendPasswordResetEmail = async (email, resetToken) => {
//   // TODO: Implement email sending using nodemailer or similar
//   // Example:
//   // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
//   // await sendEmail(email, 'Password Reset Request', resetLink);
  
//   console.log(`[EMAIL] Password reset token for ${email}: ${resetToken}`);
//   // For now, just log it for testing
// };

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

    const generic = () =>
      res.status(200).json({
        success: true,
        message: "If this email is registered, a reset code has been sent.",
      });

    // 2. FIND USER
    const user = await UserModel.findByEmail(email);

    // Email is not registered
    if (!user) return generic();

    // Check the 60-second SERVER-SIDE cooldown
    const latest = await PasswordResetTokenModel.findLatestActive(user.user_id);
    if (latest && Date.now() - new Date(latest.created_at).getTime() < 60 * 1000) {
      return generic(); // silently skip; don't send another email
    }

    // 3. GENERATE 6-DIGIT OTP
    const code = crypto.randomInt(100000, 1000000).toString();

    // 4. HASH OTP BEFORE STORING
    const codeHash = hashToken(code);

    // 5. INVALIDATE OLD CODES, THEN STORE NEW ONE
    await PasswordResetTokenModel.invalidateAllForUser(user.user_id);
    await PasswordResetTokenModel.create({
      userId: user.user_id,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      requestedIp: req.ip,
    });

    // 6. SEND EMAIL (a failure must not change the generic response)
    try {
      console.log("Sending reset email to:", user.email);
      await sendPasswordResetEmail(user.email, code);
      console.log("Reset email sent");
    } catch (mailError) {
      console.error("Send reset email failed:", mailError);
    }

    // 7. GENERIC RESPONSE
    return generic();

  } catch (error) {
    console.error("Request Password Reset Error:", error);

    return serverError(res, "Request Password Reset Error", error);
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Valid 6-digit reset code is required" });
    }

    const invalid = () =>
      res.status(400).json({ success: false, message: "Invalid or expired reset code" });

    const user = await UserModel.findByEmail(email);
    if (!user) return invalid();

    const outcome = await withTransaction(async (client) => {
      const token = await PasswordResetTokenModel.findLatestActive(user.user_id, client);
      if (!token) return "INVALID_CODE";
      if (token.attempts >= 5) return "TOO_MANY_ATTEMPTS";

      if (token.code_hash !== hashToken(code)) {
        await PasswordResetTokenModel.incrementAttempts(token.id, client);
        return "INVALID_CODE";
      }
      return "OK"; // correct, but NOT marked as used yet
    });

    if (outcome === "INVALID_CODE") return invalid();
    if (outcome === "TOO_MANY_ATTEMPTS") {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new reset code.",
      });
    }

    return res.status(200).json({ success: true, message: "Code verified" });
  } catch (error) {
    return serverError(res, "Verify Reset Code Error", error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Valid 6-digit reset code is required" });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const invalid = () =>
      res.status(400).json({ success: false, message: "Invalid or expired reset code" });

    const user = await UserModel.findByEmail(email);
    if (!user) return invalid();

    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const outcome = await withTransaction(async (client) => {
      const token = await PasswordResetTokenModel.findLatestActive(user.user_id, client);
      if (!token) return "INVALID_CODE";

      if (token.attempts >= 5) return "TOO_MANY_ATTEMPTS";

      if (token.code_hash !== hashToken(code)) {
        await PasswordResetTokenModel.incrementAttempts(token.id, client);
        return "INVALID_CODE";
      }

      const updated = await UserModel.updatePassword(user.user_id, passwordHash, client);
      if (!updated) return "INVALID_CODE";

      await PasswordResetTokenModel.markUsed(token.id, client);
      return "OK";
    });

    if (outcome === "INVALID_CODE") return invalid();
    if (outcome === "TOO_MANY_ATTEMPTS") {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new reset code.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return serverError(res, "Reset Password Error", error);
  }
};

// ---------------- LOGOUT ----------------

const logout = async (req, res) => {
  try {
    console.log("logout req.user:", req.user);
    const { jti, userId, exp } = req.user || {};
    if (jti && exp) {
      await RevokedTokenModel.revoke(jti, userId, new Date(exp * 1000));
    }
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return serverError(res, "Logout Error", error);
  }
};

// ---------------- VERIFY EMAIL ON SIGN UP ----------------

// Generates + stores + emails a code. Never throws on mail failure (user can resend).
const issueVerificationCode = async (user, ip) => {
  const code = crypto.randomInt(100000, 1000000).toString();
  await EmailVerificationTokenModel.invalidateAllForUser(user.user_id);
  await EmailVerificationTokenModel.create({
    userId: user.user_id,
    codeHash: hashToken(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    requestedIp: ip,
  });
  try {
    await sendVerificationEmail(user.email, code);
  } catch (e) {
    console.error("Send verification email failed:", e);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !validateEmail(email))
      return res.status(400).json({ success: false, message: "Valid email is required" });
    if (!code || !/^\d{6}$/.test(code))
      return res.status(400).json({ success: false, message: "Valid 6-digit code is required" });

    const invalid = () =>
      res.status(400).json({ success: false, message: "Invalid or expired verification code" });

    const user = await UserModel.findSignupAccountByEmail(email);
    if (!user) return invalid();
    if (user.email_verified_at)
      return res.status(200).json({ success: true, message: "Email already verified" });

    const outcome = await withTransaction(async (client) => {
      const token = await EmailVerificationTokenModel.findLatestActive(user.user_id, client);
      if (!token) return "INVALID_CODE";
      if (token.attempts >= 5) return "TOO_MANY_ATTEMPTS";

      if (token.code_hash !== hashToken(code)) {
        await EmailVerificationTokenModel.incrementAttempts(token.id, client);
        return "INVALID_CODE";
      }
      await UserModel.markEmailVerified(user.user_id, client);
      await EmailVerificationTokenModel.markUsed(token.id, client);
      return "OK";
    });

    if (outcome === "INVALID_CODE") return invalid();
    if (outcome === "TOO_MANY_ATTEMPTS")
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new code.",
      });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return serverError(res, "Verify Email Error", error);
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validateEmail(email))
      return res.status(400).json({ success: false, message: "Valid email is required" });

    const generic = () =>
      res.status(200).json({
        success: true,
        message: "If this email needs verification, a new code has been sent.",
      });

    const user = await UserModel.findSignupAccountByEmail(email);
    if (!user || user.email_verified_at) return generic();

    const latest = await EmailVerificationTokenModel.findLatestActive(user.user_id);
    if (latest && Date.now() - new Date(latest.created_at).getTime() < 60 * 1000)
      return generic(); // 60s server-side cooldown

    await issueVerificationCode(user, req.ip);
    return generic();
  } catch (error) {
    return serverError(res, "Resend Verification Error", error);
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
  verifyResetCode,
  resetPassword,
  logout,
  toUserDto,
  verifyEmail,
  resendVerification
};