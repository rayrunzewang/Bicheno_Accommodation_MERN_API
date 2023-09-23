require('dotenv').config();  // Load environment variables from .env file

const corsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS || '',  
};

module.exports = corsConfig;