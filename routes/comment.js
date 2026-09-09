const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  addComment,
  getComments,
  analyzeSentiment,
} = require('../controllers/commentController');

router.post('/post/comment/:id', verifyToken, addComment);
router.get('/post/comment/:id', getComments);
router.post('/post/sentiment-analysis', analyzeSentiment);

module.exports = router;