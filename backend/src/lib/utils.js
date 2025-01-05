import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS } from "./constants.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    ...COOKIE_OPTIONS,
    expires: new Date(Date.now() + COOKIE_OPTIONS.maxAge)
  });

  return token;
};