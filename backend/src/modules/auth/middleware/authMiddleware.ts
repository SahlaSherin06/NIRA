import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || "access_secret";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized, no token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, ACCESS_SECRET as string) as any;
    req.user = decoded;

    // Check if the user is suspended/banned
    if (decoded && decoded.userId) {
      const userDoc = await User.findById(decoded.userId).select("isBanned role");
      if (userDoc?.isBanned) {
        res.status(403).json({
          message: "Your account has been suspended by the administrator due to policy violations.",
          isBanned: true,
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


