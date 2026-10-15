import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { Interaction } from "../models/Interaction";
import { User } from "../../auth/models/User";

// POST /api/feed/interact
/**
 * Function: recordAction
 * Executes the core operations and logic for record action.
 */
export const recordAction = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const actorId = (req as any).user?.userId;
    if (!actorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { targetId, action, reason } = req.body;

    if (!targetId || !action) {
      res.status(400).json({ message: "targetId and action are required" });
      return;
    }

    const validActions = ["like", "superlike", "pass", "block", "favorite", "report"];
    if (!validActions.includes(action)) {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    const actor = await User.findById(actorId);
    if (!actor) {
      res.status(404).json({ message: "Actor user not found" });
      return;
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    const isPremium = actor.subscription?.plan === 'premium';
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Limit both Like and Pass if user has reached 3 likes today
    if ((action === "like" || action === "pass") && !isPremium) {
            const likesToday = await Interaction.countDocuments({
          actorId: actor._id,
          action: "like",
          createdAt: { $gte: startOfDay }
        });
      console.log("ACTOR ID:", actorId, "LIKES TODAY:", likesToday, "IS PREMIUM:", isPremium);
      if (likesToday >= 3) {
        res.status(403).json({ message: "LIMIT_REACHED", error: "Out of daily limits. Upgrade to Premium for unlimited swipes!" });
        return;
      }
    }

    if (action === "superlike") {
      if (!isPremium) {
        res.status(403).json({ message: "UPGRADE_REQUIRED", error: "Super Likes are a premium feature." });
        return;
      }
      const superLikesToday = await Interaction.countDocuments({
          actorId: actor._id,
          action: "superlike",
          createdAt: { $gte: startOfDay }
        });
      if (superLikesToday >= 2) {
        res.status(403).json({ message: "LIMIT_REACHED", error: "Out of daily Super Likes." });
        return;
      }
    }

    // Prepare update payload
    const updatePayload: any = { actorId, targetId, action };
    if (action === "report") {
      if (reason) updatePayload.reason = reason;
      updatePayload.status = "pending";
    }

    // Upsert the interaction
      await Interaction.findOneAndUpdate(
        { actorId, targetId },
        updatePayload,
        { upsert: true, returnDocument: 'after' }
      );

      // CRITICAL FIX: If blocking, delete the reciprocal like so they don't auto-match if unblocked
      if (action === "block") {
        await Interaction.findOneAndDelete({ actorId: targetId, targetId: actorId });
      }

    if (action === "like") {
      const { Notification } = require("../../notifications/models/Notification");
      const currentUser = await User.findById(actorId);
      
      // Check for mutual match
      const reciprocal = await Interaction.findOne({ actorId: targetId, targetId: actorId, action: "like" });
      if (reciprocal) {
        // It's a match! Notify both
        await Notification.create([
          { userId: targetId, type: "match", message: `You and ${currentUser?.name} matched!`, relatedUserId: actorId },
          { userId: actorId, type: "match", message: `You and ${targetUser.name} matched!`, relatedUserId: targetId }
        ]);
      } else {
        // Just an interest received for target
        await Notification.create({
          userId: targetId,
          type: "interest_received",
          message: `${currentUser?.name} sent you an interest!`,
          relatedUserId: actorId
        });
      }
    }

    // If action is "like", we could check if the target already liked the actor to create a Match.
    // For now, we just return success.
    res.status(200).json({ message: `Successfully recorded ${action}` });
});

// DELETE /api/feed/interact/:targetId
/**
 * Function: removeAction
 * Executes the core operations and logic for remove action.
 */
export const removeAction = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const actorId = (req as any).user?.userId;
    const { targetId } = req.params;

    if (!actorId || !targetId) {
      res.status(400).json({ message: "Missing parameters" });
      return;
    }

    await Interaction.findOneAndDelete({ actorId, targetId });
    res.status(200).json({ message: "Interaction removed successfully" });
});


/**
 * Function: getActivityLogs
 * Fetches the user's past interactions in reverse chronological order (newest first).
 */
export const getActivityLogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const actorId = (req as any).user?.userId;
  if (!actorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: { actorId: new (require('mongoose').Types.ObjectId)(actorId) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "targetId",
        foreignField: "_id",
        as: "targetUser"
      }
    },
    { $unwind: "$targetUser" },
    {
      $lookup: {
        from: "profiles",
        localField: "targetId",
        foreignField: "userId",
        as: "targetProfile"
      }
    },
    {
      $unwind: {
        path: "$targetProfile",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        action: 1,
        createdAt: 1,
        reason: 1,
        "targetUser._id": 1,
        "targetUser.name": 1,
        "targetProfile.mainPhoto": 1,
        "targetProfile.city": 1,
        "targetProfile.profession": 1
      }
    }
  ];

  const logs = await Interaction.aggregate(pipeline);

  const hasNextPage = logs.length > limit;
  if (hasNextPage) {
    logs.pop();
  }

  res.status(200).json({
    logs,
    nextPage: hasNextPage ? page + 1 : null
  });
});

/**
 * Function: getBlockedUsers
 * Fetches the users that the current user has blocked.
 */
export const getBlockedUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const actorId = (req as any).user?.userId;
  if (!actorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const blockedInteractions = await Interaction.find({ actorId, action: "block" }).sort({ createdAt: -1 });
  
  if (blockedInteractions.length === 0) {
    res.status(200).json({ blockedUsers: [] });
    return;
  }

  const targetIds = blockedInteractions.map(i => i.targetId);
  const User = require("../../auth/models/User").User;
  const users = await User.find({ _id: { $in: targetIds } }, "name");
  
  const mongoose = require("mongoose");
  let profiles: any[] = [];
  if (mongoose.connection.db) {
    profiles = await mongoose.connection.db.collection("profiles")
      .find({ userId: { $in: targetIds } }, { projection: { userId: 1, mainPhoto: 1 } })
      .toArray();
  }

  const blockedUsers = blockedInteractions.map(interaction => {
    const user = users.find((u: any) => u._id.toString() === interaction.targetId.toString());
    const profile = profiles.find((p: any) => p.userId.toString() === interaction.targetId.toString());
    
    return {
      _id: interaction.targetId,
      name: user?.name || "Unknown User",
      mainPhoto: profile?.mainPhoto || null,
      blockedAt: interaction.createdAt
    };
  }).filter(u => u.name !== "Unknown User");

  res.status(200).json({ blockedUsers });
});


export const undoPass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const actorId = (req as any).user?.userId;
  if (!actorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const actor = await User.findById(actorId);
  if (!actor) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (actor.subscription?.plan !== 'premium') {
    res.status(403).json({ message: "UPGRADE_REQUIRED", error: "Undo is a premium feature." });
    return;
  }

  // Find the most recent 'pass' interaction
  const lastPass = await Interaction.findOne({ actorId, action: "pass" }).sort({ createdAt: -1 });
  if (!lastPass) {
    res.status(404).json({ message: "No recent passes found to undo." });
    return;
  }

  // Delete it
  await Interaction.findByIdAndDelete(lastPass._id);

  // Return the profile data so the frontend can restore it if they want
  res.status(200).json({ message: "Pass undone", restoredTargetId: lastPass.targetId });
});
