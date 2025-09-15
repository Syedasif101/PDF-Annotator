const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');

// Create Highlight
const createHighlight = async (req, res) => {
  try {
    const { pdfId, pageNumber, highlightedText, boundingBox, color } = req.body;

    // Check if pdf belongs to user or not
    const pdf = await PDF.findOne({ uuid: pdfId, userId: req.userId });
    if (!pdf) {
      return res.status(403).json({
        success: false,
        message: 'The pdf does not belong to you',
      });
    }

    const highlight = await Highlight.create({
      pdfId,
      userId: req.userId,
      pageNumber,
      highlightedText,
      boundingBox,
      color,
    });

    res.status(201).json({
      success: true,
      message: 'Highlight saved',
      highlight,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Highlight saved error',
      error: error.message,
    });
  }
};

// PDF ke saare highlights get karo
const getHighlights = async (req, res) => {
  try {
    const { pdfId } = req.params;

    // Verify karo ki PDF user ki hai
    const pdf = await PDF.findOne({ uuid: pdfId, userId: req.userId });
    if (!pdf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const highlights = await Highlight.find({
      pdfId,
      userId: req.userId,
    }).sort('pageNumber');

    res.json({
      success: true,
      count: highlights.length,
      highlights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Highlights fetch karne me problem',
      error: error.message,
    });
  }
};

// Highlight update karo
const updateHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const highlight = await Highlight.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight nahi mila ya tumhara nahi hai',
      });
    }

    Object.assign(highlight, updates);
    await highlight.save();

    res.json({
      success: true,
      message: 'Highlight update ho gaya',
      highlight,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Update karne me error',
      error: error.message,
    });
  }
};

// Highlight delete karo
const deleteHighlight = async (req, res) => {
  try {
    const { id } = req.params;

    const highlight = await Highlight.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight nahi mila',
      });
    }

    res.json({
      success: true,
      message: 'Highlight delete ho gaya',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete karne me error',
      error: error.message,
    });
  }
};

module.exports = {
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
};
