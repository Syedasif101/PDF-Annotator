const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  uploadPDF,
  getUserPDFs,
  getPDF,
  deletePDF,
  renamePDF,
} = require('../controllers/pdfController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sirf PDF files allowed hain bhai!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max size
  },
});

// Routes with protection
router.post('/upload', protect, upload.single('pdf'), uploadPDF);
router.get('/my-pdfs', protect, getUserPDFs);
router.get('/:uuid', protect, getPDF);
router.delete('/:uuid', protect, deletePDF);
router.patch('/:uuid/rename', protect, renamePDF);

module.exports = router;
