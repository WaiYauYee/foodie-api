// routes/userRoute.js — Private routes: onboarding, profile, and account/security settings.

const express = require("express");
const {
  completeOnboarding,
  getUserProfile,
  updateUserProfile,
  updateUserProfileGoals,
} = require("../controller/authController");
const {
  changePassword,
  changeEmail,
  deleteAccount,
} = require("../controller/accountController");
const { authenticateToken, authorizeSelf } = require("../middlewares/authMiddleware");
const { sensitiveLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// Everything below requires a logged-in user
router.use(authenticateToken);

// Profile
router.post("/onboarding/:userId", authorizeSelf, completeOnboarding);
router.get("/profile/:userId", authorizeSelf, getUserProfile);
router.put("/profile/:userId", authorizeSelf, updateUserProfile);
router.put("/profile/:userId/goals", authorizeSelf, updateUserProfileGoals);

// Account / security (rate limited)
router.put("/password/:userId", authorizeSelf, sensitiveLimiter, changePassword);
router.put("/email/:userId", authorizeSelf, sensitiveLimiter, changeEmail);
router.delete("/account/:userId", authorizeSelf, sensitiveLimiter, deleteAccount);

module.exports = router;