require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const { attachUser, requireAuth, requireAdmin } = require('./middleware/auth');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings'); 
const sessionsRoutes = require('./routes/sessionsRoutes');
const { connectDB } = require('./DBconnect');
const Session = require('./models/Sessions'); 
const User = require('./models/User');

const app = express();

// ---------- DB CONNECTION ----------
connectDB();

// ---------- VIEW ENGINE ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true })); // form data

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));

// make user available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(attachUser)

app.use(express.static('public'));
app.use(express.json());

// ---------- ROUTES ----------
app.use('/', authRoutes);
app.use('/', requireAuth, profileRoutes);
app.use('/', requireAuth, settingsRoutes);
app.use('/sessions', sessionsRoutes);

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const sessions = await Session
      .find({})
      .sort({ date: 1, startTime: 1 });

    const now = new Date();
    const activeSessions = [];
    const closedSessions = [];

    sessions.forEach(session => {
      // If the admin closed it, always treat as closed
      if (session.isClosed) {
        closedSessions.push(session);
        return;
      }

      // Otherwise use date/time to decide
      const dateOnly = session.date instanceof Date
        ? session.date.toISOString().slice(0, 10)
        : session.date; // "YYYY-MM-DD"

      const startDateTime = new Date(`${dateOnly}T${session.startTime}:00`);

      if (startDateTime >= now) {
        activeSessions.push(session);
      } else {
        closedSessions.push(session);
      }
    });

    const adminError =
      req.query.adminError === '1' ? 'Incorrect admin password.' : null;

    res.render('study-dashboard', {
      activeSessions,
      closedSessions,
      adminError
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/home', requireAuth, (req, res) => {
  res.render('PP');
});

app.get('/create-session', requireAuth, (req, res) => {
  res.render('create-session');
});

app.post('/create-session', requireAuth, async (req, res) => {
  try {
    const {
      subject,
      date,
      startTime,
      endTime,
      building,
      room,
      hostedBy,
      additionalNotes
    } = req.body;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime   = new Date(`${date}T${endTime}:00`);
    const now           = new Date();

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      return res.status(400).render('create-session', {
        error: 'Invalid date or time. Please check your inputs.',
        formData: req.body
      });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).render('create-session', {
        error: 'End time must be later than start time.',
        formData: req.body
      });
    }

    // Is the current user an admin?
    const isAdmin =
      req.session.user && req.session.user.role === 'admin';

    // RULE: must be at least 1 hour in the future for students,
    // but admins can create last-minute sessions
    const oneHourMs = 60 * 60 * 1000;
    const diffMs = startDateTime - now;

    if (!isAdmin && diffMs < oneHourMs) {
      return res.status(400).render('create-session', {
        error: 'Study sessions must be scheduled at least 1 hour in advance.',
        formData: req.body
      });
    }

    // If we get here, it’s valid — create the session
    await Session.create({
      subject,
      date,
      startTime,
      endTime,
      building,
      room,
      hostedBy,
      additionalNotes
      // isClosed will use your schema default (likely false)
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(400).render('create-session', {
      error: 'Failed to create a session. Please check your inputs and try again.',
      formData: req.body
    });
  }
});

// ---------- ADMIN UPGRADE ROUTE ----------
app.post('/admin/upgrade', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    const ADMIN_UPGRADE_PASSWORD = process.env.ADMIN_UPGRADE_PASSWORD || 'admin';

    if (password !== ADMIN_UPGRADE_PASSWORD) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    // Must be logged in
    if (!req.session.user?.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    // Update DB role
    await User.findByIdAndUpdate(req.session.user.id, { role: 'admin' });

    // Update session role
    req.session.user.role = 'admin';

    return res.json({ success: true });
  } catch (err) {
    console.error('Error upgrading to admin:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADMIN DASHBOARD
app.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();

    // Pull all sessions, newest first
    const sessions = await Session.find().sort({ date: 1, startTime: 1 });

    // Helper to format one session exactly like the main dashboard
    const formatSession = (s) => {
      const sessionDate = new Date(s.date);

      const dateFormatted = sessionDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'America/New_York',
      });

      const parseTime = (date, timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const startDateTime = parseTime(sessionDate, s.startTime);
      const endDateTime = parseTime(sessionDate, s.endTime);

      const startTimeFormatted = startDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });

      const endTimeFormatted = endDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });

      return {
        ...s.toObject(),
        dateFormatted,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
      };
    };

    const activeSessionsRaw = sessions.filter((s) => !s.isClosed);
    const closedSessionsRaw = sessions.filter((s) => s.isClosed);

    const activeSessions = activeSessionsRaw.map(formatSession);
    const closedSessions = closedSessionsRaw.map(formatSession);

    // Users for the Manage Users table
    const users = await User.find().sort({ name: 1 });

    // Simple stats (you can adjust these however you like)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const closedTodayCount = closedSessionsRaw.filter((s) => {
      const sd = new Date(s.date);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === today.getTime();
    }).length;

    const stats = {
      userCount: users.length,
      activeSessionCount: activeSessions.length,
      closedTodayCount,
    };

    res.render('admin-page', {
      currentUser: req.user,
      activeSessions,
      closedSessions,
      users,
      stats,
    });
  } catch (err) {
    console.error('Error loading admin page:', err);
    res.status(500).send('Server error loading admin page');
  }
});

// Close a session
app.post('/admin/sessions/:id/close', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isClosed: true });
    res.redirect('/admin');
  } catch (err) {
    console.error('Error closing session:', err);
    res.status(500).send('Error closing session');
  }
});

// Reopen a session
app.post('/admin/sessions/:id/reopen', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isClosed: false });
    res.redirect('/admin');
  } catch (err) {
    console.error('Error reopening session:', err);
    res.status(500).send('Error reopening session');
  }
});

// Delete a session
app.post('/admin/sessions/:id/delete', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).send('Error deleting session');
  }
});

// Toggle user role between 'student' and 'admin'
app.post('/admin/users/:id/toggle-role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Optional: prevent demoting the last admin, or prevent self-demote
    if (String(user._id) === String(req.user._id)) {
      // Don’t allow changing your own role via this button
      return res.redirect('/admin');
    }

    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();
    res.redirect('/admin');
  } catch (err) {
    console.error('Error toggling user role:', err);
    res.status(500).send('Error updating user');
  }
});

// Delete a user (but not yourself)
app.post('/admin/users/:id/delete', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      // Don’t let an admin delete their own account from here
      return res.redirect('/admin');
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});

app.post('/admin/sessions/:id/close', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isClosed: true });
    res.redirect('/admin');
  } catch (err) {
    console.error('Error closing session:', err);
    res.status(500).send('Error closing session');
  }
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
