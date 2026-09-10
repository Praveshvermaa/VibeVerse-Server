const post = require('../models/post');
const user = require('../models/userSchema');
const cloudinary = require('cloudinary').v2;
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Creating new user post
const createPost = async (req, res) => {
  try {
    const { postCaption } = req.body;
    const result = sentiment.analyze(postCaption || '');

    const loginuser = await user.findById(req.user.userid);
    const imageUrl = req.file.path;
    console.log('image is uploaded successfully', imageUrl);

    const newpost = new post({
      userId: loginuser._id,
      postImage: imageUrl,
      postCaption: postCaption,
      public_id: req.file.filename,
      comments: {
        text: postCaption,
        user: loginuser.username,
      },
      sentimentScore: result.score,
    });

    await newpost.save();
    loginuser.posts.push(newpost._id);
    await loginuser.save();

    return res.json({ success: true });
  } catch (error) {
    console.log('err:', error);
    res.json({ success: false });
  }
};

// Editing profile picture
const editProfilePicture = async (req, res) => {
  try {
    const loginuser = await user.findById(req.user.userid);
    if (!loginuser) {
      return res.json({ success: false });
    }
    const imageUrl = req.file.path;
    console.log(imageUrl);

    loginuser.profile_picture = imageUrl;
    await loginuser.save();
    res.json({ user: loginuser, success: true });
  } catch (error) {
    console.log('error', error);
    res.json({ success: false, error });
  }
};

// Fetching all posts sorted by sentiment score
const getAllPosts = async (req, res) => {
  try {
    const allpost = await post.find().sort({ sentimentScore: -1 }).populate('userId');
    res.json({ success: true, posts: allpost });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error });
  }
};

// Deleting a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ success: false, message: 'Post ID is required' });
    }
    const postToDelete = await post.findById(id);
    if (!postToDelete) {
      return res.json({ success: false, message: 'Post is not found' });
    }
    const result = await cloudinary.uploader.destroy(postToDelete.public_id);
    if (result.result === 'ok') {
      console.log('Image deleted successfully');
    } else {
      res.status(404).json({ message: 'Image not found' });
    }

    const updateduser = await user.findByIdAndUpdate(
      req.user.userid,
      { $pull: { posts: id } },
      { new: true }
    ).populate('posts');

    await post.findByIdAndDelete(id);

    return res.json({ updateduser, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ success: false });
  }
};

// Fetching current user posts
const getUserPosts = async (req, res) => {
  try {
    const getuser = await user
      .findById(req.user.userid)
      .populate('posts');

    if (getuser) {
      return res.json({ getuser, success: true });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

// Fetching posts for analytics dashboard
const getDashboardPosts = async (req, res) => {
  try {
    const foundUser = await user.findById(req.user.userid).populate('posts');
    if (!foundUser) return res.status(404).json({ message: 'user is not found' });
    res.status(201).json({ success: true, user: foundUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
};

// Toggling like on a post (Like / Unlike)
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid;

    const targetPost = await post.findById(id);
    if (!targetPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!targetPost.likes) {
      targetPost.likes = [];
    }

    const hasLiked = targetPost.likes.some((likeId) => likeId.toString() === userId);

    if (hasLiked) {
      targetPost.likes = targetPost.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      targetPost.likes.push(userId);
    }

    await targetPost.save();

    return res.json({
      success: true,
      liked: !hasLiked,
      likesCount: targetPost.likes.length,
      likes: targetPost.likes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Error toggling like', error });
  }
};

module.exports = {
  createPost,
  editProfilePicture,
  getAllPosts,
  deletePost,
  getUserPosts,
  getDashboardPosts,
  toggleLike,
};
