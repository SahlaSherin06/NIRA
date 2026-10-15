import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Profile } from "../../profile/models/Profile";
import { Interaction } from "../../feed/models/Interaction";
import mongoose from "mongoose";

/**
 * GET /api/admin/stats
 * Complete Overview Analytics for Admin Dashboard
 */
export const getAdminStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 1. Live Stats Cards
  const [totalUsers, premiumUsers, bannedUsers, reportsCount, activeUsersCount, activeInteractions] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ "subscription.plan": "premium" }),
    User.countDocuments({ isBanned: true }),
    Interaction.countDocuments({ action: "report" }),
    User.countDocuments({ role: { $ne: "admin" }, updatedAt: { $gte: startOfToday } }),
    Interaction.distinct("actorId", { createdAt: { $gte: startOfToday } }),
  ]);

  const activeUsersToday = Math.max(activeUsersCount, activeInteractions.length);

  // Total mutual matches formed
  const matchAgg = await Interaction.aggregate([
    { $match: { action: { $in: ["like", "superlike"] } } },
    {
      $project: {
        pair: {
          $cond: [
            { $lt: ["$actorId", "$targetId"] },
            { u1: "$actorId", u2: "$targetId" },
            { u1: "$targetId", u2: "$actorId" }
          ]
        }
      }
    },
    { $group: { _id: "$pair", count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
    { $count: "totalMatches" }
  ]);
  const totalMatches = matchAgg[0]?.totalMatches || 0;

  // 2. Gender Ratio Breakdown
  const [maleCount, femaleCount, otherCount] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" }, gender: { $regex: /^male/i } }),
    User.countDocuments({ role: { $ne: "admin" }, gender: { $regex: /^female/i } }),
    User.countDocuments({ role: { $ne: "admin" }, gender: { $nin: [/^male/i, /^female/i] } }),
  ]);

  // 3. Registration Growth (Last 7 Days)
  const registrationRaw = await User.aggregate([
    { $match: { role: { $ne: "admin" }, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const registrationGrowth = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const found = registrationRaw.find((r: any) => r._id === dateStr);
    registrationGrowth.push({
      date: dateStr,
      day: dayLabel,
      count: found ? found.count : 0
    });
  }

  // 4. Live Recent Activity Feed
  const [recentSignups, recentReports, recentPremiums] = await Promise.all([
    User.find({ role: { $ne: "admin" } })
      .select("name email gender createdAt")
      .sort({ createdAt: -1 })
      .limit(6),
    Interaction.find({ action: "report" })
      .populate("actorId", "name")
      .populate("targetId", "name")
      .sort({ createdAt: -1 })
      .limit(4),
    User.find({ "subscription.plan": "premium", role: { $ne: "admin" } })
      .select("name email updatedAt")
      .sort({ updatedAt: -1 })
      .limit(3),
  ]);

  const recentActivities: any[] = [];

  // Add Signups
  recentSignups.forEach((u) => {
    recentActivities.push({
      id: `signup_${u._id}`,
      type: "signup",
      title: "New Member Registration",
      description: `${u.name} (${u.gender || "Member"}) joined NIRA platform`,
      timestamp: u.createdAt,
    });
  });

  // Add Reports
  recentReports.forEach((r: any) => {
    recentActivities.push({
      id: `report_${r._id}`,
      type: "report",
      title: "Safety Report Submitted",
      description: `${r.actorId?.name || "A member"} reported ${r.targetId?.name || "a profile"} (${r.reason || "Flagged"})`,
      timestamp: r.createdAt,
    });
  });

  // Add Premium Upgrades
  recentPremiums.forEach((p) => {
    recentActivities.push({
      id: `premium_${p._id}`,
      type: "premium",
      title: "VIP Premium Upgraded",
      description: `${p.name} activated VIP membership`,
      timestamp: p.updatedAt,
    });
  });

  // Sort by timestamp desc and take latest 6
  recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const finalRecentActivities = recentActivities.slice(0, 6);

  // 5. Revenue
  const monthlyRevenue = premiumUsers * 499;

  res.status(200).json({
    totalUsers,
    activeUsersToday,
    premiumUsers,
    totalMatches,
    bannedUsers,
    reportsCount,
    revenue: {
      monthlyRevenue,
      totalSubscriptions: premiumUsers,
      planPrice: 499
    },
    genderRatio: {
      male: maleCount,
      female: femaleCount,
      other: otherCount
    },
    registrationGrowth,
    recentActivities: finalRecentActivities,
  });
});

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

  let sortQuery: any = { createdAt: -1 };

  if (filter === "premium") {
    query["subscription.plan"] = "premium";
    sortQuery = { updatedAt: -1, createdAt: -1 };
  } else if (filter === "banned") {
    query.isBanned = true;
    sortQuery = { updatedAt: -1, createdAt: -1 };
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

/**
 * GET /api/admin/reports
 * Fetch reported users
 */
export const getAdminReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const reports = await Interaction.find({ action: "report" })
    .populate("actorId", "name email")
    .populate("targetId", "name email isBanned subscription")
    .sort({ createdAt: -1 });

  res.status(200).json({ reports });
});
