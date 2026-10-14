const express = require("express");
const { getNotificationSettings, updateNotificationSettings } = require("../controller/notificationController");
const { authenticateToken, authorizeSelf } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get("/:userId", authenticateToken, authorizeSelf, getNotificationSettings);
router.put("/:userId", authenticateToken, authorizeSelf, updateNotificationSettings);

module.exports = router;