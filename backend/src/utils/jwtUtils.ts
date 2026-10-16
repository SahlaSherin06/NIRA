import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";
import { Session } from "../modules/auth/models/Session";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export const generateTokens = async (userId: mongoose.Types.ObjectId, res: Response) => {
  // 1. Create Access Token (7 days for seamless matrimonial app user experience)
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "7d" });

  // 2. Create Refresh Token (30 days persistence)
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "30d" });

  // 3. Store Refresh Token in DB (Session Collection)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
  
  await Session.create({
    userId,
    refreshToken, 
    expiresAt,
  });

  // 4. Set HTTP-Only Cookie for Refresh Token with explicit root path
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents JavaScript from reading it (XSS protection)
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  return accessToken;
};
