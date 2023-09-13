const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    title: String,
    description: String,
    bed:Number,
    toliet:Number,
    carspace: Number,
    images: [
        {
            image_name: String,
            image_url: String,
            order:Number,
        },
    ],
});

module.exports = mongoose.model('File', fileSchema);