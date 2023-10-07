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
// const bodyParser = require('body-parser');

connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: sessionSecret,
  rolling: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'None', 
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
app.use('/property/propertycard', imagesRoutes);
app.use('/property/alltitle', imagesRoutes);

// app.use(bodyParser.json());
app.use('/send-email', emailRoutes);

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
