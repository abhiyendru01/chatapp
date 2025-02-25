import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";
import { getReceiverSocketId, io } from "../lib/socket.js";

const upload = multer({ storage: multer.memoryStorage() });

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch users excluding the logged-in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);  // Return filtered users
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const uploadAudio = async (req, res) => {
  try {
    console.log("Received request to upload audio");

    if (!req.file) {
      console.error("❌ No audio file received");
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log("✅ Audio file received:", req.file);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "audio" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary Upload Success:", result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("❌ Unexpected Error in uploadAudio:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Receiver userId
    const myId = req.user?._id; // Sender userId (current logged-in user)

    if (!myId) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }

    if (!userToChatId) {
      return res.status(400).json({ error: "Receiver ID is required." });
    }

    // Fetch messages between both users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) // Sort in ascending order
      .lean(); // Convert documents to plain JavaScript objects

    console.log("Fetched Messages:", messages); // Debugging log

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio, // Include the audio URL in the message
    });

    await newMessage.save();

    // Emit the new message to the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Emit the new message to the sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateFCMToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's FCM token
    user.fcmToken = fcmToken;
    await user.save();

    res.status(200).json({ message: "FCM token updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};