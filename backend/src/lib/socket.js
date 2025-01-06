import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chatapp003.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Support fallback
});

// User-Socket mapping
const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Extract userId from handshake query and store it
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // Notify all users about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle "call" event
  socket.on("call", ({ receiverId }) => {
    const senderId = socket.handshake.query.userId;

    console.log(`Call event: senderId=${senderId}, receiverId=${receiverId}`);
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { senderId });
      console.log(`Incoming call sent to ${receiverId}`);
    } else {
      console.log(`Receiver ${receiverId} not online.`);
    }
  });

  // Handle "disconnect"
  socket.on("disconnect", (reason) => {
    console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// Export necessary modules
export { app, server };
export default io;
