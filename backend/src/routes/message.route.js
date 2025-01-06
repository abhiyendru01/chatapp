const express = require("express");
const { searchUser, handleFriendRequest, acceptFriendRequest } = require("../controllers/message.controller");

const router = express.Router();

router.post("/searchUser", searchUser);
router.post("/friendRequest", handleFriendRequest);
router.post("/acceptFriendRequest", acceptFriendRequest);

module.exports = router;
