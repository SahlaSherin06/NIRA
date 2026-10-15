import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Profile } from "../../profile/models/Profile";
import { Notification } from "../../notifications/models/Notification";

/**
 * GET /api/admin/subscriptions
 * Fetch subscribers list with smart filters, search, and revenue KPI metrics
 */
export const getAdminSubscriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const search = ((req.query.search as string) || "").trim();
  const status = (req.query.status as string) || "all";
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 15;
  const skip = (page - 1) * limit;

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Calculate Top Revenue & Plan Metrics
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

  const activeVipCount = await User.countDocuments({
    role: { $ne: "admin" },
    "subscription.plan": "premium",
    $or: [
      { "subscription.expiresAt": { $gt: now } },
      { "subscription.expiresAt": { $exists: false } },
      { "subscription.expiresAt": null },
    ],
  });

  const expiringSoonCount = await User.countDocuments({
    role: { $ne: "admin" },
    "subscription.plan": "premium",
    "subscription.expiresAt": { $gt: now, $lte: in7Days },
  });

  const expiredCount = await User.countDocuments({
    role: { $ne: "admin" },
    $or: [
      { "subscription.plan": "premium", "subscription.expiresAt": { $lte: now } },
      { "subscription.plan": "free", "subscription.expiresAt": { $exists: true, $ne: null } },
    ],
  });

  // Calculate revenue from active paid members based on package prices
  const activeSubscribersList = await User.find({
    role: { $ne: "admin" },
    "subscription.plan": "premium",
    $or: [
      { "subscription.expiresAt": { $gt: now } },
      { "subscription.expiresAt": { $exists: false } },
      { "subscription.expiresAt": null },
    ],
  }).select("subscription").lean();

  const totalRevenue = activeSubscribersList.reduce((acc, u: any) => {
    if (u.subscription?.amountPaid) return acc + u.subscription.amountPaid;
    if (u.subscription?.duration === "lifetime") return acc + 4999;
    if (u.subscription?.duration === "6_months") return acc + 1999;
    if (u.subscription?.duration === "3_months") return acc + 1199;
    return acc + 499;
  }, 0);

  // Free vs VIP Conversion Rate
  const conversionRate = totalUsers > 0 ? Number(((activeVipCount / totalUsers) * 100).toFixed(1)) : 0;

  // 2. Build Query for Subscribers List
  const query: any = { role: { $ne: "admin" } };

  if (status === "active") {
    query["subscription.plan"] = "premium";
    query.$or = [
      { "subscription.expiresAt": { $gt: now } },
      { "subscription.expiresAt": { $exists: false } },
      { "subscription.expiresAt": null },
    ];
  } else if (status === "expiring_soon") {
    query["subscription.plan"] = "premium";
    query["subscription.expiresAt"] = { $gt: now, $lte: in7Days };
  } else if (status === "expired") {
    query.$or = [
      { "subscription.plan": "premium", "subscription.expiresAt": { $lte: now } },
      { "subscription.plan": "free", "subscription.expiresAt": { $exists: true, $ne: null } },
    ];
  } else {
    // "all" - Show all users with any subscription history or currently premium
    query.$or = [
      { "subscription.plan": "premium" },
      { "subscription.expiresAt": { $exists: true, $ne: null } },
    ];
  }

  if (search) {
    const s = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const searchRegex = new RegExp(s, "i");
    const searchMatch = {
      $or: [{ name: searchRegex }, { email: searchRegex }],
    };
    if (query.$or) {
      query.$and = [{ $or: query.$or }, searchMatch];
      delete query.$or;
    } else {
      query.$or = searchMatch.$or;
    }
  }

  const [users, totalMatching] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ "subscription.expiresAt": -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Lookup profiles for main photos and location
  const userIds = users.map((u) => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
  const profileMap = new Map();
  profiles.forEach((p) => {
    profileMap.set(p.userId.toString(), p);
  });

  // Enrich subscriber records
  const enrichedSubscribers = users.map((u: any) => {
    const prof = profileMap.get(u._id.toString());
    const expiresAt = u.subscription?.expiresAt ? new Date(u.subscription.expiresAt) : null;
    let daysRemaining: number | null = null;
    let subscriptionStatus: "active" | "expiring_soon" | "expired" = "active";

    if (expiresAt) {
      const diffMs = expiresAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        subscriptionStatus = "expired";
      } else if (daysRemaining <= 7) {
        subscriptionStatus = "expiring_soon";
      } else {
        subscriptionStatus = "active";
      }
    } else if (u.subscription?.plan === "premium") {
      subscriptionStatus = "active"; // Lifetime
    } else {
      subscriptionStatus = "expired";
    }

    // Determine package label and price
    const dur = u.subscription?.duration;
    let planLabel = "1 Month VIP (₹499)";
    let planPrice = u.subscription?.amountPaid || 499;

    if (u.subscription?.plan === "free") {
      planLabel = "Free Tier";
      planPrice = 0;
    } else if (dur === "lifetime" || (!expiresAt && u.subscription?.plan === "premium")) {
      planLabel = "Lifetime VIP (₹4,999)";
      planPrice = u.subscription?.amountPaid || 4999;
    } else if (dur === "6_months" || (daysRemaining != null && daysRemaining > 100)) {
      planLabel = "6 Months VIP (₹1,999)";
      planPrice = u.subscription?.amountPaid || 1999;
    } else if (dur === "3_months" || (daysRemaining != null && daysRemaining > 45)) {
      planLabel = "3 Months VIP (₹1,199)";
      planPrice = u.subscription?.amountPaid || 1199;
    } else {
      planLabel = "1 Month VIP (₹499)";
      planPrice = u.subscription?.amountPaid || 499;
    }

    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      gender: u.gender || "Not specified",
      isBanned: u.isBanned || false,
      createdAt: u.createdAt,
      photo: prof?.mainPhoto || null,
      profile: prof ? {
        city: prof.city || undefined,
        state: prof.state || undefined,
        profession: prof.profession || undefined,
        religion: prof.religion || undefined,
        dob: prof.dob || undefined,
        mainPhoto: prof.mainPhoto || undefined,
      } : null,
      subscription: {
        plan: u.subscription?.plan || "free",
        duration: u.subscription?.duration || null,
        amountPaid: planPrice,
        planLabel,
        startDate: u.subscription?.startDate || u.createdAt,
        expiresAt: expiresAt?.toISOString() || null,
        source: u.subscription?.source || (u.subscription?.razorpayCustomerId ? "razorpay" : "admin_grant"),
        adminNote: u.subscription?.adminNote || null,
        daysRemaining,
        status: subscriptionStatus,
      },
    };
  });

  res.status(200).json({
    subscribers: enrichedSubscribers,
    total: totalMatching,
    page,
    pages: Math.ceil(totalMatching / limit) || 1,
    metrics: {
      activeVip: activeVipCount,
      mrr: totalRevenue,
      conversionRate,
      expiringSoon: expiringSoonCount,
      expired: expiredCount,
      totalUsers,
    },
  });
});

/**
 * GET /api/admin/subscriptions/eligible-users
 * Fetch registered users who can be granted VIP access
 */
export const getEligibleUsersForGrant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const search = ((req.query.search as string) || "").trim();

  const query: any = { role: { $ne: "admin" } };
  if (search) {
    const s = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    query.$or = [{ name: new RegExp(s, "i") }, { email: new RegExp(s, "i") }];
  }

  const users = await User.find(query)
    .select("name email gender subscription createdAt")
    .limit(12)
    .lean();

  const userIds = users.map((u) => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).select("userId mainPhoto").lean();
  const profileMap = new Map();
  profiles.forEach((p) => {
    profileMap.set(p.userId.toString(), p.mainPhoto);
  });

  const result = users.map((u: any) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    gender: u.gender,
    photo: profileMap.get(u._id.toString()) || null,
    currentPlan: u.subscription?.plan || "free",
    expiresAt: u.subscription?.expiresAt || null,
  }));

  res.status(200).json({ users: result });
});

/**
 * POST /api/admin/subscriptions/grant
 * Manually grant VIP access to a member with custom duration
 */
export const grantVipAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, duration, note } = req.body;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "Member not found" });
    return;
  }

  const now = new Date();
  let days = 30;
  let durationLabel = "1 Month";

  if (duration === "3_months") {
    days = 90;
    durationLabel = "3 Months";
  } else if (duration === "6_months") {
    days = 180;
    durationLabel = "6 Months";
  } else if (duration === "lifetime") {
    days = 36500; // ~100 years
    durationLabel = "Lifetime";
  }

  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const priceMap: Record<string, number> = {
    "1_month": 499,
    "3_months": 1199,
    "6_months": 1999,
    "lifetime": 4999,
  };

  user.subscription = {
    plan: "premium",
    duration: duration as any,
    amountPaid: priceMap[duration] || 499,
    startDate: now,
    expiresAt,
    source: "admin_grant",
    adminNote: note ? note.trim() : `Granted by Admin (${durationLabel})`,
  };

  await user.save();

  // Create notification for member
  const notif = await Notification.create({
    userId: user._id,
    type: "system",
    message: `Congratulations! You have been granted NIRA VIP Premium membership (${durationLabel}). Enjoy unlimited swipes, super likes, and VIP priority.`,
  });

  const io = (req as any).io;
  if (io) {
    io.to(user._id.toString()).emit("newNotification", notif);
  }

  res.status(200).json({
    message: `VIP Access (${durationLabel}) successfully granted to ${user.name}`,
    user,
  });
});

/**
 * PATCH /api/admin/subscriptions/:id/extend
 * Extend validity of an existing VIP subscriber
 */
export const extendVipSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const days = parseInt(req.body.days, 10) || 30;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: "Subscriber not found" });
    return;
  }

  const now = new Date();
  let currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : now;
  // If already expired, start extension from now
  if (currentExpiry < now) {
    currentExpiry = now;
  }

  const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

  user.subscription = {
    plan: "premium",
    startDate: user.subscription?.startDate || now,
    expiresAt: newExpiry,
    source: user.subscription?.source || "admin_grant",
    adminNote: req.body.note ? String(req.body.note).trim() : (user.subscription?.adminNote || `Validity extended by ${days} days by Admin`),
  };

  await user.save();

  // Notify member
  const notif = await Notification.create({
    userId: user._id,
    type: "system",
    message: `Your NIRA VIP Premium membership has been extended by ${days} days! New expiry: ${newExpiry.toLocaleDateString()}.`,
  });

  const io = (req as any).io;
  if (io) {
    io.to(user._id.toString()).emit("newNotification", notif);
  }

  res.status(200).json({
    message: `VIP validity extended by ${days} days for ${user.name}`,
    user,
  });
});

/**
 * PATCH /api/admin/subscriptions/:id/revoke
 * Revoke VIP access and downgrade to Free tier
 */
export const revokeVipSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { note } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: "Subscriber not found" });
    return;
  }

  user.subscription = {
    plan: "free",
    expiresAt: new Date(), // marked as expired now
    source: user.subscription?.source || "admin_grant",
    adminNote: note ? note.trim() : "Revoked by Admin",
  };

  await user.save();

  // Notify member
  const notif = await Notification.create({
    userId: user._id,
    type: "system",
    message: "Your NIRA VIP Premium membership has ended and your account is now on the Free plan.",
  });

  const io = (req as any).io;
  if (io) {
    io.to(user._id.toString()).emit("newNotification", notif);
  }

  res.status(200).json({
    message: `VIP membership revoked for ${user.name}`,
    user,
  });
});
