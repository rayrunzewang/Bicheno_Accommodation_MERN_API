const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ------ Enquiry Email route and template ------
router.post('/', (req, res) => {
    const { name, mobile, email, message } = req.body;
    const mobileInfo = mobile ? mobile : 'Not provided';
    const msg = {
        to: 'baysidetechstudio@gmail.com',
        from: 'rayrunzewang@gmail.com',
        subject: '[No-Reply] - New Enquiry from Your Website',
        text: `
-------------------------------------
*Please do not reply directly to this email. 
*Reply using the email address provided in the form instead.
-------------------------------------
Customer Enquiry Form

Sender Name: ${name}
Sender Mobile: ${mobileInfo}
Sender Email/Reply to: ${email}

Enquiry Message: 

${message}

-------------------------------------`,
    };

    sgMail.send(msg)
        .then((response) => {
            res.status(200).json({ message: 'Email sent successfully!' });
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).json({error:'Internal server error', message: 'Error sending email!' });
        });
});

module.exports = router;
