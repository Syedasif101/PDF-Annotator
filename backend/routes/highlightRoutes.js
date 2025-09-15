const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
} = require('../controllers/highlightController');

router.use(protect);

router.post('/', createHighlight);
router.get('/pdf/:pdfId', getHighlights);
router.patch('/:id', updateHighlight);
router.delete('/:id', deleteHighlight);

module.exports = router;
