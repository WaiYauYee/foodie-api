// routes/waterRoute.js
const express = require("express");
const { addWater, reduceWater } = require("../controller/diaryController");
const {
  authenticateToken,
  authorizeSelf,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:userId", authenticateToken, authorizeSelf, addWater);
router.post("/:userId/reduce", authenticateToken, authorizeSelf, reduceWater);

module.exports = router;