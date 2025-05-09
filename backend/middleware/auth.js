const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const auth = (req, res, next) => {
  try {
    // For development, we'll use a mock user with a proper MongoDB ObjectId
    req.user = {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') // This is a valid MongoDB ObjectId
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth; 