require('dotenv').config();
const corsOptions = require('./config/corsOptions');  
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const port = process.env.PORT || 3500;
const sessionSecret = process.env.SESSION_SECRET;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport-config')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


connectDB();
// mongoose.connect('mongodb://127.0.0.1:27017/mern-todo', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('connected to DB'))
//   .catch(console.error);

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: sessionSecret,
  rolling: true,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  },
}));

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const blogPostRoutes = require('./routes/blogPostRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const imagesRoutes = require('./routes/imagesRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use('/register', authRoutes);
app.use('/login', authRoutes);
app.use('/change-password', authRoutes);
app.use('/contact', contactRoutes);
app.use('/posts', blogPostRoutes);
app.use('/check-session', sessionRoutes);
app.use('/logout', sessionRoutes);
app.use('/property', imagesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
app.use('/send-email', emailRoutes);

/* ------ deprecated: Method of generating PDF on the backend server using PDFkit and downloading. ------ */
// app.post('/generate-pdf', (req, res) => {
//   const { title, address, description, bed, toliet, carspace, images } = req.body;
//   console.log(title, address, description, bed, toliet, carspace, images)

//   // Create a new PDF document
//   const doc = new PDFDocument({ size: 'A4' });

//   // Set response headers for PDF
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename="property_info.pdf"');
//   console.log(images.map((image) => { return image.image_url }))
//   // Pipe the PDF to the response
//   doc.pipe(res);

//   // Add property information and images to the PDF


//   const maxContentWidth = 400
//   const maxContentHeight = 650; // Maximum height for content
//   const imageWidth = 100;
//   const imageHeight = 100;
//   const pageMargin = 95; // Margin for content
//   const margin = 10; // Margin for content
//   let x = margin;
//   const y = 200 + margin;

//   doc.fontSize(20).text(`${title}`
//     , {
//       align: 'center',
//       width: maxContentWidth
//     });

//   doc.moveDown();
//   doc.fontSize(12).text(`${address}`
//     , {
//       align: 'left',
//       width: maxContentWidth
//     });
//   doc.fontSize(12).text(`bed:${bed}, toliet:${toliet}, carspace:${carspace}`
//     , {
//       // underline: true,
//       align: 'left',
//       width: maxContentWidth
//     });

//   doc.moveDown();
//   doc.fontSize(12).text(`Contact:accommodation@bicheno.com.au`
//   , {
//     // underline: true,
//     align: 'left',
//     width: maxContentWidth
//   });

//   // for (const line of lines) {
//   //   // Check if the line exceeds the maximum height
//   //   if (y + 20 > maxContentHeight) {
//   //     // Add a new page
//   //     doc.addPage();
//   //     y = margin; // Reset y position for new page
//   //   }

//   //   doc.text(line, x, y);
//   //   y += 20; // Increment y position for the next line
//   // }

//   if (y + imageHeight > maxContentHeight) {
//     doc.addPage(); // Add a new page if the image exceeds the maximum height
//     y = margin; // Reset y position for new page
//   }

//   const imageURLs = images.map(image => image.image_url);
//   imageURLs.forEach(url => {
//     // 添加图片到 PDF
//     doc.image(url, x, y, { width: imageWidth });
//     x += imageWidth + 10;  // Add some padding between images
//   });

//   // Finalize the PDF
//   doc.end();
// });

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('An error occurred:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(port, () => console.log(`Server started on port ${port}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})
