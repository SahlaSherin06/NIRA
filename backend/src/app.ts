import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";

dotenv.config();

// We must import connectDB and auth AFTER dotenv.config() 
// so environment variables are populated.
import { connectDB } from "./config/db";
import { auth } from "./config/auth";

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

app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount Better Auth node handler with error catching
app.all(["/api/auth", "/api/auth/*path"], async (req, res, next) => {
  try {
    const handler = toNodeHandler(auth);
    await handler(req, res);
  } catch (error: any) {
    console.error(" BETTER AUTH FATAL CRASH:", error);
    res.status(500).json({ 
      error: "Backend Auth Crash", 
      message: error.message || String(error)
    });
  }
});

app.get("/", (_req, res) => {
  res.json({
    message: "NIRA API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NIRA backend running on port ${PORT}`);
});