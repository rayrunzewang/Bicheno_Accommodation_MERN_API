const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  alternativePhoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true, 
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      },
      message: 'Please enter a valid email address.',
    },
  },
  address: {
    type: String,
    required: true,
  },
  
  facebookURL: {
    type: String,
    required: true,
  },
  instagramURL: {
    type: String,
    required: true,
  },

});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;