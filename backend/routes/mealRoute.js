// routes/mealRoute.js
const express = require("express");
const {
  createMeal,
  updateMeal,
  deleteMeal,
} = require("../controller/diaryController");
const {
  authenticateToken,
  authorizeSelf,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:userId", authenticateToken, authorizeSelf, createMeal);
router.put("/:userId/:mealId", authenticateToken, authorizeSelf, updateMeal);
router.delete("/:userId/:mealId", authenticateToken, authorizeSelf, deleteMeal);

module.exports = router;
