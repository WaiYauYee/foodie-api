// routes/diaryRoute.js — Private diary route: get the logged-in user's food diary for a given day.
const express = require("express");
const { getDiaryDay } = require("../controller/diaryController");
const {
  authenticateToken,
  authorizeSelf,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:userId", authenticateToken, authorizeSelf, getDiaryDay);

module.exports = router;
