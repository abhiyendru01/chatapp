import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Save message to the database
    await newMessage.save();

    // Emit the new message to the receiver if they are connected via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Send message to the receiver through WebSocket (Socket.io)
      io.to(receiverSocketId).emit("incomingMessage", newMessage);
    }

    // Also emit to all connected users (if required, you can send this to all clients)
    io.emit("incomingMessage", newMessage); // Emit the new message to all connected clients

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
