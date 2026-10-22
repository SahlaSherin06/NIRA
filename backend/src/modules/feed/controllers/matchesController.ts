import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../../auth/models/User";
import { Interaction } from "../models/Interaction";

/**
 * Function: getMatchesData
 * Fetches mutual matches, interests received, and interests sent.
 * Highlights and prioritizes Super Likes.
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

  // Create maps to track interaction type and timestamps
  const receivedActionMap = new Map<string, { action: string; createdAt: Date }>();
  receivedInteractions.forEach(i => {
    receivedActionMap.set(i.actorId.toString(), { action: i.action, createdAt: i.createdAt });
  });

  const sentActionMap = new Map<string, { action: string; createdAt: Date }>();
  sentInteractions.forEach(i => {
    sentActionMap.set(i.targetId.toString(), { action: i.action, createdAt: i.createdAt });
  });

  const fetchPopulatedUsers = async (ids: string[], context: 'mutual' | 'received' | 'sent') => {
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const pipeline = [
      { $match: { _id: { $in: objectIds }, isBanned: { $ne: true } } },
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
    return users.map(u => {
      const uId = u._id.toString();
      let isSuperLike = false;
      let actionTime = new Date().toISOString();

      if (context === 'received') {
        const data = receivedActionMap.get(uId);
        isSuperLike = data?.action === 'superlike';
        if (data?.createdAt) actionTime = data.createdAt.toISOString();
      } else if (context === 'sent') {
        const data = sentActionMap.get(uId);
        isSuperLike = data?.action === 'superlike';
        if (data?.createdAt) actionTime = data.createdAt.toISOString();
      } else if (context === 'mutual') {
        const recData = receivedActionMap.get(uId);
        const sData = sentActionMap.get(uId);
        isSuperLike = recData?.action === 'superlike' || sData?.action === 'superlike';
        if (recData?.createdAt) actionTime = recData.createdAt.toISOString();
      }

      return {
        _id: u._id,
        name: u.name,
        gender: u.gender,
        subscription: u.subscription,
        profile: u.profile,
        matchedAt: actionTime,
        isSuperLike,
        interactionType: isSuperLike ? 'superlike' : 'like'
      };
    });
  };

  const [mutualMatches, interestsReceived, interestsSent] = await Promise.all([
    fetchPopulatedUsers(mutualMatchIds, 'mutual'),
    fetchPopulatedUsers(finalReceivedIds, 'received'),
    fetchPopulatedUsers(pureSentIds, 'sent')
  ]);

  // Priority Sort: Super Likes ALWAYS appear first at the top
  interestsReceived.sort((a, b) => {
    if (a.isSuperLike && !b.isSuperLike) return -1;
    if (!a.isSuperLike && b.isSuperLike) return 1;
    return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
  });

  mutualMatches.sort((a, b) => {
    if (a.isSuperLike && !b.isSuperLike) return -1;
    if (!a.isSuperLike && b.isSuperLike) return 1;
    return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
  });

  res.status(200).json({
    mutualMatches,
    interestsReceived,
    interestsSent
  });
});
