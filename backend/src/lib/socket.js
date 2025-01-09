import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file

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
  socket.on("sendMessage", ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;
    if (receiverId && senderId) {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingMessage", { senderId, message });
      }
    }
  });


  // Handle user disconnecting
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

export function getReceiverSocketId(userSocketMap, receiverId) {
  return userSocketMap[receiverId] || null;
}

// Export app, server, and io for use in other parts of the application
export { app, server, io };
