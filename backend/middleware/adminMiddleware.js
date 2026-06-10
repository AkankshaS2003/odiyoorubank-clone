const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized to access this route, Admin only' });
  }
};

module.exports = { admin };
