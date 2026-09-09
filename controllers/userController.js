const userSchema = require('../models/userSchema');

// Fetching logged in user details
const getUserDetails = async (req, res) => {
  try {
    const user = await userSchema.findById(req.user.userid).populate('posts');
    if (!user) {
      return res.json({ success: false });
    }
    res.json({ user, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};

// Fetching profile owner details (public/viewed user)
const getProfileOwnerDetails = async (req, res) => {
  try {
    const { profileOwnerId } = req.body;
    const profileOwner = await userSchema.findById(profileOwnerId).populate('posts');
    if (!profileOwner) {
      return res.json({ success: false, message: 'user is not found' });
    }
    res.json({ success: true, profileOwner });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
};

// Fetching profile viewers for logged-in user
const getProfileViewers = async (req, res) => {
  try {
    const currentUser = await userSchema.findById(req.user.userid).populate('profile_viewer');
    if (!currentUser) {
      return res.json({ success: false, message: 'user is not found' });
    }
    res.json({ success: true, currentUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
};

// Record profile viewer visit
const recordProfileViewer = async (req, res) => {
  try {
    const { profileOwnerId } = req.body;
    const profileOwner = await userSchema.findById(profileOwnerId);
    if (!profileOwner) {
      return res.json({ success: false, message: 'profile owner is not found' });
    }
    const isPresent = profileOwner.profile_viewer.some((id) => id.toString() === req.user.userid);
    if (!isPresent) {
      profileOwner.profile_viewer.push(req.user.userid);
      await profileOwner.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
};

module.exports = {
  getUserDetails,
  getProfileOwnerDetails,
  getProfileViewers,
  recordProfileViewer,
};
