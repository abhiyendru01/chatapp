import { io, getReceiverSocketId } from "../lib/socket.js";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Unable to fetch users for sidebar." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!userToChatId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Unable to fetch messages." });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { query } = req.body;  // The search query from the request body
    const loggedInUserId = req.user._id;  // The logged-in user

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Search users by full name or email, excluding the logged-in user
    const users = await User.find({
      $and: [
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },  // Search by full name (case insensitive)
            { email: { $regex: query, $options: "i" } }  // Search by email (case insensitive)
          ]
        },
        { _id: { $ne: loggedInUserId } }  // Exclude the logged-in user from search results
      ]
    }).select("-password");  // Exclude password from the response

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found matching the search query." });
    }

    res.status(200).json(users);  // Return the search results
  } catch (error) {
    console.error("Error in searchUser:", error.message);
    res.status(500).json({ error: "Unable to search for users." });
  }
};


export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;  // User who sent the friend request

    const loggedInUserId = req.user._id;  // The logged-in user

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Find the logged-in user and check if the userId exists in their friendRequests
    const user = await User.findById(loggedInUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const friendRequestIndex = user.friendRequests.indexOf(userId);

    if (friendRequestIndex === -1) {
      return res.status(400).json({ error: "No friend request from this user." });
    }

    // Remove the userId from friendRequests
    user.friendRequests.splice(friendRequestIndex, 1);

    // Add the userId to friends list
    user.friends.push(userId);

    // Save the updated user data
    await user.save();

    // Find the requested user and add the logged-in user to their friends list
    const requestedUser = await User.findById(userId);
    if (!requestedUser) {
      return res.status(404).json({ error: "Requested user not found." });
    }

    requestedUser.friends.push(loggedInUserId);
    await requestedUser.save();

    res.status(200).json({ message: "Friend request accepted successfully." });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ error: "Unable to accept friend request." });
  }
};

export const handleFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;  // The user who sent the friend request

    const loggedInUserId = req.user._id;  // The logged-in user

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Check if the user already has a friend request from the logged-in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Requested user not found." });
    }

    if (user.friendRequests.includes(loggedInUserId)) {
      return res.status(400).json({ error: "Friend request already sent." });
    }

    // Add the logged-in user to the friend requests of the target user
    user.friendRequests.push(loggedInUserId);
    await user.save();

    res.status(200).json({ message: "Friend request sent successfully." });
  } catch (error) {
    console.error("Error in handleFriendRequest:", error.message);
    res.status(500).json({ error: "Unable to send friend request." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!receiverId || (!text && !image)) {
      return res.status(400).json({ error: "Receiver ID and message content are required." });
    }

    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, { folder: "chat_images" });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ error: "Failed to upload image." });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Unable to send message." });
  }
};
