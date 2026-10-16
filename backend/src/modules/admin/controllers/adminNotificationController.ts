import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Notification } from "../../notifications/models/Notification";
import mongoose from "mongoose";

/**
 * GET /api/admin/notifications
 * Fetch admin platform notifications with filters and statistics
 */
export const getAdminNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const { type = "all", filter = "all" } = req.query;

    const matchQuery: any = { isAdminNotification: true };

    if (type !== "all") {
      matchQuery.type = type;
    }

    if (filter === "unread") {
      matchQuery.isRead = false;
    } else if (filter === "read") {
      matchQuery.isRead = true;
    }

    // Counts for stats pills
    const [
      totalUnread,
      totalReports,
      totalRegistrations,
      totalSubscriptions,
      totalNotifications,
    ] = await Promise.all([
      Notification.countDocuments({ isAdminNotification: true, isRead: false }),
      Notification.countDocuments({ isAdminNotification: true, type: "admin_report" }),
      Notification.countDocuments({ isAdminNotification: true, type: "admin_registration" }),
      Notification.countDocuments({ isAdminNotification: true, type: "admin_subscription" }),
      Notification.countDocuments(matchQuery),
    ]);

    // Aggregate with user details
    const notifications = await Notification.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "relatedUserId",
          foreignField: "_id",
          as: "relatedUser",
        },
      },
      {
        $unwind: { path: "$relatedUser", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "relatedUserId",
          foreignField: "userId",
          as: "relatedProfile",
        },
      },
      {
        $unwind: { path: "$relatedProfile", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "targetUserId",
          foreignField: "_id",
          as: "targetUser",
        },
      },
      {
        $unwind: { path: "$targetUser", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          message: 1,
          link: 1,
          isRead: 1,
          metadata: 1,
          createdAt: 1,
          updatedAt: 1,
          relatedUser: {
            _id: "$relatedUser._id",
            name: "$relatedUser.name",
            email: "$relatedUser.email",
            photo: "$relatedProfile.mainPhoto",
          },
          targetUser: {
            _id: "$targetUser._id",
            name: "$targetUser.name",
            email: "$targetUser.email",
          },
        },
      },
    ]);

    res.status(200).json({
      notifications,
      total: totalNotifications,
      page,
      pages: Math.ceil(totalNotifications / limit) || 1,
      stats: {
        unread: totalUnread,
        reports: totalReports,
        registrations: totalRegistrations,
        subscriptions: totalSubscriptions,
      },
    });
  }
);

/**
 * PATCH /api/admin/notifications/mark-all-read
 * Mark all admin notifications as read
 */
export const markAllAdminNotificationsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await Notification.updateMany(
      { isAdminNotification: true, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All admin notifications marked as read" });
  }
);

/**
 * PATCH /api/admin/notifications/:id/read
 * Mark a single admin notification as read
 */
export const markAdminNotificationRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), isAdminNotification: true } as any,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notif) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json({ message: "Notification marked as read", notification: notif });
  }
);

/**
 * DELETE /api/admin/notifications/:id
 * Delete a specific admin notification
 */
export const deleteAdminNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notif = await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      isAdminNotification: true,
    } as any);

    if (!notif) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  }
);

/**
 * DELETE /api/admin/notifications/clear-all
 * Clear all admin notifications
 */
export const clearAllAdminNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await Notification.deleteMany({ isAdminNotification: true });

    res.status(200).json({ message: "All admin notifications cleared successfully" });
  }
);
