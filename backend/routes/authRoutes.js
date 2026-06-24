const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    
    if (user && user.password === password) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
  } catch(err) {
    next(err);
  }
});

module.exports = router;