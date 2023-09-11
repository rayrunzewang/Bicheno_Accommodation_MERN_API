const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');
const { generateHash } = require('../utils/authUtils');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!passwordSchema.validate(password)) {
            return res.status(400).json({ error: 'Password does not meet requirements.' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        const hashedPassword = await generateHash(password);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/', (req, res, next) => {
    passport.authenticate('local-with-bcrypt', (err, user, info) => {
        if (err) {
            console.error('Login failed:', err);
            return res.status(500).json({ error: 'Login failed' });
        }
        if (!user) {
            return res.status(400).json({ error: info.message });
        }
        req.session.user = user;
        req.login(user, (err) => {
            if (err) {
                console.error('Login failed:', err);
                return res.status(500).json({ error: 'Login failed' });
            }
            res.cookie('user_id', user._id, { maxAge: 2 * 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false });
            res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); 
            res.header('Access-Control-Allow-Credentials', 'true'); 
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            );
            return res.json({ message: 'Login successful', user: user });
        });
    })(req, res, next);
});

module.exports = router;