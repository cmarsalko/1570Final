function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login'); // not logged in
  }

  // Example: user.accountType === 'admin'
  if (req.session.user.role !== 'admin') {
    return res.status(403).send("You do not have permission to access this page.");
  }

  next();
}

module.exports = requireAdmin;