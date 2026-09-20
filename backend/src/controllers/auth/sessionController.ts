import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../models/User";
import { Session } from "../../models/Session";
import { generateTokens } from "../../utils/jwtUtils";
import { AuthRequest } from "../../middleware/authMiddleware";

const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "refresh_secret";

// 9. GET CURRENT USER (ME)
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Failed to get user data" });
  }
};

// 10. REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    // Check if session exists in DB
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      res.status(401).json({ message: "Session revoked or invalid" });
      return;
    }

    // Generate new tokens (rotates refresh token for better security)
    await Session.deleteOne({ _id: session._id }); // Delete old session
    const accessToken = await generateTokens(decoded.userId, res);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

// 11. LOGOUT
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    
    if (token) {
      await Session.deleteOne({ refreshToken: token });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Failed to logout" });
  }
};
