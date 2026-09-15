import express from "express";
import { Profile } from "../models/Profile";
import { auth } from "../config/auth";

const router = express.Router();

// Middleware to protect routes and inject session user
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Attach user to request
    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/profile
// Fetches the current user's profile draft, or creates a blank one if it doesn't exist
router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
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
// Updates the profile with new data (auto-saves drafts on every step)
router.patch("/", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
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
