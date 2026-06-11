const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'employee')) {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized to access this route, Admin/Staff only' });
  }
};

module.exports = { admin };
