import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "production" 
    ? "http://localhost:5001/api" 
    : "https://fullstack-chat-app-master-j115.onrender.com/api", // Deployed backend URL
  withCredentials: true,
});
