const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/verifyToken');
const {
  createPost,
  editProfilePicture,
  getAllPosts,
  deletePost,
} = require('../controllers/postController');

// Route to create new user post
router.post('/upload', upload.single('postImage'), verifyToken, createPost);

// Route to edit profile picture
router.post('/editpicture', upload.single('profileImage'), verifyToken, editProfilePicture);

// Routes for fetch all posts that exist in database
router.get('/allposts', getAllPosts);

// Delete post
router.post('/deletePost', verifyToken, deletePost);

module.exports = router;