const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // console.log('Session maxAge:', req.session.cookie.maxAge);

    try {
        console.log('req.session in check-session:', req.session);
        // console.log('req.session.passport.user in check-session:', req.session.passport.user);

        if (req.session && req.session.passport && req.session.passport.user) {
            console.log('检查',req.session)
            console.log('检查',req.session.passport)
            console.log('检查',req.session.passport.user)
            res.cookie('user_id', req.session.passport.user, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false });
            res.json({ user: req.session.passport.user });
            // req.session.passport.user = req.session.passport.user
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

        req.session.destroy();
        res.status(200).json({ message: 'Logout successfully' });
        console.log('req.session/logout:', req.session);

    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
});

module.exports = router;

