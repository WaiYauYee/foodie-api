// routes/authRoute.js
const express = require("express");
const {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  updateUserProfileGoals,
  completeOnboarding,
  requestPasswordReset,
  resetPassword,
  logout,
  verifyResetCode
} = require("../controller/authController");
const { changePassword, changeEmail, deleteAccount } = require("../controller/accountController");
const { authenticateToken, authorizeSelf } = require('../middlewares/authMiddleware');

const router = express.Router();

const rateLimit = require("express-rate-limit");

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again later." },
});

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});

// Auth routes
// Public
router.post("/signup", signup);
router.post("/login", login);
router.post('/request-password-reset', resetLimiter, requestPasswordReset);
router.post('/reset-password', resetLimiter, resetPassword);
router.post("/verify-reset-code", resetLimiter, verifyResetCode);

// Protected
router.post('/logout', authenticateToken, logout);
router.post('/onboarding/:userId', authenticateToken, authorizeSelf, completeOnboarding);
router.get("/profile/:userId", authenticateToken, authorizeSelf, getUserProfile);
router.put("/profile/:userId", authenticateToken, authorizeSelf, updateUserProfile);
router.put("/profile/:userId/goals", authenticateToken, authorizeSelf, updateUserProfileGoals);

router.put("/password/:userId", authenticateToken, authorizeSelf, sensitiveLimiter, changePassword);
router.put("/email/:userId", authenticateToken, authorizeSelf, sensitiveLimiter, changeEmail);
router.delete("/account/:userId", authenticateToken, authorizeSelf, sensitiveLimiter, deleteAccount);

module.exports = router;