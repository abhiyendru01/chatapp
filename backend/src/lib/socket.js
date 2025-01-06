import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
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

  // Handle sending friend request
  socket.on("sendFriendRequest", async ({ recipientId }) => {
    const senderId = socket.handshake.query.userId;
    if (senderId && recipientId) {
      const recipient = await User.findById(recipientId);
      if (recipient) {
        recipient.friendRequests.push(senderId);
        await recipient.save();
        io.to(userSocketMap[recipientId]).emit("friendRequestReceived", senderId);
      }
    }
  });

  // Handle accepting friend requests
  socket.on("acceptFriendRequest", async ({ senderId }) => {
    const recipientId = socket.handshake.query.userId;
    if (recipientId && senderId) {
      const recipient = await User.findById(recipientId);
      if (recipient) {
        recipient.friends.push(senderId);
        recipient.friendRequests = recipient.friendRequests.filter(id => id !== senderId);
        await recipient.save();
        io.to(userSocketMap[senderId]).emit("friendRequestAccepted", recipientId);
      }
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

export const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app"
      : "http://localhost:5173",
  },
});