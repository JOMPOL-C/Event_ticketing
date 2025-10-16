exports.requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.redirect('/login');
  if (req.user.role !== role) return res.status(403).send('Forbidden');
  next();
};
