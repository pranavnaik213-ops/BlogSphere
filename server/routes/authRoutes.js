const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers, saveUsers } = require('../utils/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Handle Demo Login shortcut
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

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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
      message: 'Login successful',
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
