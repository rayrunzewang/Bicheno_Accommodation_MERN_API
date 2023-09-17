const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
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
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

router.post('/', upload.array('file'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No File Chosen.');
  }

  const uploadedFiles = req.files;
  const filePaths = [];

  try {
    const newFile = new File({
      title: req.body.title,
      address: req.body.address,
      description: req.body.description,
      bed: req.body.bed,
      toliet: req.body.toliet,
      carspace: req.body.carspace,
    });

    let order = 1;

    for (const file of uploadedFiles) {
      newFile.images.push({
        image_name: file.filename,
        image_url: file.path,
        order: order,
      });
      filePaths.push(file.path);
      order++;
    }

    await newFile.save();

    res.json({ message: 'File uploaded successfully.', files: filePaths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const files = await File.find();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No documents found' });
    }

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve documents' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ document: file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve document' });
  }
});

router.put('/:id', upload.array('file'), async (req, res) => {
  const fileId = req.params.id;
  console.log(req.files);
  try {
    const fileToUpdate = await File.findById(fileId);

    if (!fileToUpdate) {
      return res.status(404).send('File not found.');
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No File Chosen.');
    }

    const uploadedFiles = req.files;

    // Update file properties
    fileToUpdate.title = req.body.title;
    fileToUpdate.address = req.body.address;
    fileToUpdate.description = req.body.description;
    fileToUpdate.bed = req.body.bed;
    fileToUpdate.toliet = req.body.toliet;
    fileToUpdate.carspace = req.body.carspace;

    let order = 1;

    // Clear existing images and add new ones
    fileToUpdate.images = [];
    for (const file of uploadedFiles) {
      fileToUpdate.images.push({
        image_name: file.filename,
        image_url: file.path,
        order: order,
      });
      order++;
    }

    await fileToUpdate.save();

    res.json({ message: 'File updated successfully.', file: fileToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File update failed.' });
  }
});

router.delete('/:id', async (req, res) => {
  const deleteFiles = await File.findById(req.params.id);
  try {
    if (!deleteFiles) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const result = await File.findByIdAndDelete(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;