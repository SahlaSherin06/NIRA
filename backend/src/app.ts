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
import { User } from "./modules/auth/models/User";

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

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL as string
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Pass io to request object so all route controllers can emit events
app.use((req: any, _res, next) => {
  req.io = io;
  next();
});

// Socket.IO setup with suspension security
io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);

  socket.on("join", async (userId) => {
    if (userId) {
      try {
        const userDoc = await User.findById(userId).select("isBanned");
        if (userDoc?.isBanned) {
          socket.emit("accountSuspended", {
            message: "Your account has been suspended by the administrator due to policy violations.",
            isBanned: true,
          });
          socket.disconnect(true);
          return;
        }
        socket.join(userId.toString());
        console.log(`User ${userId} joined their personal room`);
      } catch (err) {
        console.error("Socket join error:", err);
      }
    }
  });

  socket.on("sendMessage", async (data) => {
    // data should have { receiverId, message }
    try {
      if (data?.receiverId) {
        const receiver = await User.findById(data.receiverId).select("isBanned");
        if (receiver?.isBanned) {
          socket.emit("error", { message: "Recipient account has been suspended." });
          return;
        }
        io.to(data.receiverId.toString()).emit("newMessage", data.message);
      }
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

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

server.listen(PORT, () => {
  console.log(`NIRA backend (with Socket.IO) running on port ${PORT}`);
});


