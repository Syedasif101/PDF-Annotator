const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load Environment variables
dotenv.config();

//Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import Routes
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const highlightRoutes = require('./routes/highlightRoutes');

// use routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/highlights', highlightRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something is wrong',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
