const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');
const { generateHash } = require('../utils/authUtils');
const User = require('../models/User');
const fs = require('fs');

function logLoginAttempt(username, success, ipAddress, userAgent, errorMessage) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        username: username,
        success: success,
        ipAddress: ipAddress,
        userAgent: userAgent,
        errorMessage: errorMessage
    };

    const logFilePath = 'login_log.txt';

    // Append the log entry to the log file
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
}

/* ------ register router ------ */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // if (!passwordSchema.validate(password)) {
        //     return res.status(400).json({ error: 'Password does not meet requirements.' });
        // }
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

/* ------ login router ------ */
router.post('/', (req, res, next) => {
    try {
        passport.authenticate('local-with-bcrypt', (err, user, info) => {
            if (err) {
                console.error('Login failed:', err);
                logLoginAttempt('unknown', false, req.ip, req.get('user-agent'), err.message);
                return res.status(500).json({ error: 'Login failed' });
            }
            if (!user) {
                logLoginAttempt('unknown', false, req.ip, req.get('user-agent'), 'Invalid username or password.');
                return res.status(400).json({ error: 'Invalid username or password.' });
            }
            req.session.user = user;
            req.login(user, (err) => {
                if (err) {
                    console.error('Login failed:', err);
                    logLoginAttempt(user.username, false, req.ip, req.get('user-agent'), err.message);

                    return res.status(500).json({ error: 'Login failed' });
                }
                res.cookie('user_id', user._id, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: false });
                res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
                // res.header('Access-Control-Allow-Credentials', 'true'); 
                res.header(
                    'Access-Control-Allow-Headers',
                    'Origin, X-Requested-With, Content-Type, Accept'
                );
                logLoginAttempt(user.username, true, req.ip, req.get('user-agent'), '');

                return res.json({ message: 'Login successful', user: user });
            });
        })(req, res, next);
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

/* ------ Change Password Router ------ */
router.put('/', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        // Check if the new password meets the requirements
        // if (!passwordSchema.validate(newPassword)) {
        //     return res.status(400).json({ error: 'New password does not meet requirements.' });
        // }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        // Check if the old password matches
        const isPasswordValid = await user.validPassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Old password is incorrect.' });
        }

        // Generate and update the hashed password
        const hashedPassword = await generateHash(newPassword);
        user.password = hashedPassword;

        console.log(user)

        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change failed:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

module.exports = router;