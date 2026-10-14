// controller/accountController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const { validateEmail, validatePassword } = require("../utils/validators");
const { toUserDto } = require("./authController");

const saltRounds = 10;

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Confirms the caller knows the account password. Returns true/false.
const confirmPassword = async (userId, password) => {
  if (!password || typeof password !== "string") return false;
  const hash = await UserModel.getPasswordHash(userId);
  return hash ? bcrypt.compare(password, hash) : false;
};

// PUT /api/auth/password/:userId   body: { currentPassword, newPassword, confirmPassword }
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword: confirm } = req.body;

    if (!currentPassword || !newPassword)
      return fail(res, 400, "Current and new password are required");
    if (confirm !== undefined && confirm !== newPassword)
      return fail(res, 400, "Passwords do not match");

    const v = validatePassword(newPassword);
    if (!v.valid) return fail(res, 400, v.message);

    if (!(await confirmPassword(userId, currentPassword)))
      return fail(res, 401, "Current password is incorrect");
    if (currentPassword === newPassword)
      return fail(res, 400, "New password must be different from the current one");

    const hash = await bcrypt.hash(newPassword, saltRounds);
    const ok = await UserModel.updatePassword(userId, hash);
    if (!ok) return fail(res, 404, "User not found");

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return serverError(res, "Change Password Error", error);
  }
};

// PUT /api/auth/email/:userId   body: { email, password }
const changeEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!validateEmail(email)) return fail(res, 400, "Valid email is required");

    const current = await UserModel.findById(userId);
    if (!current) return fail(res, 404, "User not found");
    if (current.email.toLowerCase() === email) return fail(res, 400, "That is already your email");

    if (await UserModel.emailExists(email)) return fail(res, 409, "Email already registered");

    await UserModel.updateEmail(userId, email);
    const user = await UserModel.findById(userId);

    // JWT carries the email, so issue a fresh one
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      token,
      user: toUserDto(user),
    });
  } catch (error) {
    if (error.code === "23505") return fail(res, 409, "Email already registered");
    return serverError(res, "Change Email Error", error);
  }
};

// DELETE /api/auth/account/:userId   body: { password }
const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!(await confirmPassword(userId, req.body && req.body.password)))
      return fail(res, 401, "Password is incorrect");

    const ok = await UserModel.softDelete(userId);
    if (!ok) return fail(res, 404, "User not found");

    return res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    return serverError(res, "Delete Account Error", error);
  }
};

module.exports = { changePassword, changeEmail, deleteAccount };