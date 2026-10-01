import { Request, Response } from "express";
import { Notification } from "../models/Notification";

/**
 * Function: getNotifications
 * Executes the core operations and logic for get notifications.
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("relatedUserId", "name")
      .limit(20);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Function: markAsRead
 * Executes the core operations and logic for mark as read.
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark Notifications Read Error:", error);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
