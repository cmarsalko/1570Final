const express = require('express');
const Session = require('../models/Sessions');  
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// GET /sessions - list all sessions (separate sessions page)
router.get('/', requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1, startTime: 1 });
    res.render('sessions', { sessions });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: err.message });
  }
});

// GET /sessions/new - show create form
router.get('/new', requireAuth, (req, res) => {
  res.render('create-session', { error: null, session: null });
});

// POST /sessions - create session
router.post('/', requireAuth, async (req, res) => {
  try {
    await Session.create(req.body);
    res.redirect('/sessions');
  } catch (err) {
    console.log(err);
    res.render('create-session', { error: 'Failed to create a session.', session: req.body });
  }
});

// GET /sessions/:id/edit - show edit form
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    res.render('create-session', { session, error: null });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: err.message });
  }
});

// POST /sessions/:id/edit - update session
router.post('/:id/edit', requireAuth, async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/sessions');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: err.message });
  }
});

// POST /sessions/:id/delete - delete session
router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.redirect('/sessions');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { message: err.message });
  }
});

module.exports = router;