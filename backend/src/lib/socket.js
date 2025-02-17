import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file
import { sendPushNotification } from "../lib/firebaseAdmin"; // Import the push notification function

const app = express();
const server = http.createServer(app);

// Initialize io after creating the server
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://chatapp003.vercel.app"
      : "http://localhost:5173", // Replace with your actual development URL
    methods: ["GET", "POST"],
  },
});

let userSocketMap = {};

// Connection event for new users
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  const userId = socket.handshake.query.userId; // Retrieve userId from handshake query
  
  if (userId) {
    userSocketMap[userId] = socket.id;
  } else {
    console.error("No userId provided in the socket handshake.");
    socket.disconnect();
    return; // Disconnect if no userId
  }

  // Notify all connected users of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle message sending
  socket.on("sendMessage", async ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;
    if (receiverId && senderId) {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        // Emit message to the receiver in real-time
        io.to(receiverSocketId).emit("incomingMessage", { senderId, message });
        
        // Send push notification if the user is not connected to the app
        const receiverFCMToken = await getReceiverFCMToken(receiverId);  // Retrieve the FCM token from your DB
        if (receiverFCMToken) {
          sendPushNotification(receiverFCMToken, message);  // Send push notification
        }
      }
    }
  });

  // Listen for messageReceived to notify sender of successful message delivery
  socket.on("messageReceived", ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;
    if (receiverId && senderId) {
      // Optionally, acknowledge the message reception
      io.to(senderId).emit("messageAck", { receiverId, message });
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Update the list of online users
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// Function to get the receiver's FCM token from the database
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    return user?.fcmToken;  // Assuming you store the FCM token in the 'fcmToken' field
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
}

// Export app, server, and io for use in other parts of the application
export { app, server, io };
