import express from "express";
import { checkAuth, login, logout, signup, updateProfile, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendsList } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

// Using protectRoute middleware for these routes
router.post("/send-friend-request", protectRoute, sendFriendRequest);
router.post("/accept-friend-request", protectRoute, acceptFriendRequest);
router.post("/reject-friend-request", protectRoute, rejectFriendRequest);
router.get("/friends", protectRoute, getFriendsList);

export default router;
