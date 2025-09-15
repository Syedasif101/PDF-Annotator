const PDF = require('../models/PDF');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

// PDF upload controller
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Not a pdf file',
      });
    }

    const uuid = uuidv4();
    const fileName = req.file.originalname;
    const filePath = req.file.path;

    // save into Database
    const pdf = await PDF.create({
      uuid,
      fileName,
      filePath,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully!',
      pdf: {
        uuid: pdf.uuid,
        fileName: pdf.fileName,
        uploadDate: pdf.uploadDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while uploading PDF',
      error: error.message,
    });
  }
};

// List all user's PDF
const getUserPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ userId: req.userId })
      .select('uuid fileName uploadDate')
      .sort('-uploadDate');

    res.json({
      success: true,
      count: pdfs.length,
      pdfs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Problem while fetching pdf',
      error: error.message,
    });
  }
};

// Get single pdf
const getPDF = async (req, res) => {
  try {
    const { uuid } = req.params;

    const pdf = await PDF.findOne({ uuid, userId: req.userId });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found',
      });
    }

    // Send file
    res.sendFile(path.resolve(pdf.filePath));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while fetching pdf',
      error: error.message,
    });
  }
};

// Delete PDF
const deletePDF = async (req, res) => {
  try {
    const { uuid } = req.params;

    const pdf = await PDF.findOne({ uuid, userId: req.userId });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'Pdf not found this is not yours',
      });
    }

    // Delete from file system
    await fs.unlink(pdf.filePath);

    // Delete from database
    await pdf.deleteOne();

    res.json({
      success: true,
      message: 'PDF deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while deleting',
      error: error.message,
    });
  }
};

// PDF rename
const renamePDF = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { newName } = req.body;

    const pdf = await PDF.findOne({ uuid, userId: req.userId });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found',
      });
    }

    pdf.fileName = newName;
    await pdf.save();

    res.json({
      success: true,
      message: 'PDF renamed successfully',
      pdf: {
        uuid: pdf.uuid,
        fileName: pdf.fileName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while renaming',
      error: error.message,
    });
  }
};

module.exports = { uploadPDF, getUserPDFs, getPDF, deletePDF, renamePDF };
