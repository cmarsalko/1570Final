require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { connectDB } = require('../DBconnect');

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

// ---------- ROUTES ----------
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard');
});

app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin-dashboard');
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});