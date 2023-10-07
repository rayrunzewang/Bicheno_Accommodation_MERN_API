const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File')
const sharp = require('sharp');

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post('/', upload.array('file'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Bad Request.', message: 'No File Chosen.' });
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
      link: req.body.link,
      images: [], // 创建一个空的数组以保存图片信息
    });

    let order = 1;

    for (const file of uploadedFiles) {
      let fileSizeInBytes = file.size;

      if (fileSizeInBytes < 150 * 1024) {
        newFile.images.push({
          image_name: file.originalname,
          image_data: file.buffer, 
          image_contentType: file.mimetype, 
          order: order,
          fileSizeInBytes: fileSizeInBytes,
        });
        filePaths.push(file.originalname);
      } else {
        // 大于 200KB 的图片进行调整大小
        const adjustedImageData = await sharp(file.buffer).resize(1024, null).toBuffer();
        fileSizeInBytes = adjustedImageData.length;

        newFile.images.push({
          image_name: file.originalname,
          image_data: adjustedImageData,
          image_contentType: file.mimetype,
          order: order,
          fileSizeInBytes: fileSizeInBytes,
        });
        filePaths.push(file.originalname);
      }

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
    // Retrieve all property data including images from MongoDB
    const properties = await File.find();

    // If no properties are found, return an empty array or an appropriate response
    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }

    // Extract property data and images to send to the frontend
    const propertyData = properties.map((property) => {
      return {
        _id: property._id,
        title: property.title,
        address: property.address,
        description: property.description,
        bed: property.bed,
        toliet: property.toliet,
        carspace: property.carspace,
        link: property.link,
        images: property.images.map((image) => {
          return {
            _id: property._id,
            image_name: image.image_name,
            image_url: `data:${image.image_contentType};base64,${image.image_data.toString('base64')}`,
            order: image.order,
          };
        }),
      };
    });



    // Send the property data and images to the frontend
    res.json({ properties: propertyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching property data.' });
  }
});

router.get('/propertycard', async (req, res) => {
  try {
    const propertyData = await File.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          address: 1,
          bed: 1,
          toliet: 1,
          carspace: 1,
          image_contentType: { $arrayElemAt: ['$images.image_contentType', 0] }, // 获取第一个image
          image_data: { $arrayElemAt: ['$images.image_data', 0] }, // 获取第一个image

          // coverImage_url: {
          //   $concat: [
          //     'data:',
          //     { $toString: '$image_contentType' },
          //     ';base64,',
          //     { $toString: '$image_data' } // 确保将image_data转换为字符串
          //   ]
          // }        
        }
      }
    ]);

    console.log(propertyData)

    if (!propertyData || propertyData.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }

    res.json({ properties: propertyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching property data.' });
  }
});

router.get('/alltitle', async (req, res) => {
  try {
    const properties = await File.find().select('-images'); // 使用 '-images' 来排除 images 字段

    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }

    const propertyData = properties.map((property) => {
      return {
        _id: property._id,
        title: property.title,
        
      };
    });

    res.json({ properties: propertyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching property data.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const {
      _id,
      title,
      address,
      description,
      bed,
      toliet,
      carspace,
      link,
      images,
    } = file;

    // 将图片信息转换为可用于前端显示的格式
    const imageUrls = images.map((image) => ({
      _id: image._id,
      image_name: image.image_name,
      image_url: `data:${image.image_contentType};base64,${image.image_data.toString('base64')}`,
      order: image.order,
      fileSizeInBytes: image.fileSizeInBytes,
    }));

    // 构建返回的数据对象
    const responseData = {
      _id,
      title,
      address,
      description,
      bed,
      toliet,
      carspace,
      link,
      images: imageUrls,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve data.' });
  }
});

router.put('/:id', upload.array('file'), async (req, res) => {
  const fileId = req.params.id;
  console.log(req.params);
  try {
    const fileToUpdate = await File.findById(fileId);

    if (!fileToUpdate) {
      return res.status(404).json({ error: 'File not found.', message: 'File not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'No File Chosen.' });
    }

    const uploadedFiles = req.files;

    // 更新文件属性
    fileToUpdate.title = req.body.title;
    fileToUpdate.address = req.body.address;
    fileToUpdate.description = req.body.description;
    fileToUpdate.bed = req.body.bed;
    fileToUpdate.toliet = req.body.toliet;
    fileToUpdate.carspace = req.body.carspace;
    fileToUpdate.link = req.body.link;

    let order = 1;

    // 清空现有的图片并添加新的图片
    fileToUpdate.images = [];

    for (const file of uploadedFiles) {
      let fileSizeInBytes = file.size;

      if (fileSizeInBytes < 200 * 1024) {
        // 对于小于 200KB 的图片，直接存储二进制数据
        fileToUpdate.images.push({
          image_name: file.originalname,
          image_data: file.buffer, // 存储图片的二进制数据
          image_contentType: file.mimetype, // 图片的 MIME 类型
          order: order,
          fileSizeInBytes: fileSizeInBytes,
        });
      } else {
        // 对于大于 200KB 的图片，进行调整大小并存储二进制数据
        const adjustedImageData = await sharp(file.buffer).resize(1024, null).toBuffer();
        fileSizeInBytes = adjustedImageData.length;

        fileToUpdate.images.push({
          image_name: file.originalname,
          image_data: adjustedImageData,
          image_contentType: file.mimetype,
          order: order,
          fileSizeInBytes: fileSizeInBytes,
        });
      }
      order++;
    }

    await fileToUpdate.save();

    res.json({ message: 'File updated successfully.', file: fileToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.', message: 'File update failed.' });
  }
});

router.delete('/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const fileToDelete = await File.findById(fileId);

    if (!fileToDelete) {
      return res.status(404).json({ error: 'File not found', message: 'File not found' });
    }

    //TODO: error handling

    // delete data from database
    const result = await File.findByIdAndDelete(fileId);
    if (!result) {
      return res.status(500).json({ error: 'An error occured.', message: 'Failed to delete file.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Cannot Delete Files', error);
    res.status(500).json({ error: 'Internal server error', message: 'Fail deleting property' });
  }
});

module.exports = router;


/* ------------------------------------ */
// const express = require('express');
// const app = express();
// const router = express.Router();
// const multer = require('multer');
// const File = require('../models/File')
// const fs = require('fs');
// const sharp = require('sharp');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const filename = uniqueSuffix + file.originalname;
//     cb(null, filename);
//   },
// });

// const upload = multer({ storage: storage });

// // app.use(express.static('public'));

// router.post('/', upload.array('file'), async (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ error: 'Bad Request.', message: 'No File Chosen.' });
//   }

//   const uploadedFiles = req.files;
//   const filePaths = [];

//   try {
//     const newFile = new File({
//       title: req.body.title,
//       address: req.body.address,
//       description: req.body.description,
//       bed: req.body.bed,
//       toliet: req.body.toliet,
//       carspace: req.body.carspace,
//       link: req.body.link,
//     });

//     let order = 1;

//     for (const file of uploadedFiles) {
//       let fileSizeInBytes = fs.statSync(file.path).size;
//       if (fileSizeInBytes < 200 * 1024) {
//         newFile.images.push({
//           image_name: file.filename,
//           image_url: file.path,
//           order: order,
//           fileSizeInBytes: fileSizeInBytes,
//         });
//         filePaths.push(file.path);

//       } else {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const folder = 'uploads'
//         const adjustedImagePath = 'adj' + uniqueSuffix + '.jpg';
//         await sharp(file.path).resize(1024, null).toFile(folder +'\\'+ adjustedImagePath);
//         console.log(`folder +'\\'+ adjustedImagePath:`, folder +'\\'+ adjustedImagePath)

//         fs.unlinkSync(file.path)
//         fileSizeInBytes = fs.statSync(folder +'\\'+ adjustedImagePath).size;
//         console.log('fileSizeInBytes', fileSizeInBytes)
//         newFile.images.push({
//           image_name: file.filename,
//           image_url: folder +'\\'+ adjustedImagePath,
//           order: order,
//           fileSizeInBytes: fileSizeInBytes,
//         });
//         filePaths.push(folder +'\\'+ adjustedImagePath);

//       }
//       order++;

//     }

//     await newFile.save();

//     res.json({ message: 'File uploaded successfully.', files: filePaths });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'File upload failed' });
//   }
// });

// router.get('/', async (req, res) => {
//   try {
//     const files = await File.find();

//     if (!files || files.length === 0) {
//       return res.status(404).json({ error:'Document not found',  message: 'No documents found' });
//     }

//     res.json(files);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error:'Internal server error', message: 'Failed to retrieve documents' });
//   }
// });

// router.get('/:id', async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     const file = await File.findById(fileId);

//     if (!file) {
//       return res.status(404).json({ error:'Document not found', message: 'Document not found' });
//     }

//     res.json({ document: file });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error:'Internal server error', message: 'Failed to retrieve document' });
//   }
// });

// router.put('/:id', upload.array('file'), async (req, res) => {
//   const fileId = req.params.id;
//   try {
//     const fileToUpdate = await File.findById(fileId);

//     if (!fileToUpdate) {
//       return res.status(404).json({ error: 'File not found.', message: 'File not found.' });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'Bad Request', message: 'No File Chosen.' });
//     }

//     // Delete old images
//     // TODO: error handling
//     for (const image of fileToUpdate.images) {
//       const imagePath = image.image_url;
//       fs.unlinkSync(imagePath);
//     }

//     const uploadedFiles = req.files;

//     // Update file properties
//     fileToUpdate.title = req.body.title;
//     fileToUpdate.address = req.body.address;
//     fileToUpdate.description = req.body.description;
//     fileToUpdate.bed = req.body.bed;
//     fileToUpdate.toliet = req.body.toliet;
//     fileToUpdate.carspace = req.body.carspace;
//     fileToUpdate.link = req.body.link;

//     let order = 1;

//     // Clear existing images and add new ones
//     fileToUpdate.images = [];
//     // for (const file of uploadedFiles) {
//     //   fileToUpdate.images.push({
//     //     image_name: file.filename,
//     //     image_url: file.path,
//     //     order: order,
//     //   });
//     //   order++;
//     // }

//     // let order = 1;

//     for (const file of uploadedFiles) {
//       let fileSizeInBytes = fs.statSync(file.path).size;
//       if (fileSizeInBytes < 200 * 1024) {
//         fileToUpdate.images.push({
//           image_name: file.filename,
//           image_url: file.path,
//           order: order,
//           fileSizeInBytes: fileSizeInBytes,
//         });

//       } else {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const folder = 'uploads'
//         const adjustedImagePath = 'adj' + uniqueSuffix + '.jpg';
//         await sharp(file.path).resize(1024, null).toFile(folder +'\\'+ adjustedImagePath);
//         console.log(`folder +'\\'+ adjustedImagePath:`, folder +'\\'+ adjustedImagePath)

//         fs.unlinkSync(file.path)
//         fileSizeInBytes = fs.statSync(folder +'\\'+ adjustedImagePath).size;
//         console.log('fileSizeInBytes', fileSizeInBytes)
//         fileToUpdate.images.push({
//           image_name: file.filename,
//           image_url: folder +'\\'+ adjustedImagePath,
//           order: order,
//           fileSizeInBytes: fileSizeInBytes,
//         });

//       }
//       order++;

//     }

//     await fileToUpdate.save();

//     res.json({ message: 'File updated successfully.', file: fileToUpdate });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error.', message: 'File update failed.' });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   const fileId = req.params.id;
//   try {
//     const fileToDelete = await File.findById(fileId);

//     if (!fileToDelete) {
//       return res.status(404).json({ error: 'File not found', message: 'File not found' });
//     }

//     // delete image
//     //TODO: error handling
//     for (const image of fileToDelete.images) {
//       const imagePath = image.image_url;
//       fs.unlinkSync(imagePath);
//     }

//     // delete data from database
//     const result = await File.findByIdAndDelete(fileId);
//     if (!result) {
//       return res.status(500).json({ error: 'An error occured.', message: 'Failed to delete file.' });
//     }
//     res.json(result);
//   } catch (error) {
//     console.error('Cannot Delete Files', error);
//     res.status(500).json({ error: 'Internal server error', message: 'Fail deleting property' });
//   }
// });

// module.exports = router;