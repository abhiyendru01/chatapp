import express from "express";
import { sendFriendRequest, acceptFriendRequest } from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/send", sendFriendRequest);
router.post("/accept", acceptFriendRequest);

export default router;
