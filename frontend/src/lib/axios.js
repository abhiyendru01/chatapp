import axios from "axios";
import { API_CONFIG } from "./constants";

// Create and configure axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? API_CONFIG.DEVELOPMENT_URL 
    : API_CONFIG.PRODUCTION_URL,
  withCredentials: false,  // No need for credentials since we're using localStorage
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to automatically add the token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
