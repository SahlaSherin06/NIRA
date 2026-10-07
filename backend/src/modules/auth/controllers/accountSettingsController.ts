import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Function: changePassword
 * Changes the authenticated user's password.
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: "Current and new passwords are required" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ message: "New password must be at least 8 characters" });
    return;
  }

  const user = await User.findById(userId);
  if (!user || !user.password) {
    res.status(404).json({ message: "User not found or uses social login" });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400).json({ message: "Incorrect current password" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

/**
 * Function: changeEmail
 * Changes the authenticated user's email.
 */
export const changeEmail = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { newEmail, currentPassword } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!newEmail || !currentPassword) {
    res.status(400).json({ message: "New email and current password are required" });
    return;
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(newEmail)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  const user = await User.findById(userId);
  if (!user || !user.password) {
    res.status(404).json({ message: "User not found or uses social login" });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400).json({ message: "Incorrect current password" });
    return;
  }

  const existingEmail = await User.findOne({ email: newEmail.toLowerCase() });
  if (existingEmail && existingEmail._id.toString() !== userId) {
    res.status(400).json({ message: "This email is already in use by another account" });
    return;
  }

  user.email = newEmail.toLowerCase();
  await user.save();

  res.status(200).json({ message: "Email updated successfully" });
});
