const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET profile page

router.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('profile', { currentUser: user });
});



// POST profile update
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, major, classes, about } = req.body;
    const classArray = classes ? classes.split(',').map(c => c.trim()) : [];
    console.log(name, email, major, classes, about);
    await User.findByIdAndUpdate(
  req.user._id,
  {
    name,
    email,
    major,
    classes: classArray,
    about
  },
  { new: true }
);
    res.redirect('/profile'); // refresh page after saving
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to update profile.");
  }
});

module.exports = router;
