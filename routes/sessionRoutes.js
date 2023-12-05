const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // console.log('Session maxAge:', req.session.cookie.maxAge);

    try {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        res.header('Access-Control-Allow-Origin', 'https://login-test-mtef.onrender.com');
        res.header('Access-Control-Max-Age', '600');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        console.log('session检查req.session:', req.session)


        if (req.session && req.session.passport && req.session.passport.user) {
            res.cookie('user_id', req.session.passport.user, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
        } else {
            res.json({ user: null });
        }
    } catch (error) {
        console.error('Error in /check-session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', (req, res) => {
    try {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        );
        res.header('Access-Control-Allow-Origin', 'https://login-test-mtef.onrender.com');
        res.header('Access-Control-Max-Age', '600');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

        req.session.destroy();
        res.status(200).json({ message: 'Logout successfully' });
        console.log('req.session/logout:', req.session);

    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
});

module.exports = router;

