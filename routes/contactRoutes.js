const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact')

//TODO: error log
router.get('/', async (req, res) => {
    try {
        const contact = await Contact.findOne();
        if (!contact) {
            return res.status(404).json({ error: 'Contact information not found', message: 'Contact information not found' });
        }
        res.json(contact);
    } catch (error) {
        console.error('Error getting contact information:', error);
        res.status(500).json({ error: 'Internal service error', message: 'Failed to retrieve company information.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { phoneNumber, alternativePhoneNumber, email, address, facebookURL, instagramURL } = req.body;

        let contact = await Contact.findOne();

        if (!contact) {
            contact = new Contact({
                phoneNumber,
                alternativePhoneNumber,
                email,
                address,
                facebookURL,
                instagramURL
            });

        } else {
            contact.phoneNumber = phoneNumber;
            contact.alternativePhoneNumber = alternativePhoneNumber;
            contact.email = email;
            contact.address = address;
            contact.facebookURL = facebookURL;
            contact.instagramURL = instagramURL;
        }

        await contact.save();
        res.json({ message: 'Contact information has been updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', message: 'Contact information update was not successful.' });
    }
});

module.exports = router;