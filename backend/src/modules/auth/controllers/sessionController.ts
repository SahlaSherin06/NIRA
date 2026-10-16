import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { generateTokens } from "../../../utils/jwtUtils";
import { AuthRequest } from "../middleware/authMiddleware";

const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "refresh_secret";

/**
 * Function: getMe
 * Executes the core operations and logic for get me.
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Ensure admin email is always synced with admin role
  if (user.email.toLowerCase() === "sahlasherins86+admin@gmail.com" && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }

  res.status(200).json({ user });
});

/**
 * Function: refreshToken
 * Executes the core operations and logic for refresh token.
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  const session = await Session.findOne({ userId: decoded.userId, refreshToken: token });
  if (!session) {
    res.status(401).json({ message: "Session not found" });
    return;
  }

  // Clean up previous session and issue new tokens
  await Session.deleteOne({ refreshToken: token });
  const accessToken = await generateTokens(decoded.userId, res);
  res.status(200).json({ accessToken });
});

/**
 * Function: logout
 * Executes the core operations and logic for logout.
 */
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken;
  
  if (token) {
    await Session.deleteOne({ refreshToken: token });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

