const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        console.log('req.session/check-session:', req.session);
        console.log('req.session.passport.user/check-session:', req.session.passport.user);

        if (req.session.passport.user) {
            res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allowed Origin
            res.header('Access-Control-Allow-Credentials', 'true'); // Allowing Credentials
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            );
            if (req.session.passport.user) {
                res.json({ user: req.session.passport.user });
            } else {
                res.json({ user: null });
            }
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error in /check-session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', (req, res) => {
    try {

        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
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

