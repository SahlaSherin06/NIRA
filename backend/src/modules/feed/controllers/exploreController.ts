import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { User } from "../../auth/models/User";
import { Preference } from "../../profile/models/Preference";
import { Profile } from "../../profile/models/Profile";
import { Interaction } from "../models/Interaction";

function getProfessionRegex(prof: string): RegExp {
  const p = prof.trim().toLowerCase();
  if (p.includes("it") || p.includes("software")) {
    return /(it|software|developer|engineer|tech|coder|programmer|web|data|system)/i;
  }
  if (p.includes("health") || p.includes("medical")) {
    return /(health|nurse|doctor|medical|hospital|clinic|physician|pharma|dentist|healthcare)/i;
  }
  if (p.includes("finance")) {
    return /(finance|account|banking|audit|tax|invest|ca)/i;
  }
  if (p.includes("education")) {
    return /(education|teach|professor|lecturer|school|college|academic|trainer)/i;
  }
  if (p.includes("business")) {
    return /(business|entrepreneur|founder|ceo|management|manager|consultant)/i;
  }
  if (p.includes("government")) {
    return /(govt|government|civil|public|officer|police|army|navy)/i;
  }
  return new RegExp(prof.trim(), "i");
}

function getEducationRegex(edu: string): RegExp {
  const e = edu.trim().toLowerCase();
  if (e.includes("bachelor")) {
    return /(bachelor|graduate|b\.?tech|b\.?e|b\.?sc|b\.?com|b\.?a|bba|bca)/i;
  }
  if (e.includes("master")) {
    return /(master|postgraduate|m\.?tech|m\.?e|m\.?sc|m\.?com|m\.?a|mba|mca)/i;
  }
  if (e.includes("doctorate") || e.includes("phd")) {
    return /(doctorate|ph\.?d|post\s?doc)/i;
  }
  if (e.includes("diploma")) {
    return /(diploma|polytechnic)/i;
  }
  if (e.includes("high school")) {
    return /(high\s?school|12th|plus\s?two|secondary)/i;
  }
  const cleanEdu = edu.replace(/['’]s?/gi, "s?").trim();
  return new RegExp(`^${cleanEdu}$`, "i");
}

/**
 * Function: getExploreData
 * Executes the core operations and logic for get explore data.
 */
export const getExploreData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const prefs = await Preference.findOne({ userId });
    const currentUserProfile = await Profile.findOne({ userId });

    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    // Exclude users already interacted with
    const pastInteractions = await Interaction.find({ actorId: currentUser._id });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id);

    const baseMatch: any = {
      gender: { $regex: new RegExp(`^${targetGender}$`, 'i') },
      isOnboardingComplete: true,
      _id: { $nin: excludedIds },
      role: { $ne: "admin" },
      isBanned: { $ne: true },
    };

    const { q, minAge, maxAge, religion, caste, sect, diet, smoking, drinking, alcohol, education, profession, maritalStatus, location, nationality, children, language, height, marriagePlans, relocationPlans } = req.query;

    const qMinAge = minAge ? Number(minAge) : undefined;
    const qMaxAge = maxAge ? Number(maxAge) : undefined;
    const qReligion = (religion as string) || undefined;
    const qCaste = (caste as string) || (sect as string) || undefined;
    const qDiet = (diet as string) || undefined;
    const qSmoking = (smoking as string) || undefined;
    const qDrinking = (drinking as string) || (alcohol as string) || undefined;
    const qEducation = (education as string) || undefined;
    const qProfession = (profession as string) || undefined;
    const qLocation = (location as string) || undefined;
    const qNationality = (nationality as string) || undefined;
    const qChildren = (children as string) || undefined;
    const qLanguage = (language as string) || undefined;
    const qHeight = (height as string) || undefined;
    const qMarriagePlans = (marriagePlans as string) || undefined;
    const qRelocationPlans = (relocationPlans as string) || undefined;
    const qMaritalStatus = maritalStatus 
      ? (Array.isArray(maritalStatus) ? (maritalStatus as string[]) : [maritalStatus as string])
      : undefined;

    // Detect if client explicitly requested filters or if this is the default onboarding feed
    const hasExplicitFilters = 
      req.query.isFiltered === "true" ||
      qProfession !== undefined ||
      qEducation !== undefined ||
      qReligion !== undefined ||
      qLocation !== undefined ||
      qDiet !== undefined ||
      qSmoking !== undefined ||
      qDrinking !== undefined ||
      qMaritalStatus !== undefined ||
      qCaste !== undefined ||
      qNationality !== undefined ||
      qChildren !== undefined ||
      qLanguage !== undefined ||
      qHeight !== undefined ||
      qMarriagePlans !== undefined ||
      qRelocationPlans !== undefined ||
      (qMinAge !== undefined && qMaxAge !== undefined);

    const filter = hasExplicitFilters
      ? {
          religion: qReligion ?? "Doesn't matter",
          caste: qCaste ?? "Doesn't matter",
          diet: qDiet ?? "Doesn't matter",
          minAge: qMinAge ?? 18,
          maxAge: qMaxAge ?? 60,
          maritalStatus: qMaritalStatus ?? [],
          smoking: qSmoking ?? "Doesn't matter",
          drinking: qDrinking ?? "Doesn't matter",
          education: qEducation ?? "Doesn't matter",
          profession: qProfession ?? "Doesn't matter",
          location: qLocation ?? "Anywhere",
          nationality: qNationality ?? "Doesn't matter",
          children: qChildren ?? "Doesn't matter",
          language: qLanguage ?? "Doesn't matter",
          height: qHeight ?? "Doesn't matter",
          marriagePlans: qMarriagePlans ?? "Doesn't matter",
          relocationPlans: qRelocationPlans ?? "Doesn't matter",
        }
      : {
          religion: prefs?.prefReligion ?? "Doesn't matter",
          caste: prefs?.prefCaste ?? "Doesn't matter",
          diet: prefs?.prefDiet ?? "Doesn't matter",
          minAge: prefs?.prefAgeMin ?? 18,
          maxAge: prefs?.prefAgeMax ?? 60,
          maritalStatus: prefs?.prefMaritalStatus ?? [],
          smoking: prefs?.prefSmoking ?? "Doesn't matter",
          drinking: prefs?.prefDrinking ?? "Doesn't matter",
          education: prefs?.prefEducation ?? "Doesn't matter",
          profession: prefs?.prefProfession ?? "Doesn't matter",
          location: prefs?.prefLocation ?? "Anywhere",
          nationality: prefs?.prefNationality ?? "Doesn't matter",
          children: prefs?.prefChildren ?? "Doesn't matter",
          language: prefs?.prefLanguage ?? "Doesn't matter",
          height: prefs?.prefHeightMin ?? "Doesn't matter",
          marriagePlans: prefs?.prefMarriagePlans ?? "Doesn't matter",
          relocationPlans: prefs?.prefRelocationPlans ?? "Doesn't matter",
        };

    const today = new Date();
    const maxDob = new Date();
    maxDob.setFullYear(today.getFullYear() - filter.minAge);
    const minDob = new Date();
    minDob.setFullYear(today.getFullYear() - filter.maxAge - 1);

    let searchFilter: any = {};
    if (q) {
      const searchRegex = { $regex: String(q), $options: 'i' };
      searchFilter.$or = [
        { name: searchRegex },
        { "profile.profession": searchRegex },
        { "profile.city": searchRegex }
      ];
    }

    const criteriaConditions: any[] = [];
    const priorityBoosts: any[] = [];
    let activeCriteriaCount = 0;

    // 1. Religion (Priority Boost + Criteria Match)
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
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.caste", regex: new RegExp(filter.caste.trim(), "i") } }, 100, 0]
      });
    }

    // 3. Diet
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
              { case: { $regexMatch: { input: "$profile.diet", regex: /^(vegetarian|vegan)$/i } }, then: 100 },
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
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^vegan$/i } }, 100, 0]
        });
      } else if (d.includes("non")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^(non-vegetarian|halal only)$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.diet", regex: /^(non-vegetarian|halal only)$/i } }, 100, 0]
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
      priorityBoosts.push({
        $cond: [
          { $and: [{ $gte: ["$profile.dob", minDob] }, { $lte: ["$profile.dob", maxDob] }] },
          50,
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
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.maritalStatus", regex: new RegExp(pat, "i") } }, 100, 0]
      });
    }

    // 6. Smoking
    if (filter.smoking && filter.smoking !== "Doesn't matter" && filter.smoking !== "No preference") {
      activeCriteriaCount++;
      if (filter.smoking.toLowerCase().includes("non")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^no$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^no$/i } }, 50, 0]
        });
      } else {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^(yes|occasionally)$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.smoke", regex: /^(yes|occasionally)$/i } }, 50, 0]
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
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.drink", regex: /^no$/i } }, 50, 0]
        });
      } else {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.drink", regex: /^(occasionally|yes)$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.drink", regex: /^(occasionally|yes)$/i } }, 50, 0]
        });
      }
    }

    // 8. Education
    if (filter.education && filter.education !== "Doesn't matter" && filter.education !== "No preference") {
      activeCriteriaCount++;
      const eduRx = getEducationRegex(filter.education);
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.educationLevel", regex: eduRx } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.educationLevel", regex: eduRx } }, 100, 0]
      });
    }

    // 9. Profession (Smart Regex + Boost)
    if (filter.profession && filter.profession !== "Doesn't matter" && filter.profession !== "No preference") {
      activeCriteriaCount++;
      const profRx = getProfessionRegex(filter.profession);
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.profession", regex: profRx } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.profession", regex: profRx } }, 100, 0]
      });
    }

    // 10. Location (Handles Same city, Same state, India, or specific place)
    if (filter.location && filter.location !== "Anywhere" && filter.location !== "No preference") {
      activeCriteriaCount++;
      const locConditions: any[] = [];
      const locLower = filter.location.toLowerCase();

      if (locLower === "same city" && currentUserProfile?.city) {
        locConditions.push({ $regexMatch: { input: "$profile.city", regex: new RegExp(`^${currentUserProfile.city.trim()}$`, "i") } });
      } else if (locLower === "same state" && currentUserProfile?.state) {
        locConditions.push({ $regexMatch: { input: "$profile.state", regex: new RegExp(`^${currentUserProfile.state.trim()}$`, "i") } });
      } else if (locLower === "india") {
        locConditions.push({ $regexMatch: { input: "$profile.country", regex: /india/i } });
      } else {
        const escaped = filter.location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        locConditions.push(
          { $regexMatch: { input: "$profile.country", regex: new RegExp(escaped, "i") } },
          { $regexMatch: { input: "$profile.state", regex: new RegExp(escaped, "i") } },
          { $regexMatch: { input: "$profile.city", regex: new RegExp(escaped, "i") } }
        );
      }

      criteriaConditions.push({
        $cond: [{ $or: locConditions }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $or: locConditions }, 100, 0]
      });
    }

    // 11. Nationality
    if (filter.nationality && filter.nationality !== "Doesn't matter" && filter.nationality !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.nationality", regex: new RegExp(filter.nationality.trim(), "i") } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.nationality", regex: new RegExp(filter.nationality.trim(), "i") } }, 50, 0]
      });
    }

    // 12. Children
    if (filter.children && filter.children !== "Doesn't matter" && filter.children !== "No preference" && filter.children !== "Open to all") {
      activeCriteriaCount++;
      if (filter.children.toLowerCase().includes("doesn't") || filter.children.toLowerCase().includes("no")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^no$/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^no$/i } }, 50, 0]
        });
      } else if (filter.children.toLowerCase().includes("has") || filter.children.toLowerCase().includes("yes")) {
        criteriaConditions.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^yes/i } }, 1, 0]
        });
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.haveChildren", regex: /^yes/i } }, 50, 0]
        });
      }
    }

    // 13. Language (Mother Tongue)
    if (filter.language && filter.language !== "Doesn't matter" && filter.language !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.motherTongue", regex: new RegExp(filter.language.trim(), "i") } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.motherTongue", regex: new RegExp(filter.language.trim(), "i") } }, 50, 0]
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
        priorityBoosts.push({
          $cond: [{ $regexMatch: { input: "$profile.height", regex: heightRegex } }, 50, 0]
        });
      }
    }

    // 15. Marriage Plans
    if (filter.marriagePlans && filter.marriagePlans !== "Doesn't matter" && filter.marriagePlans !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.marryWithin", regex: new RegExp(filter.marriagePlans.trim(), "i") } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.marryWithin", regex: new RegExp(filter.marriagePlans.trim(), "i") } }, 50, 0]
      });
    }

    // 16. Relocation Plans
    if (filter.relocationPlans && filter.relocationPlans !== "Doesn't matter" && filter.relocationPlans !== "No preference") {
      activeCriteriaCount++;
      criteriaConditions.push({
        $cond: [{ $regexMatch: { input: "$profile.moveAbroad", regex: new RegExp(filter.relocationPlans.trim(), "i") } }, 1, 0]
      });
      priorityBoosts.push({
        $cond: [{ $regexMatch: { input: "$profile.moveAbroad", regex: new RegExp(filter.relocationPlans.trim(), "i") } }, 50, 0]
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const fetchProfiles = async (limitNum: number, secondarySort: any, applyScore: boolean = true) => {
      const pipeline: any[] = [
        { $match: baseMatch },
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

      if (q && Object.keys(searchFilter).length > 0) {
        pipeline.push({ $match: searchFilter });
      }

      // Compute matchScore & criteria matches
      if (applyScore && (criteriaConditions.length > 0 || priorityBoosts.length > 0)) {
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
        pipeline.push({ $sort: { matchScore: -1, ...secondarySort } });
      } else {
        pipeline.push({
          $addFields: {
            matchedCount: 0,
            matchScore: 0
          }
        });
        pipeline.push({ $sort: secondarySort });
      }

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum + 1 });
      return User.aggregate(pipeline);
    };

    // Recommended (Curated matching preferences)
    const completeBiosRaw = await fetchProfiles(limit, { createdAt: -1, _id: 1 }, true);
    const hasNextComplete = completeBiosRaw.length > limit;
    if (hasNextComplete) completeBiosRaw.pop();

    const completeBios = completeBiosRaw.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      subscription: user.subscription,
      profile: user.profile,
      matchScore: user.matchScore || 0,
      matchedCount: user.matchedCount || 0,
      totalCriteria: activeCriteriaCount
    }));

    // Just Joined BYPASSES preferences (applyScore = false)
    const justJoinedRaw = await fetchProfiles(limit, { createdAt: -1 }, false);
    const hasNextJoined = justJoinedRaw.length > limit;
    if (hasNextJoined) justJoinedRaw.pop();

    const justJoined = justJoinedRaw.map(user => ({
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
      completeBios, 
      justJoined,
      nextPage: (hasNextComplete || hasNextJoined) ? page + 1 : null
    });
});


