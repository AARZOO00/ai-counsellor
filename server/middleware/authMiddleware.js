const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check karo ki Header mein "Authorization" hai aur wo "Bearer" se shuru hota hai
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Token nikalo (Bearer word hata kar)
      token = req.headers.authorization.split(' ')[1];

      // 3. Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. User dhoond kar request mein jod do
      const foundUser = await User.findById(decoded.id).select('-password');
      if (!foundUser) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      req.user = foundUser;

      return next(); // Sab sahi hai, aage badho
    } catch (error) {
      console.error("Token Failed:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };