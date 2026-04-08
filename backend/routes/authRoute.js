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
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.post('/onboarding/:userId', authenticateToken, completeOnboarding);
router.post('/logout', authenticateToken, logout);

// User profile routes
router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", updateUserProfile);
router.put("/profile/:userId/goals", updateUserProfileGoals);

module.exports = router;