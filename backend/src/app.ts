import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db";
import authRoutes from "./modules/auth/routes/authRoutes";
import profileRoutes from "./modules/profile/routes/profileRoutes";
import feedRoutes from "./modules/feed/routes/feedRoutes";

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
app.use("/api/notifications", require("./modules/notifications/routes/notificationRoutes").default);

app.get("/", (_req, res) => {
  res.json({
    message: "NIRA API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NIRA backend running on port ${PORT}`);
});


