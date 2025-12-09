require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const { requireAuth, requireAdmin } = require('./middleware/auth');

const app = express();

// ---------- DB CONNECTION ----------

const { connectDB } = require('./DBconnect'); // this allow express to read JSON from the body of the HTML request
connectDB();
/*mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
*/
// ---------- VIEW ENGINE ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//---------- Connect CSS & js to ejs ----------
app.use(express.static(path.join(__dirname, "public")));


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
  res.render('index');
});

app.get('/dashboard', requireAuth, (req, res) => {
    console.log('Session user:', req.session.user);
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