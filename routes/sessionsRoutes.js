const express = require('express');
const Session = require('./models/Sessions');
const {requireAuth} = require('../middleware/auth');
const router = express.Router();

// Gets all sessions
router.get('/', requireAuth, async function(req, res) {
    try {
        const sessions = await Session.find();
        res.render('sessions', {sessions});
    } catch(err) {
        console.log(err);
        res.status(500).render('error', {message: err.message});
    }
});

// Shows sessions form to create a session
router.get('/new', requireAuth, async function(req, res) {
    res.render('create-session');
});

// Creates a session
router.post('/', requireAuth, async function(req, res) {
    try{
        await Session.create(req.body);
        res.redirect('/sessions');
    } catch(err) {
        console.log(err);
        res.render('create-session', {error: 'Failed to create a session.'});
    }
});

// Shows session form to edit a session
router.get('/:id/edit', requireAuth, async function(req, res) {
    try{
        const session = await Session.findById(req.params.id);
        res.render('create-session', {session});
    } catch(err) {
        console.log(err);
        res.status(500).render('error', {message: err.message});
    }
});

// Updates a session
router.post('/:id/edit', requireAuth, async function(req, res) {
    try{
        await Session.findByIdAndDelete(req.params.id);
        res.redirect('/sessions');
    } catch(err) {
        console.log(err);
        res.status(500).render('error', {message: err.message});
    }
});

// Deletes a session
router.post('/:id/edit', requireAuth, async function(req, res) {
    try{
        await Session.findByIdAndDelete(req.params.id);
        res.redirect('/sessions');
    } catch(err) {
        console.log(err);
        res.status(500).render('error', {message: err.message});
    }
});

module.exports = router;