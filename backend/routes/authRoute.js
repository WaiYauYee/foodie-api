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
} = require("../controller/authController");
const { authenticateToken, authorizeSelf } = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth routes
// Public
router.post("/signup", signup);
router.post("/login", login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected
router.post('/logout', authenticateToken, logout);
router.post('/onboarding/:userId', authenticateToken, authorizeSelf, completeOnboarding);
router.get("/profile/:userId", authenticateToken, authorizeSelf, getUserProfile);
router.put("/profile/:userId", authenticateToken, authorizeSelf, updateUserProfile);
router.put("/profile/:userId/goals", authenticateToken, authorizeSelf, updateUserProfileGoals);

module.exports = router;