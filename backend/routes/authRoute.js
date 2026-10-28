// routes/authRoute.js — Public authentication routes: signup, login, logout, password reset.
const express = require("express");
const {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  logout,
  verifyResetCode
} = require("../controller/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authLimiter, resetLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// Entry
router.post("/signup", signup);
router.post("/login", login);

// Password reset flow
router.post('/request-password-reset', resetLimiter, requestPasswordReset);
router.post('/reset-password', resetLimiter, resetPassword);
router.post("/verify-reset-code", resetLimiter, verifyResetCode);

// Exit (needs a valid session)
router.post('/logout', authenticateToken, logout);

module.exports = router;