import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file
import { sendPushNotification } from "./firebaseAdmin.js"; // Function to send push notifications

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Development frontend
      "https://chatapp003.vercel.app", // Production frontend
      "https://fullstack-chat-app-master-j115.onrender.com" // Render backend
    ],
    methods: ["GET", "POST"],
    credentials: true,  // Allows cookies and authentication headers
  },
});

let userSocketMap = {}; // Store userId to socketId mapping

// When a new user connects
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Retrieve the userId from the query string during socket connection
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;  // Store userId with socket id
    console.log(`User ${userId} is now online.`);
  } else {
    console.error("No userId provided in the socket handshake.");
    socket.disconnect(); // Disconnect if no userId is provided
    return;
  }

  // Emit updated online users list to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle sending messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;

    if (!receiverId || !senderId) {
      console.error("sendMessage: Missing senderId or receiverId.");
      return;
    }

    console.log(`📩 Message from ${senderId} to ${receiverId}: ${message}`);

    // Find the receiver's socketId
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log(`✅ User ${receiverId} is online, sending message.`);
      // Emit the new message to the receiver
      io.to(receiverSocketId).emit("newMessage", { senderId, message });
    } else {
      console.log(`⚠️ User ${receiverId} is offline, sending push notification.`);

      // Retrieve receiver's FCM token
      const receiverFCMToken = await getReceiverFCMToken(receiverId);
      if (receiverFCMToken) {
        await sendPushNotification(receiverFCMToken, message);
      } else {
        console.warn(`🚨 User ${receiverId} does not have an FCM token.`);
      }
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (userId) {
      console.log(`🔴 User ${userId} disconnected.`);
      delete userSocketMap[userId]; // Remove from online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users list
    }
  });
});

// Function to retrieve the receiver's FCM token from the database
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    if (!user) {
      console.error(`❌ User ${receiverId} not found in database.`);
      return null;
    }

    if (!user.fcmToken) {
      console.warn(`⚠️ User ${receiverId} does not have an FCM token.`);
      return null;
    }

    console.log(`✅ Retrieved FCM token for ${receiverId}: ${user.fcmToken}`);
    return user.fcmToken;
  } catch (error) {
    console.error("❌ Error retrieving FCM token:", error);
    return null;
  }
}

// Function to get receiver's socket ID
export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId] || null;
}

// Export the app, server, and io
export { app, server, io };
