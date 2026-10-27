// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const RevokedTokenModel = require("../models/revokedTokenModel");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.sendStatus(403);
  }

  try {
    // Old tokens without a jti are allowed until they expire (7 days)
    if (decoded.jti && (await RevokedTokenModel.isRevoked(decoded.jti))) {
      return res.status(401).json({ success: false, message: "Token has been revoked" });
    }
  } catch (err) {
    console.error("Revocation check failed:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

  req.user = decoded;
  next();
}

// Users may only access their own :userId resources
function authorizeSelf(req, res, next) {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

module.exports = { authenticateToken, authorizeSelf };
