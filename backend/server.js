// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/giftProfiles'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});