// routes/dashboardRoute.js
const express = require("express");
const { getDashboard } = require("../controller/dashboardController");
const { listWeights, addWeight, deleteWeight } = require("../controller/weightController");
const { authenticateToken, authorizeSelf } = require("../middlewares/authMiddleware");

// Mounted twice in server.js:
//   app.use("/api/dashboard", dashboardRouter)  -> GET /:userId
//   app.use("/api/weight",    weightRouter)     -> GET/POST /:userId, DELETE /:userId/:entryId
const dashboardRouter = express.Router();
dashboardRouter.get("/:userId", authenticateToken, authorizeSelf, getDashboard);

const weightRouter = express.Router();
weightRouter.get("/:userId", authenticateToken, authorizeSelf, listWeights);
weightRouter.post("/:userId", authenticateToken, authorizeSelf, addWeight);
weightRouter.delete("/:userId/:entryId", authenticateToken, authorizeSelf, deleteWeight);

module.exports = { dashboardRouter, weightRouter };