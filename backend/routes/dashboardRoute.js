// routes/dashboardRoute.js — Private dashboard route: get the logged-in user's dashboard summary.
const express = require("express");
const { getDashboard } = require("../controller/dashboardController");
const { authenticateToken, authorizeSelf } = require("../middlewares/authMiddleware");

// Mounted twice in server.js:
//   app.use("/api/dashboard", dashboardRouter)  -> GET /:userId
//   app.use("/api/weight",    weightRouter)     -> GET/POST /:userId, DELETE /:userId/:entryId
const dashboardRouter = express.Router();
dashboardRouter.get("/:userId", authenticateToken, authorizeSelf, getDashboard);

module.exports = dashboardRouter;