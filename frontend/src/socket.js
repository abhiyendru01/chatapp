// src/socket.js or similar file
import { io } from "socket.io-client";

const socket = io("http://localhost:5001", "https://fullstack-chat-app-master-j115.onrender.com",{
  withCredentials: true, // Enables cookies for session management
});

export default socket;
