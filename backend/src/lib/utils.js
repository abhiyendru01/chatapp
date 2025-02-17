import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS } from "./constants.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Optionally, you could still set the token in cookies for browsers that support it
  res.cookie("jwt", token, {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + COOKIE_OPTIONS.maxAge),
  });

  // Send the token in the response as well
  return token;
};
