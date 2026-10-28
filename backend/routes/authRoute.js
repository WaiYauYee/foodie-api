// routes/authRoute.js — Public authentication routes: signup, login, logout, password reset.
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
const { resetLimiter, sensitiveLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

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