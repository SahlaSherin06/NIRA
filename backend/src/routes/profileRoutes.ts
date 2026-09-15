import express, { Request, Response, NextFunction } from "express";
import { Profile } from "../models/Profile";
import { auth } from "../config/auth";

const router = express.Router();

// Define a strict type for requests that contain a user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Middleware to protect routes and inject session user
const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    if (!session || !session.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    // Attach user to request securely
    req.user = session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/profile
router.get("/", requireAuth as any, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      profile = await Profile.create({ userId });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PATCH /api/profile
router.patch("/", requireAuth as any, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const updatedData = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
