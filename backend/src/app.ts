import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db";
import authRoutes from "./modules/auth/routes/authRoutes";
import profileRoutes from "./modules/profile/routes/profileRoutes";
import feedRoutes from "./modules/feed/routes/feedRoutes";
import chatRoutes from "./modules/chat/routes/chatRoutes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL as string
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", require("./modules/subscription/routes/subscriptionRoutes").default);
app.use("/api/notifications", require("./modules/notifications/routes/notificationRoutes").default);
app.use("/api/admin", require("./modules/admin/routes/adminRoutes").default);

import { errorHandler } from "./middleware/errorHandler";

app.get("/", (_req, res) => {
  res.json({
    message: "NIRA API is running",
  });
});

// Global Error Handler (must be registered after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Basic Socket.IO setup
io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on("sendMessage", (data) => {
    // data should have { receiverId, message }
    io.to(data.receiverId).emit("newMessage", data.message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Pass io to request object so controllers can emit events if needed
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

server.listen(PORT, () => {
  console.log(`NIRA backend (with Socket.IO) running on port ${PORT}`);
});


