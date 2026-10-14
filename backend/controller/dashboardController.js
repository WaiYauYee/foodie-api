// controller/dashboardController.js
const UserModel = require("../models/userModel");
const WeightModel = require("../models/weightModel");
const DashboardModel = require("../models/dashboardModel");

const ALLOWED_RANGES = [7, 30, 90];

const r0 = (n) => Math.round(Number(n) || 0);
const r1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

const roundDay = (d) => ({
  date: d.date,
  calories: r0(d.calories),
  protein: r1(d.protein),
  carbs: r1(d.carbs),
  fat: r1(d.fat),
  fiber: r1(d.fiber),
  waterMl: d.waterMl,
  mealCount: d.mealCount,
  logged: d.logged,
});

// Average over days that actually have a log (so empty days don't drag it down)
const averageOf = (days) => {
  const logged = days.filter((d) => d.logged);
  const n = logged.length;
  const avg = (key) => (n ? logged.reduce((s, d) => s + d[key], 0) / n : 0);
  return {
    daysLogged: n,
    calories: r0(avg("calories")),
    protein: r1(avg("protein")),
    carbs: r1(avg("carbs")),
    fat: r1(avg("fat")),
    fiber: r1(avg("fiber")),
  };
};

// GET /api/dashboard/:userId?range=7|30|90
const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const range = req.query.range === undefined ? 7 : Number(req.query.range);
    if (!ALLOWED_RANGES.includes(range)) {
      return res.status(400).json({
        success: false,
        message: `range must be one of ${ALLOWED_RANGES.join(", ")}`,
      });
    }

    const [user, history, entries] = await Promise.all([
      UserModel.findById(userId),
      DashboardModel.getDailyHistory(userId, range),
      WeightModel.list(userId, 365),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const days = history.map(roundDay);
    const today = days[days.length - 1];

    const current = user.current_weight_kg != null ? Number(user.current_weight_kg) : null;
    const start = user.start_weight_kg != null ? Number(user.start_weight_kg) : null;
    const goal = user.goal_weight_kg != null ? Number(user.goal_weight_kg) : null;
    const heightM = user.height_cm != null ? Number(user.height_cm) / 100 : null;

    const bmi = current && heightM ? Math.round((current / (heightM * heightM)) * 100) / 100 : null;

    return res.status(200).json({
      success: true,
      range,
      today,
      history: days,
      averages: averageOf(days),
      weight: {
        start,
        current,
        goal,
        remaining: current != null && goal != null ? r1(current - goal) : null,
        bmi,
        entries, // newest first
      },
    });
  } catch (error) {
    return serverError(res, "Get Dashboard Error", error);
  }
};

module.exports = { getDashboard };