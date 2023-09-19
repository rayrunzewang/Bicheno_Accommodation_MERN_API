require('dotenv').config();
const port = process.env.PORT || 3001;
const sessionSecret = process.env.SESSION_SECRET;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport-config')
const app = express();
const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/mern-todo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('connected to DB'))
  .catch(console.error);
  
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type'], // this is needed for sending JSON
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60 * 1000,
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

app.use('/register', authRoutes);
app.use('/login', authRoutes);
app.use('/change-password', authRoutes);
app.use('/contact', contactRoutes);
app.use('/posts', blogPostRoutes);
app.use('/check-session', sessionRoutes);
app.use('/logout', sessionRoutes);
app.use('/property', imagesRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error('An error occurred:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(port, () => console.log('Server started on port 3001'))
