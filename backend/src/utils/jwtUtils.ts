import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";
import { Session } from "../modules/auth/models/Session";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export const generateTokens = async (userId: mongoose.Types.ObjectId, res: Response) => 
  {
  // 1. Create Access Token
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });

  // 2. Create Refresh Token 
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });

  // 3. Store Refresh Token in DB (Session Collection)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  await Session.create({
    userId,
    refreshToken, 
    expiresAt,
  });

  // 4. Set HTTP-Only Cookie for Refresh Token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents JavaScript from reading it (XSS protection)
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return accessToken;
};
