import express from "express";
import { searchUser, handleFriendRequest, acceptFriendRequest } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/searchUser", searchUser);
router.post("/friendRequest", handleFriendRequest);
router.post("/acceptFriendRequest", acceptFriendRequest);

export default router;
