const userSchema = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!password) {
      return res.json({ success: false, message: 'Password is not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    let user = await userSchema.findOne({ email });
    if (user) {
      return res.json({ success: false, message: 'User already exists' });
    }
    user = await userSchema.create({ username, name, email, hashPassword });

    res.json({ user, success: true, message: 'registration successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Registration failed', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: 'Email or password are not found!' });
  }

  try {
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User do not exists!' });
    }

    if (!user.hashPassword) {
      return res.json({ success: false, message: 'Password is required!!' });
    }

    const isMatchPassword = await bcrypt.compare(password, user.hashPassword);
    if (!isMatchPassword) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    const payload = { userid: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.SECRET_KEY);

    res.json({ token, user, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Login failed', error });
  }
};

module.exports = {
  register,
  login,
};
