import User from "../models/user.model.js";

/** 
 * @desc Send a friend request 
 * @route POST /api/friends/send-request
 * @access Private
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found." });
    }

    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }

    // Add sender ID to receiver's friend requests
    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent successfully!" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/** 
 * @desc Accept a friend request
 * @route POST /api/friends/accept-request
 * @access Private
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.body;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No pending friend request from this user." });
    }

    // Remove sender from friend requests and add to friends list
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/** 
 * @desc Reject a friend request
 * @route POST /api/friends/reject-request
 * @access Private
 */
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senderId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No pending friend request from this user." });
    }

    // Remove sender from friend requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    await user.save();

    res.status(200).json({ message: "Friend request rejected!" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/** 
 * @desc Get list of friends
 * @route GET /api/friends/friends
 * @access Private
 */
export const getFriendList = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friends", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("getFriendList API response:", user.friends); // Debugging

    res.status(200).json(user.friends); // Must return an array
  } catch (error) {
    console.error("Error in getFriendList:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/** 
 * @desc Get list of pending friend requests
 * @route GET /api/friends/friend-requests
 * @access Private
 */
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friendRequests", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user.friendRequests);
  } catch (error) {
    console.error("Error in getFriendRequests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/** 
 * @desc Search for users by name
 * @route GET /api/friends/search
 * @access Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    const users = await User.find({
      fullName: { $regex: query, $options: "i" }
    }).select("fullName email profilePic");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
