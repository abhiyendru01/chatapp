import axios from "axios";
import { API_CONFIG } from "./constants";

// Create and configure axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? API_CONFIG.DEVELOPMENT_URL 
    : API_CONFIG.PRODUCTION_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});