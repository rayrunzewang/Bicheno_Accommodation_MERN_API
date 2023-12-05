const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');
const { generateHash } = require('../utils/authUtils');
const User = require('../models/User');
const fs = require('fs');

/*------ logLoginAttempt Log Function ------*/
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
    try {
        fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
        console.log('Data appended to file.');
    } catch (error) {
        console.error('Error appending to file:', error.message);
    }
}

/* ------ register router ------ */
/* TODO: 1.Error Handling Error in the generateHash Function
         2.Error Handling Incorrect Usage of the User Model:If there is an error in the `User.findOne` or `new User` processes, such as passing incorrect parameters, it could also result in a program crash.
         3.Err log, consider Winston
------ */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // ------ not using passwordSchema ------
        // if (!passwordSchema.validate(password)) {
        //     return res.status(400).json({ error: 'Password does not meet requirements.' });
        // }
        if (!username || !password) {
            return res.status(400).json({ error: 'Bad Request', message: 'Username and password are required.' });
        }
        try {
            existingUser = await User.findOne({ username });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', message: 'Error finding existing user.' });
        } if (existingUser) {
            return res.status(400).json({ error: 'Bad Request', message: 'Username already exists.' });
        }
        const hashedPassword = await generateHash(password);
        const newUser = new User({ username, password: hashedPassword });
        // Handle potential errors during newUser.save()
        try {
            await newUser.save();
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', message: 'Error saving new user.' });
        }
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Registration failed. Please try again later.' });
    }
});

/* ------ login router ------ */
router.post('/', (req, res, next) => {
    try {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        res.header('Access-Control-Allow-Origin', 'https://login-test-mtef.onrender.com');
        res.header('Access-Control-Max-Age', '600');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

        passport.authenticate('local-with-bcrypt', (err, user, info) => {
            if (err) {
                console.error('Login failed:', err);
                logLoginAttempt('unknown', false, req.ip, req.get('user-agent'), err.message);
                return res.status(500).json({ error: 'Internal Server Error', message: 'Login failed'});
            }
            if (!user) {
                logLoginAttempt('unknown', false, req.ip, req.get('user-agent'), 'Invalid username or password.');
                return res.status(400).json({ error: 'Bad Request', message: 'Invalid username or password.' });
            }
            req.session.user = user;
    

            req.login(user, (err) => {
                if (err) {
                    console.error('Login failed:', err);
                    logLoginAttempt(user.username, false, req.ip, req.get('user-agent'), err.message);
                    return res.status(500).json({  error: 'Internal Server Error', message:'Login failed' });
                }

                res.cookie('user_id', user._id, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true,             
                sameSite: 'none',
                secure: true,
            });
                
                logLoginAttempt(user.username, true, req.ip, req.get('user-agent'), '');

                console.log( '登陆成功,显示user._id:', user._id)
                console.log('登陆后显示req.session:',req.session)
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
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        res.header('Access-Control-Allow-Origin', 'https://login-test-mtef.onrender.com');
        res.header('Access-Control-Max-Age', '600');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

        const { username, oldPassword, newPassword } = req.body;

        // Check if the new password meets the requirements
        // if (!passwordSchema.validate(newPassword)) {
        //     return res.status(400).json({ error: 'New password does not meet requirements.' });
        // }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Bad Request', message: 'User not found.' });
        }

        // Check if the old password matches
        const isPasswordValid = await user.validPassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Bad Request', message: 'Current password is incorrect.' });
        }

        // Generate and update the hashed password
        const hashedPassword = await generateHash(newPassword);
        user.password = hashedPassword;

        console.log(user)

        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Password change failed' });
    }
});

module.exports = router;