const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  getUserDetails,
  getProfileOwnerDetails,
  getProfileViewers,
} = require('../controllers/userController');

// Routes to fetch logged in user details
router.get('/userdetails', verifyToken, getUserDetails);

// Routes to fetch profile owner details
router.post('/profileownerdetails', getProfileOwnerDetails);

// Route to fetch profile viewers
router.get('/profileviewer', verifyToken, getProfileViewers);

module.exports = router;