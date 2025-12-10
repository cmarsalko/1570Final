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
      // Ensure we have a YYYY-MM-DD string to combine with startTime
      const dateOnly = session.date instanceof Date
        ? session.date.toISOString().slice(0, 10)
        : session.date;

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

    // RULE: must be at least 1 hour in the future
    const oneHourMs = 60 * 60 * 1000;
    const diffMs = startDateTime - now;

    if (diffMs < oneHourMs) {
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

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  const stats = {
    userCount: 1,
    activeSessionCount: 0,
    closedTodayCount: 0
  };

  res.render('admin-page', { stats });
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

// ---------- SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
