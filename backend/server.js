const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// CORS configuration to allow frontend on localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// JSON parsing middleware
app.use(express.json());

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 