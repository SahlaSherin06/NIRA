import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { Notification } from "../models/Notification";

/**
 * Function: getNotifications
 * Executes the core operations and logic for get notifications.
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const notifications = await Notification.aggregate([
    { $match: { userId: new (require("mongoose").Types.ObjectId)(userId) } },
    { $sort: { createdAt: -1 } },
    { $limit: 30 },
    {
      $lookup: {
        from: "users",
        localField: "relatedUserId",
        foreignField: "_id",
        as: "relatedUser"
      }
    },
    {
      $unwind: { path: "$relatedUser", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "profiles",
        localField: "relatedUserId",
        foreignField: "userId",
        as: "relatedProfile"
      }
    },
    {
      $unwind: { path: "$relatedProfile", preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        message: 1,
        isRead: 1,
        createdAt: 1,
        relatedUser: {
          _id: "$relatedUser._id",
          name: "$relatedUser.name",
          mainPhoto: "$relatedProfile.mainPhoto"
        }
      }
    }
  ]);

  res.status(200).json({ notifications });
});

/**
 * Function: markAsRead
 * Executes the core operations and logic for mark as read.
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: "Notifications marked as read" });
});

