const User = require('../models/User');

/**
 * Attach the full User document (if logged in) to req.user
 * and keep res.locals.currentUser in sync so EJS views can use it.
 */
async function attachUser(req, res, next) {
  try {
    if (req.session?.user?.id) {
      const user = await User.findById(req.session.user.id);

      if (user) {
        req.user = user;

        res.locals.currentUser = {
          ...req.session.user,
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      } else {
        req.user = null;
        res.locals.currentUser = null;
      }
    } else {
      req.user = null;
      if (typeof res.locals.currentUser === 'undefined') {
        res.locals.currentUser = null;
      }
    }
  } catch (err) {
    console.error('Error in attachUser middleware:', err);
    req.user = null;
  }

  next();
}

/**
 * Require that a user be authenticated (logged in).
 * If not, redirect them to the login page.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

/**
 * Require that the current user be an admin.
 * If not logged in, redirect to login.
 * If logged in but not admin, show a 403 Forbidden page.
 */
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Forbidden: Admins only' });
  }

  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };