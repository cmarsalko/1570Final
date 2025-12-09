const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/settings', requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('settings', { currentUser: user });
});



router.post('/settings', requireAuth, async (req, res) => {
  try {
    const { email, newPassword} = req.body;
    const user = await User.findById(req.user._id);

    // 1. Verify current password if trying to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.render('settings', { error: 'Current password is required to change password' });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.render('settings', { error: 'Current password is incorrect' });
      }
      if (newPassword !== confirmPassword) {
        return res.render('settings', { error: 'New passwords do not match' });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      console.log(newPassword, user.passwordHash)
    }

    // 2. Update email if changed
    if (email && email !== user.email) {
      user.email = email;
    }

    await user.save();

    res.render('settings', { success: 'Account updated successfully!', currentUser: user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update account');
  }
});

module.exports = router;