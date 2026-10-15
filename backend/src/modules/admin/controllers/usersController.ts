import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Profile } from "../../profile/models/Profile";

/**
 * GET /api/admin/users
 * Paginated user list with filters, search, and populated profile photos & biodata
 */
export const getAdminUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const search = (req.query.search as string) || "";
  const filter = (req.query.filter as string) || "all";
  const gender = (req.query.gender as string) || "all";

  const query: any = { role: { $ne: "admin" } };

  if (search.trim()) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  let sortQuery: any = { _id: -1, createdAt: -1 };

  if (filter === "premium") {
    query["subscription.plan"] = "premium";
    sortQuery = { updatedAt: -1, _id: -1, createdAt: -1 };
  } else if (filter === "banned") {
    query.isBanned = true;
    sortQuery = { updatedAt: -1, _id: -1, createdAt: -1 };
  }

  if (gender === "male") {
    query.gender = { $regex: /^male/i };
  } else if (gender === "female") {
    query.gender = { $regex: /^female/i };
  }

  const skip = (page - 1) * limit;

  const [users, total, totalUsersCount, premiumUsersCount, bannedUsersCount] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: { $ne: "admin" }, "subscription.plan": "premium" }),
    User.countDocuments({ role: { $ne: "admin" }, isBanned: true }),
  ]);

  // Fetch real profile photos and biodata for each user
  const userIds = users.map((u) => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).lean();

  const profileMap = new Map();
  profiles.forEach((p) => {
    profileMap.set(p.userId.toString(), p);
  });

  const enrichedUsers = users.map((u) => {
    const prof = profileMap.get(u._id.toString());
    return {
      ...u,
      photo: prof?.mainPhoto || null,
      galleryPhotos: prof?.galleryPhotos || [],
      profile: prof || null,
    };
  });

  res.status(200).json({
    users: enrichedUsers,
    total,
    page,
    pages: Math.ceil(total / limit),
    metrics: {
      total: totalUsersCount,
      premium: premiumUsersCount,
      banned: bannedUsersCount,
    },
  });
});

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban a user
 */
export const toggleBanUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json({
    message: user.isBanned ? "User suspended successfully" : "User unbanned successfully",
    isBanned: user.isBanned,
  });
});

/**
 * PATCH /api/admin/users/:id/premium
 * Grant or revoke premium
 */
export const togglePremiumUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const currentPlan = user.subscription?.plan;
  const newPlan = currentPlan === "premium" ? "free" : "premium";

  if (newPlan === "premium") {
    user.subscription = {
      plan: "premium",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } else {
    user.subscription = {
      plan: "free",
    };
  }

  await user.save();

  res.status(200).json({
    message: `User plan changed to ${newPlan}`,
    plan: newPlan,
  });
});
