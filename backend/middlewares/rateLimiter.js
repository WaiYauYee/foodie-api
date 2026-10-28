// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const createLimiter = (message, max = 10, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

module.exports = {
  resetLimiter: createLimiter("Too many requests. Try again later."),
  sensitiveLimiter: createLimiter("Too many attempts. Try again later."),
};