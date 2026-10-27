// routes/diaryRoute.js
const express = require("express");
const { getDiaryDay } = require("../controller/diaryController");
const {
  authenticateToken,
  authorizeSelf,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:userId", authenticateToken, authorizeSelf, getDiaryDay);

module.exports = router;
