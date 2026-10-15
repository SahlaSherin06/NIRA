import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Interaction } from "../../feed/models/Interaction";

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
