import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet"; // Add helmet
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import { app, server } from "./lib/socket.js";
import uploadAudioRouter from './routes/upload';

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp003.vercel.app",
  "https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app",
  "http://localhost:5001",
];

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Add CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);

// Add Helmet for Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Allows inline scripts; remove if not necessary
          "https://chatapp003.vercel.app",
          "https://fullstack-chat-4vla6v6q8-abhiyendru01s-projects.vercel.app",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Allows inline styles; remove if not necessary
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "https://chatapp003.vercel.app",
        ],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use('/api', uploadAudioRouter); 

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});
