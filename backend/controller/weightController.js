// controller/weightController.js
const WeightModel = require("../models/weightModel");

const MIN_KG = 20;
const MAX_KG = 500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

// GET /api/weight/:userId
const listWeights = async (req, res) => {
  try {
    const entries = await WeightModel.list(req.params.userId);
    return res.status(200).json({ success: true, entries });
  } catch (error) {
    return serverError(res, "List Weights Error", error);
  }
};

// POST /api/weight/:userId   body: { weight, recordedAt?, note? }
const addWeight = async (req, res) => {
  try {
    const { userId } = req.params;
    const { weight, recordedAt, note } = req.body;

    const weightKg = Number(weight);
    if (!Number.isFinite(weightKg) || weightKg < MIN_KG || weightKg > MAX_KG) {
      return res.status(400).json({
        success: false,
        message: `Weight must be between ${MIN_KG} and ${MAX_KG} kg`,
      });
    }

    // recordedAt is optional (ms epoch or ISO string); default = now, future dates rejected
    let recordedIso = null;
    if (recordedAt !== undefined && recordedAt !== null && recordedAt !== "") {
      const d = new Date(recordedAt);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date" });
      }
      if (d.getTime() > Date.now() + 5 * 60 * 1000) {
        return res.status(400).json({ success: false, message: "Date cannot be in the future" });
      }
      recordedIso = d.toISOString();
    }

    const cleanNote = typeof note === "string" && note.trim() ? note.trim().slice(0, 500) : null;

    const entry = await WeightModel.add(userId, {
      weightKg: Math.round(weightKg * 100) / 100,
      recordedAt: recordedIso,
      note: cleanNote,
    });
    if (!entry) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // "current weight" is always the latest entry, which may not be this one
    // if the user back-dated it
    const latest = await WeightModel.latest(userId);

    return res.status(201).json({
      success: true,
      message: "Weight logged",
      entry,
      currentWeight: latest ? latest.weight : entry.weight,
      bmi: latest ? latest.bmi : entry.bmi,
    });
  } catch (error) {
    return serverError(res, "Add Weight Error", error);
  }
};

// DELETE /api/weight/:userId/:entryId
const deleteWeight = async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    if (!UUID_RE.test(entryId)) {
      return res.status(400).json({ success: false, message: "Invalid entry id" });
    }

    const removed = await WeightModel.remove(userId, entryId);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    const latest = await WeightModel.latest(userId);
    return res.status(200).json({
      success: true,
      message: "Entry deleted",
      currentWeight: latest ? latest.weight : null,
    });
  } catch (error) {
    return serverError(res, "Delete Weight Error", error);
  }
};

module.exports = { listWeights, addWeight, deleteWeight };