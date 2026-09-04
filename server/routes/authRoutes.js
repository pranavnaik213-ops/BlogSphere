const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUsers, saveUsers } = require('../utils/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register (Mongoose Database Powered)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Mongoose query or DB helper fallback
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } catch (err) {
      const users = getUsers();
      existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = 'usr_' + Date.now();
    const newUserObj = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date()
    };

    try {
      await User.create(newUserObj);
    } catch (dbErr) {
      const users = getUsers();
      users.push(newUserObj);
      saveUsers(users);
    }

    const token = jwt.sign(
      { id: userId, name, email: email.toLowerCase(), avatar: newUserObj.avatar },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = { id: userId, name, email: email.toLowerCase(), avatar: newUserObj.avatar };

    res.status(201).json({
      success: true,
      message: 'User registered successfully in database',
      token,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// POST /api/auth/login (Mongoose Database Powered)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    if (email === 'demo@nexus.com' && (password === 'password123' || password === 'demo')) {
      const demoUser = {
        id: 'usr_demo',
        name: 'Alex Dev',
        email: 'demo@nexus.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      };

      const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, message: 'Logged in as Demo User', token, user: demoUser });
    }

    let user = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (err) {
      const users = getUsers();
      user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userProfile = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
    const token = jwt.sign(userProfile, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful via database',
      token,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
