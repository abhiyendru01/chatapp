import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file
import { sendPushNotification } from "./firebaseAdmin.js"; // function

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://chatapp003.vercel.app" // Replace with your production URL
      : "https://fullstack-chat-app-master-j115.onrender.com", // Replace with your development URL
    methods: ["GET", "POST"],
  },
});

let userSocketMap = {};  // To store userId and corresponding socketId

// When a new user connects
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Retrieve the userId from the query string during the socket connection
  const userId = socket.handshake.query.userId;
  
  // Ensure userId is available
  if (userId) {
    userSocketMap[userId] = socket.id;  // Map userId to socket id
  } else {
    console.error("No userId provided in the socket handshake.");
    socket.disconnect();  // Disconnect the socket if no userId is provided
    return;
  }

  // Emit the list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle the sending of messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;
    
    if (receiverId && senderId) {
      // Find the receiver's socketId from the userSocketMap
      const receiverSocketId = userSocketMap[receiverId];
      
      if (receiverSocketId) {
        // Emit the message to the receiver in real-time
        io.to(receiverSocketId).emit("incomingMessage", { senderId, message });

        // Send push notification if the user is not connected to the app
        const receiverFCMToken = await getReceiverFCMToken(receiverId);  // Retrieve the FCM token from your DB
        if (receiverFCMToken) {
          sendPushNotification(receiverFCMToken, message);  // Send the push notification to the receiver
        }
      }
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    if (userId) {
      // Remove the user from the userSocketMap
      delete userSocketMap[userId];
      // Emit the updated list of online users to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// Function to retrieve the receiver's FCM token from the database
async function getReceiverFCMToken(receiverId) {
  try {
    const user = await User.findById(receiverId);
    return user?.fcmToken;  // Assuming you store the FCM token in the 'fcmToken' field of your User model
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
}

export function getReceiverSocketId(userSocketMap, receiverId) {
  return userSocketMap[receiverId] || null;
}

// Export the app, server, and io for use in other parts of the application
export { app, server, io };
