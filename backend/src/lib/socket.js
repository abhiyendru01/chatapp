import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";  // Your user model
import { sendPushNotification } from "./firebaseAdmin.js";  // Function to send push notifications

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Frontend URL during development
      "https://chatapp003.vercel.app", // Frontend URL in production
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let userSocketMap = {};  // Store userId to socketId mapping

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

// Listen for incoming connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} is now online.`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Update online users list
  }

  socket.on("call", async (receiverId) => {
    const senderId = userId;

    if (!receiverId || !senderId) {
      console.error("call: Missing senderId or receiverId.");
      return;
    }

    // Check if the receiver is online
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log(`✅ User ${receiverId} is online, sending call event.`);
      io.to(receiverSocketId).emit("incomingCall", { senderId });
    } else {
      console.log(`⚠️ User ${receiverId} is offline.`);
      // Send a push notification if the receiver is offline
      const receiverFCMToken = await getReceiverFCMToken(receiverId);
      if (receiverFCMToken) {
        await sendPushNotification(receiverFCMToken, "You have an incoming call!");
      } else {
        console.warn(`🚨 User ${receiverId} does not have an FCM token.`);
      }
    }
  });

  // Handle user disconnections
  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User ${userId} disconnected.`);
      delete userSocketMap[userId];  // Remove from online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Emit updated online users list
    }
  });
});

// Export the app, server, and io
export { app, server, io };
export { getReceiverSocketId, io };