const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  pdfId: {
    type: String, // UUID of PDF
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  highlightedText: {
    type: String,
    required: true,
  },
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  color: {
    type: String,
    default: '#ffff00', // default yellow color
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Highlight', highlightSchema);
