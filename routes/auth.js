const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// --- SIGNUP ---
router.get('/auth/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/auth/signup', async (req, res) => {
console.log('Signup POST route hit!');
  console.log('Request body:', req.body);

  try {
    const { name, email, password, major } = req.body;

    if (!email || !password) {
      return res.render('signup', { error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('signup', { error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      major,
      role: 'student'
    });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Something went wrong, please try again' });
  }
});

// --- LOGIN ---
router.get('/auth/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/auth/login', async (req, res) => {

  console.log('Login POST route hit!');
  console.log('Request body:', req.body);
  try {
    const { email, password } = req.body;
    console.log('Looking for user with email:', email);
  
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'YES' : 'NO');


    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong, please try again' });
  }
});

// --- LOGOUT ---
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;