import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Initialize socket.io after creating the server
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app"
      : "http://localhost:5173",
  },
});

// Define userSocketMap outside the socket connection
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle search user
  socket.on("searchUser", async (username) => {
    try {
      const users = await User.find({ username: new RegExp(username, "i") });
      socket.emit("searchResults", users);
    } catch (error) {
      console.error(error);
    }
  });

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

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});


export function getReceiverSocketId(userSocketMap, receiverId) {
  return userSocketMap[receiverId] || null;
}

// Export app, server, and io for use in other parts of the application
export { app, server , io }; ;
