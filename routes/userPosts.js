const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  getUserPosts,
  recordProfileViewer,
  getDashboardPosts,
} = require('../controllers/postController');
const { recordProfileViewer: recordViewer } = require('../controllers/userController');

// Routes to fetch all posts uploaded by user
router.get('/userposts', verifyToken, getUserPosts);

// Route to store current user's id to the user whose profile is being viewed
router.post('/profileveiwer', verifyToken, recordViewer);

// Dashboard user posts
router.get('/dashboard/usersposts', verifyToken, getDashboardPosts);

module.exports = router;