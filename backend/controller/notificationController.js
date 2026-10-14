// controller/notificationController.js
const NotificationModel = require("../models/notificationModel");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MEALS = ["breakfast", "lunch", "dinner"]; // DB forbids 'snack'
const BOOLS = ["mealRemindersEnabled", "waterReminderEnabled", "weightRemindersEnabled"];

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

// GET /api/notifications/:userId
const getNotificationSettings = async (req, res) => {
  try {
    const settings = await NotificationModel.get(req.params.userId);
    if (!settings) return res.status(404).json({ success: false, message: "Settings not found" });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return serverError(res, "Get Notifications Error", error);
  }
};

// PUT /api/notifications/:userId
// body (all optional): { mealRemindersEnabled, waterReminderEnabled, weightRemindersEnabled,
//                        mealTimes: [{ mealType: "breakfast", time: "07:45" }] }
const updateNotificationSettings = async (req, res) => {
  try {
    const body = req.body || {};

    for (const k of BOOLS) {
      if (body[k] !== undefined && typeof body[k] !== "boolean")
        return res.status(400).json({ success: false, message: `${k} must be true or false` });
    }
    if (body.mealTimes !== undefined) {
      if (!Array.isArray(body.mealTimes))
        return res.status(400).json({ success: false, message: "mealTimes must be an array" });
      for (const t of body.mealTimes) {
        if (!MEALS.includes(t.mealType) || !TIME_RE.test(t.time || ""))
          return res.status(400).json({
            success: false,
            message: "Each meal time needs mealType (breakfast|lunch|dinner) and time as HH:MM",
          });
      }
    }

    const settings = await NotificationModel.update(req.params.userId, body);
    if (!settings) return res.status(404).json({ success: false, message: "Settings not found" });

    return res.status(200).json({ success: true, message: "Notification settings saved", settings });
  } catch (error) {
    return serverError(res, "Update Notifications Error", error);
  }
};

module.exports = { getNotificationSettings, updateNotificationSettings };