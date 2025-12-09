const User = require("../models/User");


async function attachUser(req, res, next) {
  if (req.session?.user?.id) {
    req.user = await User.findById(req.session.user.id);
  } else {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden: Admins only');
  }
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };