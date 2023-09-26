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

/* ------ deprecated:smtp way t osend email ------need to install nodemailer */
// router.post('/', (req, res) => {
//   const { name, mobile, email, message } = req.body;

// let transporter = nodemailer.createTransport({
//     host: 'smtp.sendgrid.net',
//     port: 587,
//     auth: {
//         user: "apikey",
//         pass: "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"
//     }
//  })

//   const mailOptions = {
//     from: "rayrunzewang@gmail.com",  // Use the sender's email provided in the form
//     to: "baysidetechstudio@gmail.com",  // Replace with the recipient's email
//     subject: "New Enquiry",
//     text: `
//       Name: ${name}
//       Mobile: ${mobile}
//       Email: ${email}
//       Message: ${message}
//     `
//   };

//   // Send the email
//   transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//       console.log("Error sending email:", error);
//       res.status(500).send('Error sending email.');
//     } else {
//       console.log('Email sent:', info.response);
//       res.status(200).send('Email sent successfully!');
//     }
//   });
// });

module.exports = router;
