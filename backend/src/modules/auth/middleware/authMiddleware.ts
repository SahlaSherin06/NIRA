import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || "access_secret";

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized, no token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) { res.status(401).json({ message: "Unauthorized" }); return; }
    
    // Verify token
    const decoded = jwt.verify(token, ACCESS_SECRET as string);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


