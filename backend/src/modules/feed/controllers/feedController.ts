import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { User } from "../../auth/models/User";
import { Preference } from "../../profile/models/Preference";
import { Interaction } from "../models/Interaction";

// GET /api/feed/recommendations
/**
 * Function: getRecommendations
 * Executes the core operations and logic for get recommendations.
 */
export const getRecommendations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const prefs = await Preference.findOne({ userId });
    
    // Determine target gender
    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    const pastInteractions = await Interaction.find({ actorId: currentUser._id });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id); 
    
    const today = new Date();
    const maxDob = new Date();
    maxDob.setFullYear(today.getFullYear() - (prefs?.prefAgeMin || 18));
    const minDob = new Date();
    minDob.setFullYear(today.getFullYear() - (prefs?.prefAgeMax || 60) - 1);

    const pipeline: any[] = [
      { 
        $match: { 
          gender: { $regex: new RegExp(`^${targetGender}$`, 'i') }, 
          _id: { $nin: excludedIds }, 
          isOnboardingComplete: true 
        } 
      },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      { $unwind: "$profile" },
      { 
        $match: { "profile.dob": { $gte: minDob, $lte: maxDob } } 
      }
    ];

    const scoreConditions: any[] = [];
    if (prefs?.prefReligion && prefs.prefReligion !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.religion", prefs.prefReligion] }, 1, 0] });
    }
    if (prefs?.prefEducation && prefs.prefEducation !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.educationLevel", prefs.prefEducation] }, 1, 0] });
    }
    if (prefs?.prefMaritalStatus && prefs.prefMaritalStatus.length > 0 && !prefs.prefMaritalStatus.includes("Doesn't matter")) {
      scoreConditions.push({ $cond: [{ $in: ["$profile.maritalStatus", prefs.prefMaritalStatus] }, 1, 0] });
    }
    if (prefs?.prefSmoking && prefs.prefSmoking !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.smoke", prefs.prefSmoking] }, 1, 0] });
    }
    if (prefs?.prefDrinking && prefs.prefDrinking !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.drink", prefs.prefDrinking] }, 1, 0] });
    }

    if (scoreConditions.length > 0) {
      pipeline.push({
        $addFields: { matchScore: { $add: scoreConditions } }
      });
      pipeline.push({ $sort: { matchScore: -1, _id: 1 } });
    } else {
      // Sort by creation date if no scoring to keep pagination stable
      pipeline.push({ $sort: { createdAt: -1, _id: 1 } });
    }

    // Apply pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit + 1 }); 

    const targetUsers = await User.aggregate(pipeline);

    const hasNextPage = targetUsers.length > limit;
    if (hasNextPage) {
      targetUsers.pop(); 
    }

    const formattedRecommendations = targetUsers.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      subscription: user.subscription,
      profile: user.profile
    }));

    res.status(200).json({ 
      recommendations: formattedRecommendations,
      nextPage: hasNextPage ? page + 1 : null
    });
});
