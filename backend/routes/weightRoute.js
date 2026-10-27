// routes/weightRoute.js
const express = require("express");
const { listWeights, addWeight, deleteWeight } = require("../controller/weightController");
const { authenticateToken, authorizeSelf } = require("../middlewares/authMiddleware");

const weightRouter = express.Router();

weightRouter.get("/:userId", authenticateToken, authorizeSelf, listWeights);
weightRouter.post("/:userId", authenticateToken, authorizeSelf, addWeight);
weightRouter.delete("/:userId/:entryId", authenticateToken, authorizeSelf, deleteWeight);

module.exports = weightRouter;