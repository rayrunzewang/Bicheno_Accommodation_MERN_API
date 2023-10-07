const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  image_name: {
    type: String,
    required: true,
  },
  image_data: {
    type: Buffer, 
    required: true,
  },
  image_contentType: {
    type: String, 
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const fileSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  bed: {
    type: Number,
    required: true,
  },
  toliet: {
    type: Number,
    required: true,
  },
  carspace: {
    type: Number,
    required: true,
  },
  images: [imageSchema], 
});

module.exports = mongoose.model('File', fileSchema);
