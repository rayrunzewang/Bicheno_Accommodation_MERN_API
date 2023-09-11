const express = require('express');
const app = express();
const router = express.Router();
const multer = require ('multer');
const File = require('../models/File')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + file.originalname; 
      cb(null, filename);
    },
  });
  
  const upload = multer({ storage: storage });
  
  app.use(express.static('public'));
  
  router.post('/', upload.array('file'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No File Chosen.');
    }
  
    const uploadedFiles = req.files;
    const filePaths = [];
  
    try {
      const newFile = new File({
        title: req.body.title,
        description: req.body.description,
      }); 
  
      for (const file of uploadedFiles) {
        newFile.images.push({
          image_name: file.filename,
          image_url: file.path,
        });
        filePaths.push(file.path);
      }
  
      await newFile.save(); 
  
      res.json({ message: 'File uploaded successfully.', files: filePaths });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed' });
    }
  });

  module.exports = router;