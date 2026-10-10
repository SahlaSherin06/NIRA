import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../../auth/models/User";
import { Interaction } from "../models/Interaction";

/**
 * Function: getMatchesData
 * Executes the core operations and logic for get matches data.
 */
export const getMatchesData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

        const sentInteractions = await Interaction.find({ actorId: userId, action: { $in: ["like", "superlike"] } });
    const receivedInteractions = await Interaction.find({ targetId: userId, action: { $in: ["like", "superlike"] } });

    const sentTargetIds = sentInteractions.map(i => i.targetId.toString());
    const receivedActorIds = receivedInteractions.map(i => i.actorId.toString());

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
        subscription: u.subscription,
        profile: u.profile,
        // Since we don't have a formal chat yet, just mock the matched date
        matchedAt: new Date().toISOString()
      }));
    };

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
});

