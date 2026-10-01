import { Request, Response } from "express";
import { Interaction } from "../models/Interaction";
import { User } from "../../auth/models/User";

// POST /api/feed/interact
/**
 * Function: recordAction
 * Executes the core operations and logic for record action.
 */
export const recordAction = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const validActions = ["like", "pass", "block", "favorite", "report"];
    if (!validActions.includes(action)) {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      res.status(404).json({ message: "Target user not found" });
      return;
    }

    // Prepare update payload
    const updatePayload: any = { actorId, targetId, action };
    if (action === "report" && reason) {
      updatePayload.reason = reason;
    }

    // Upsert the interaction
    await Interaction.findOneAndUpdate(
      { actorId, targetId },
      updatePayload,
      { upsert: true, returnDocument: 'after' }
    );

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
  } catch (error) {
    console.error("Record Interaction Error:", error);
    res.status(500).json({ message: "Failed to record interaction" });
  }
};

// DELETE /api/feed/interact/:targetId
/**
 * Function: removeAction
 * Executes the core operations and logic for remove action.
 */
export const removeAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const actorId = (req as any).user?.userId;
    const { targetId } = req.params;

    if (!actorId || !targetId) {
      res.status(400).json({ message: "Missing parameters" });
      return;
    }

    await Interaction.findOneAndDelete({ actorId, targetId });
    res.status(200).json({ message: "Interaction removed successfully" });
  } catch (error) {
    console.error("Remove Interaction Error:", error);
    res.status(500).json({ message: "Failed to remove interaction" });
  }
};
