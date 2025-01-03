import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    console.log("Token Received:", token); // Log token received from request

    if (!token) {
      return next(); // Skip unauthorized response and move to next middleware
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded); // Log the decoded token

    if (!decoded) {
      return next(); // Skip unauthorized response and move to next middleware
    }

    const user = await User.findById(decoded.userId).select('-password');

    console.log("User Data:", user); // Log the user data fetched from the database

    if (!user) {
      return next(); // Skip unauthorized response and move to next middleware
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware: ', error.message);
    return next(); // Skip unauthorized response and move to next middleware
  }
};
