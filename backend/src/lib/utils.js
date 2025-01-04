import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
    sameSite: "none", // Always use 'none' for cross-site requests
    secure: true, // Always use secure in production
    path: "/", // Ensure cookie is available on all paths
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : "localhost" // Set domain explicitly
  });

  return token;
};