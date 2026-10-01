import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../auth/models/User";
import { Interaction } from "../models/Interaction";

/**
 * Function: getMatchesData
 * Executes the core operations and logic for get matches data.
 */
export const getMatchesData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 1. Get all interactions involving the current user
    const sentInteractions = await Interaction.find({ actorId: userId, action: "like" });
    const receivedInteractions = await Interaction.find({ targetId: userId, action: "like" });

    const sentTargetIds = sentInteractions.map(i => i.targetId.toString());
    const receivedActorIds = receivedInteractions.map(i => i.actorId.toString());

    // 2. Classify IDs
    const mutualMatchIds = sentTargetIds.filter(id => receivedActorIds.includes(id));
    const pureSentIds = sentTargetIds.filter(id => !receivedActorIds.includes(id));
    const pureReceivedIds = receivedActorIds.filter(id => !sentTargetIds.includes(id));

    // Also get all blocked/passed by current user to exclude from received
    const negativeInteractions = await Interaction.find({ 
      actorId: userId, 
      action: { $in: ["pass", "block", "report"] } 
    });
    const negativeIds = negativeInteractions.map(i => i.targetId.toString());
    
    const finalReceivedIds = pureReceivedIds.filter(id => !negativeIds.includes(id));

    // 3. Helper to fetch populated user details
    const fetchPopulatedUsers = async (ids: string[]) => {
      const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
      const pipeline = [
        { $match: { _id: { $in: objectIds } } },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile"
          }
        },
        { $unwind: "$profile" }
      ];
      const users = await User.aggregate(pipeline);
      return users.map(u => ({
        _id: u._id,
        name: u.name,
        gender: u.gender,
        profile: u.profile,
        // Since we don't have a formal chat yet, just mock the matched date
        matchedAt: new Date().toISOString()
      }));
    };

    // 4. Execute concurrently
    const [mutualMatches, interestsReceived, interestsSent] = await Promise.all([
      fetchPopulatedUsers(mutualMatchIds),
      fetchPopulatedUsers(finalReceivedIds),
      fetchPopulatedUsers(pureSentIds)
    ]);

    res.status(200).json({
      mutualMatches,
      interestsReceived,
      interestsSent
    });
  } catch (error) {
    console.error("Get Matches Data Error:", error);
    res.status(500).json({ message: "Failed to fetch matches data" });
  }
};
