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
    
    // Read query parameters with fallback to user's saved preferences
    const qMinAge = req.query.minAge ? Number(req.query.minAge) : undefined;
    const qMaxAge = req.query.maxAge ? Number(req.query.maxAge) : undefined;
    const qReligion = (req.query.religion as string) || undefined;
    const qCaste = (req.query.caste as string) || (req.query.sect as string) || undefined;
    const qDiet = (req.query.diet as string) || undefined;
    const qSmoking = (req.query.smoking as string) || undefined;
    const qDrinking = (req.query.drinking as string) || (req.query.alcohol as string) || undefined;
    const qEducation = (req.query.education as string) || undefined;
    const qProfession = (req.query.profession as string) || undefined;
    const qLocation = (req.query.location as string) || undefined;
    const qNationality = (req.query.nationality as string) || undefined;
    const qChildren = (req.query.children as string) || (req.query.haveChildren as string) || undefined;
    const qLanguage = (req.query.language as string) || (req.query.motherTongue as string) || undefined;
    const qHeight = (req.query.height as string) || undefined;
    const qMaritalStatus = req.query.maritalStatus 
      ? (Array.isArray(req.query.maritalStatus) ? (req.query.maritalStatus as string[]) : [req.query.maritalStatus as string])
      : undefined;

    const filter = {
      religion: qReligion ?? prefs?.prefReligion ?? "Doesn't matter",
      caste: qCaste ?? "Doesn't matter",
      diet: qDiet ?? prefs?.prefDiet ?? "Doesn't matter",
      minAge: qMinAge ?? prefs?.prefAgeMin ?? 18,
      maxAge: qMaxAge ?? prefs?.prefAgeMax ?? 60,
      maritalStatus: qMaritalStatus ?? prefs?.prefMaritalStatus ?? [],
      smoking: qSmoking ?? prefs?.prefSmoking ?? "Doesn't matter",
      drinking: qDrinking ?? prefs?.prefDrinking ?? "Doesn't matter",
      education: qEducation ?? prefs?.prefEducation ?? "Doesn't matter",
      profession: qProfession ?? prefs?.prefProfession ?? "Doesn't matter",
      location: qLocation ?? prefs?.prefLocation ?? "Anywhere",
      nationality: qNationality ?? "Doesn't matter",
      children: qChildren ?? "Doesn't matter",
      language: qLanguage ?? "Doesn't matter",
      height: qHeight ?? "Doesn't matter",
    };

    // Determine target gender
    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    const pastInteractions = await Interaction.find({ actorId: currentUser._id });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id); 
    
    const today = new Date();
    const maxDob = new Date();
    maxDob.setFullYear(today.getFullYear() - filter.minAge);
    const minDob = new Date();
    minDob.setFullYear(today.getFullYear() - filter.maxAge - 1);

    const pipeline: any[] = [
      { 
        $match: { 
          gender: { $regex: new RegExp(`^${targetGender}$`, 'i') }, 
          _id: { $nin: excludedIds }, 
          isOnboardingComplete: true,
          role: { $ne: "admin" },
          isBanned: { $ne: true },
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
      { $unwind: "$profile" }
    ];

    const criteriaConditions: any[] = [];
    const priorityBoosts: any[] = [];
    let activeCriteriaCount = 0;

    // 1. Religion (Strict Priority Boost + Criteria Match)
    if (filter.religion && filter.religion !== "Doesn't matter" && filter.religion !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.religion", regex: new RegExp(`^${filter.religion.trim()}$`, "i") } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.religion", regex: new RegExp(`^${filter.religion.trim()}$`, "i") } }, 100, 0]
      });
    }

    // 2. Sect / Caste
    if (filter.caste && filter.caste !== "Doesn't matter" && filter.caste !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.caste", regex: new RegExp(filter.caste.trim(), "i") } }, 1, 0]
      });
    }

    // 3. Diet (Strict Priority Boost + Criteria Match)
    if (filter.diet && filter.diet !== "Doesn't matter" && filter.diet !== "No preference") {
      activeCriteriaCount++;
      const d = filter.diet.toLowerCase();
      if (d.includes("vegetarian") && !d.includes("non")) {
        criteriaConditions.push({
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$profile.diet", regex: /^(vegetarian|vegan)$/i } }, then: 1 },
              { case: { $regexMatch: { input: "$profile.diet", regex: /^eggetarian$/i } }, then: 0.5 }
            ],
            default: 0
          }
        });
        priorityBoosts.push({
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$profile.diet", regex: /^(vegetarian|vegan)$/i } }, then: 200 },
              { case: { $regexMatch: { input: "$profile.diet", regex: /^eggetarian$/i } }, then: 50 }
            ],
            default: 0
          }
        });
      } else if (d.includes("vegan")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^vegan$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^vegan$/i } }, 200, 0]
        });
      } else if (d.includes("non")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^(non-vegetarian|halal only)$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^(non-vegetarian|halal only)$/i } }, 200, 0]
        });
      }
    }

    // 4. Age Criteria
    if (filter.minAge || filter.maxAge) {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [
          { $and: [{ $gte: ["$profile.dob", minDob] }, { $lte: ["$profile.dob", maxDob] }] },
          1,
          0
        ]
      });
    }

    // 5. Marital Status
    if (filter.maritalStatus && filter.maritalStatus.length > 0 && !filter.maritalStatus.includes("Doesn't matter") && !filter.maritalStatus.includes("No preference")) {
      activeCriteriaCount++;
      const pat = filter.maritalStatus.map(s => `^${s.trim()}$`).join("|");
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.maritalStatus", regex: new RegExp(pat, "i") } }, 1, 0]
      });
    }

    // 6. Smoking
    if (filter.smoking && filter.smoking !== "Doesn't matter" && filter.smoking !== "No preference") {
      activeCriteriaCount++;
      if (filter.smoking.toLowerCase().includes("non")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^no$/i } }, 1, 0]
        });
      } else {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^(yes|occasionally)$/i } }, 1, 0]
        });
      }
    }

    // 7. Drinking / Alcohol
    if (filter.drinking && filter.drinking !== "Doesn't matter" && filter.drinking !== "No preference") {
      activeCriteriaCount++;
      if (filter.drinking.toLowerCase().includes("non")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.drink", regex: /^no$/i } }, 1, 0]
        });
      } else {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.drink", regex: /^(occasionally|yes)$/i } }, 1, 0]
        });
      }
    }

    // 8. Education
    if (filter.education && filter.education !== "Doesn't matter" && filter.education !== "No preference") {
      activeCriteriaCount++;
      const cleanEdu = filter.education.replace(/['’]s?/gi, "s?").trim();
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.educationLevel", regex: new RegExp(`^${cleanEdu}$`, "i") } }, 1, 0]
      });
    }

    // 9. Profession
    if (filter.profession && filter.profession !== "Doesn't matter" && filter.profession !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.profession", regex: new RegExp(filter.profession.trim(), "i") } }, 1, 0]
      });
    }

    // 10. Location
    if (filter.location && filter.location !== "Anywhere" && filter.location !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [
          {
            $or: [
              { $regexMatch: { input: "$profile.country", regex: new RegExp(filter.location.trim(), "i") } },
              { $regexMatch: { input: "$profile.state", regex: new RegExp(filter.location.trim(), "i") } },
              { $regexMatch: { input: "$profile.city", regex: new RegExp(filter.location.trim(), "i") } }
            ]
          },
          1,
          0
        ]
      });
    }

    // 11. Nationality
    if (filter.nationality && filter.nationality !== "Doesn't matter" && filter.nationality !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.nationality", regex: new RegExp(filter.nationality.trim(), "i") } }, 1, 0]
      });
    }

    // 12. Children
    if (filter.children && filter.children !== "Doesn't matter" && filter.children !== "No preference" && filter.children !== "Open to all") {
      activeCriteriaCount++;
      if (filter.children.toLowerCase().includes("doesn't") || filter.children.toLowerCase().includes("no")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^no$/i } }, 1, 0]
        });
      } else if (filter.children.toLowerCase().includes("has") || filter.children.toLowerCase().includes("yes")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^yes/i } }, 1, 0]
        });
      }
    }

    // 13. Language (Mother Tongue)
    if (filter.language && filter.language !== "Doesn't matter" && filter.language !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.motherTongue", regex: new RegExp(filter.language.trim(), "i") } }, 1, 0]
      });
    }

    // 14. Height
    if (filter.height && filter.height !== "Doesn't matter" && filter.height !== "No preference") {
      activeCriteriaCount++;
      let heightRegex: RegExp | null = null;
      if (filter.height.includes("140 - 155")) {
        heightRegex = /1(4\d|5[0-5])/;
      } else if (filter.height.includes("155 - 165")) {
        heightRegex = /1(5[5-9]|6[0-5])/;
      } else if (filter.height.includes("165 - 175")) {
        heightRegex = /1(6[5-9]|7[0-5])/;
      } else if (filter.height.includes("175 - 185")) {
        heightRegex = /1(7[5-9]|8[0-5])/;
      } else if (filter.height.includes("185 cm+")) {
        heightRegex = /1(8[5-9]|9\d)|2\d\d/;
      }
      if (heightRegex) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.height", regex: heightRegex } }, 1, 0]
        });
      }
    }

    // Compute matchScore & criteria matches
    if (criteriaConditions.length > 0 || priorityBoosts.length > 0) {
      pipeline.push({
        $addFields: {
          matchedCount: criteriaConditions.length > 0 ? { $round: [{ $add: criteriaConditions }, 0] } : 0,
          priorityBoost: priorityBoosts.length > 0 ? { $add: priorityBoosts } : 0
        }
      });
      pipeline.push({
        $addFields: {
          matchScore: { $add: ["$matchedCount", "$priorityBoost"] }
        }
      });
      pipeline.push({ $sort: { matchScore: -1, createdAt: -1, _id: 1 } });
    } else {
      pipeline.push({
        $addFields: {
          matchedCount: 0,
          matchScore: 0
        }
      });
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
      profile: user.profile,
      matchScore: user.matchScore || 0,
      matchedCount: user.matchedCount || 0,
      totalCriteria: activeCriteriaCount
    }));

    res.status(200).json({ 
      recommendations: formattedRecommendations,
      nextPage: hasNextPage ? page + 1 : null
    });
});
