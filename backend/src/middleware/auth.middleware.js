import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies or Authorization header
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log("Token Received:", token); // Log token received from request

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Log the decoded token
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    // Fetch user data
    const user = await User.findById(decoded.userId).select('-password');
    console.log("User Data:", user); // Log the user data fetched from the database

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
