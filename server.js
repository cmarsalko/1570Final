require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const { attachUser, requireAuth, requireAdmin } = require('./middleware/auth');

const profileRoutes = require('./routes/profile')
const settingsRoutes = require('./routes/settings')
const { connectDB } = require('./DBconnect');

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

app.get('/index', (req, res) => {
  res.render('index');
});


app.use('/', authRoutes);

app.use('/', requireAuth, profileRoutes);
app.use('/', requireAuth, settingsRoutes);

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('study-dashboard');
});

app.get('/home', requireAuth, (req, res) => {
  res.render('PP');
});

app.get('/create-session', requireAuth, (req, res) => {
  res.render('create-session');
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.render('admin-page');
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
