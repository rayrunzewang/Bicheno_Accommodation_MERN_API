const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact')

router.get('/', async (req, res) => {
    try {
        const contact = await Contact.findOne();
        res.json(contact);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve company information.' });
    }
});

router.post('/', async (req, res) => {
    const { phoneNumber, alternativePhoneNumber, email, address, facebookURL, instagramURL } = req.body;
    try {
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
            console.log(contact);

        } else {
            contact.phoneNumber = phoneNumber;
            contact.alternativePhoneNumber = alternativePhoneNumber;
            contact.email = email;
            contact.address = address;
            contact.facebookURL = facebookURL;
            contact.instagramURL = instagramURL;
        }
        console.log(contact);

        await contact.save();
        res.json({ message: 'Contact information has been updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Contact information update was not successful.' });
    }
});

module.exports = router;