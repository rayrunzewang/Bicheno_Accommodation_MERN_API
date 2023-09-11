const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    title: String,
    description: String,
    images: [
        {
            image_name: String,
            image_url: String,
        },
    ],
});

module.exports = mongoose.model('File', fileSchema);