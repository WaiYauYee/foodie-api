// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Users may only access their own :userId resources
function authorizeSelf(req, res, next) {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

module.exports = { authenticateToken, authorizeSelf };
