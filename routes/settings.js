const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

console.log('Settings routes file loaded'); // Add this


router.get('/settings', requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('settings', { currentUser: user });
});


router.post('/settings', requireAuth, async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);
    console.log(email, currentPassword, newPassword, confirmPassword);
    // 1. Verify current password if trying to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.render('settings', { 
          error: 'Current password is required to change password',
          currentUser: user 
        });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.render('settings', { 
          error: 'Current password is incorrect',
          currentUser: user 
        });
      }
      if (newPassword !== confirmPassword) {
        return res.render('settings', { 
          error: 'New passwords do not match',
          currentUser: user 
        });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // 2. Update email if changed
    if (email && email !== user.email) {
      user.email = email;
    }

    await user.save();

    res.render('settings', { 
      success: 'Account updated successfully!', 
      currentUser: user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update account');
  }
});
module.exports = router;