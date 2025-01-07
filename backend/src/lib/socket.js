import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js"; // Assuming you have this model file

const app = express();
const server = http.createServer(app);

<<<<<<< HEAD
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

=======
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
>>>>>>> 5c591c1cdcba97e3653479dd0014806ce428b267
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  
  const userId = socket.handshake.query.userId; // Retrieve userId from handshake query
  
  // Check if userId is available before continuing
  if (userId) {
    userSocketMap[userId] = socket.id;
  } else {
    console.error("No userId provided in the socket handshake.");
    socket.disconnect();
    return; // Disconnect the socket if no userId is provided
  }

  // Notify all connected users of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user search event
  socket.on("searchUser", async (username) => {
    try {
      const users = await User.find({ username: new RegExp(username, "i") });
      socket.emit("searchResults", users);
    } catch (error) {
      console.error("Error in searchUser:", error);
      socket.emit("error", "Error fetching users");
    }
  });

<<<<<<< HEAD
  // Handle message sending
  socket.on("sendMessage", ({ receiverId, message }) => {
    const senderId = socket.handshake.query.userId;
    if (receiverId && senderId) {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingMessage", { senderId, message });
=======
  // Handle sending a friend request
  socket.on("sendFriendRequest", async ({ recipientId }) => {
    const senderId = userId;
    if (senderId && recipientId) {
      try {
        const recipient = await User.findById(recipientId);
        if (recipient) {
          recipient.friendRequests.push(senderId);
          await recipient.save();
          io.to(userSocketMap[recipientId]).emit("friendRequestReceived", senderId);
        } else {
          socket.emit("error", "Recipient not found");
        }
      } catch (error) {
        console.error("Error in sendFriendRequest:", error);
        socket.emit("error", "Error sending friend request");
      }
    }
  });

  // Handle accepting a friend request
  socket.on("acceptFriendRequest", async ({ senderId }) => {
    const recipientId = userId;
    if (recipientId && senderId) {
      try {
        const recipient = await User.findById(recipientId);
        if (recipient) {
          recipient.friends.push(senderId);
          recipient.friendRequests = recipient.friendRequests.filter(id => id !== senderId);
          await recipient.save();
          io.to(userSocketMap[senderId]).emit("friendRequestAccepted", recipientId);
        } else {
          socket.emit("error", "Recipient not found");
        }
      } catch (error) {
        console.error("Error in acceptFriendRequest:", error);
        socket.emit("error", "Error accepting friend request");
      }
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    const senderId = userId;
    if (receiverId && senderId && message) {
      try {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("incomingMessage", { senderId, message });
        } else {
          socket.emit("error", "Recipient not online");
        }
      } catch (error) {
        console.error("Error in sendMessage:", error);
        socket.emit("error", "Error sending message");
>>>>>>> 5c591c1cdcba97e3653479dd0014806ce428b267
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

<<<<<<< HEAD

=======
// Function to get the socket ID of a receiver (optional)
>>>>>>> 5c591c1cdcba97e3653479dd0014806ce428b267
export function getReceiverSocketId(userSocketMap, receiverId) {
  return userSocketMap[receiverId] || null;
}

// Export app, server, and io for use in other parts of the application
<<<<<<< HEAD
export { app, server , io }; ;
=======
export { app, server, io };
>>>>>>> 5c591c1cdcba97e3653479dd0014806ce428b267
