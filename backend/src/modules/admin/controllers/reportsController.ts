import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Profile } from "../../profile/models/Profile";
import { Interaction } from "../../feed/models/Interaction";
import { Notification } from "../../notifications/models/Notification";

/**
 * GET /api/admin/reports
 * Fetch reported users with filters, search, populated profile photos, and count metrics
 */
export const getAdminReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const search = ((req.query.search as string) || "").trim();
  const status = (req.query.status as string) || "all";

  const filterQuery: any = { action: "report" };
  if (status === "pending") {
    filterQuery.$or = [
      { status: "pending" },
      { status: { $exists: false } },
      { status: null },
    ];
  } else if (status && status !== "all") {
    filterQuery.status = status;
  }

  // Fetch reports sorted by createdAt: -1, _id: -1
  const rawReports = await Interaction.find(filterQuery)
    .populate("actorId", "name email")
    .populate("targetId", "name email gender isBanned subscription warningsCount warningNotes")
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  // Also collect metrics
  const [totalCount, pendingCount, warnedCount, resolvedCount, dismissedCount] = await Promise.all([
    Interaction.countDocuments({ action: "report" }),
    Interaction.countDocuments({
      action: "report",
      $or: [
        { status: "pending" },
        { status: { $exists: false } },
        { status: null },
      ],
    }),
    Interaction.countDocuments({ action: "report", status: "warned" }),
    Interaction.countDocuments({ action: "report", status: "resolved" }),
    Interaction.countDocuments({ action: "report", status: "dismissed" }),
  ]);

  // Aggregate total report count per targetId across the platform
  const targetIds = rawReports.map((r: any) => r.targetId?._id).filter(Boolean);
  const targetReportCounts = await Interaction.aggregate([
    { $match: { action: "report", targetId: { $in: targetIds } } },
    { $group: { _id: "$targetId", count: { $sum: 1 } } }
  ]);
  const reportCountMap = new Map();
  targetReportCounts.forEach((t: any) => {
    reportCountMap.set(t._id.toString(), t.count);
  });

  // Fetch profiles for targets to get real photos and biodata
  const profiles = await Profile.find({ userId: { $in: targetIds } }).lean();
  const profileMap = new Map();
  profiles.forEach((p: any) => {
    profileMap.set(p.userId.toString(), p);
  });

  // Enrich reports
  let enrichedReports = rawReports.map((r: any) => {
    const targetUserId = r.targetId?._id?.toString();
    const prof = targetUserId ? profileMap.get(targetUserId) : null;
    return {
      ...r,
      status: r.status || "pending",
      targetProfile: prof ? {
        mainPhoto: prof.mainPhoto || null,
        city: prof.city || null,
        state: prof.state || null,
        profession: prof.profession || null,
        religion: prof.religion || null,
        dob: prof.dob || null,
      } : null,
      targetReportCount: targetUserId ? (reportCountMap.get(targetUserId) || 1) : 1,
    };
  });

  // Search filter in memory if provided
  if (search) {
    const s = search.toLowerCase();
    enrichedReports = enrichedReports.filter((r: any) => {
      const targetName = r.targetId?.name?.toLowerCase() || "";
      const targetEmail = r.targetId?.email?.toLowerCase() || "";
      const actorName = r.actorId?.name?.toLowerCase() || "";
      const actorEmail = r.actorId?.email?.toLowerCase() || "";
      const reason = r.reason?.toLowerCase() || "";
      return targetName.includes(s) || targetEmail.includes(s) || actorName.includes(s) || actorEmail.includes(s) || reason.includes(s);
    });
  }

  res.status(200).json({
    reports: enrichedReports,
    metrics: {
      total: totalCount,
      pending: pendingCount,
      warned: warnedCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
    },
  });
});

/**
 * PATCH /api/admin/reports/:id/warn
 * Issue official safety warning to reported user & notify the user
 */
export const warnReportUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { message } = req.body;

  const report = await Interaction.findById(id);
  if (!report || report.action !== "report") {
    res.status(404).json({ message: "Report not found" });
    return;
  }

  const warningMsg = (message as string)?.trim() || "Safety Notice: Your profile was flagged for inappropriate conduct. Please adhere to NIRA guidelines.";

  report.status = "warned";
  report.adminNote = warningMsg;
  report.resolvedAt = new Date();
  await report.save();

  // 1. Increment target user's warning count in DB
  if (report.targetId) {
    const updatedUser = await User.findByIdAndUpdate(
      report.targetId,
      {
        $inc: { warningsCount: 1 },
        $push: {
          warningNotes: {
            message: warningMsg,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    const strikeCount = updatedUser?.warningsCount || 1;

    // 2. Dispatch user-facing Safety Warning Notification
    const notif = await Notification.create({
      userId: report.targetId,
      type: "warning",
      message: `Safety Warning Strike #${strikeCount}: ${warningMsg}`,
    });

    // 3. Emit real-time Socket.IO event to user's personal channel
    const io = (req as any).io;
    if (io) {
      io.to(report.targetId.toString()).emit("newNotification", notif);
      io.to(report.targetId.toString()).emit("safetyWarning", {
        message: warningMsg,
        warningsCount: strikeCount,
      });
    }
  }

  res.status(200).json({
    message: "Official warning issued and sent to user successfully",
    report,
  });
});

/**
 * PATCH /api/admin/reports/:id/dismiss
 * Dismiss false or invalid report & notify reporter
 */
export const dismissAdminReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { note } = req.body;

  const report = await Interaction.findById(id);
  if (!report || report.action !== "report") {
    res.status(404).json({ message: "Report not found" });
    return;
  }

  report.status = "dismissed";
  report.adminNote = (note as string)?.trim() || "Dismissed by admin (No violation found)";
  report.resolvedAt = new Date();
  await report.save();

  // Notify the complainant that report was reviewed
  if (report.actorId) {
    const notif = await Notification.create({
      userId: report.actorId,
      type: "system",
      message: "Safety update: Your report has been reviewed by our moderation team. Thank you for helping keep NIRA safe.",
    });

    const io = (req as any).io;
    if (io) {
      io.to(report.actorId.toString()).emit("newNotification", notif);
    }
  }

  res.status(200).json({
    message: "Report dismissed as safe",
    report,
  });
});

/**
 * PATCH /api/admin/reports/:id/resolve
 * Suspend user, mark report as resolved & notify both parties
 */
export const resolveAdminReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { note } = req.body;

  const report = await Interaction.findById(id);
  if (!report || report.action !== "report") {
    res.status(404).json({ message: "Report not found" });
    return;
  }

  report.status = "resolved";
  report.adminNote = (note as string)?.trim() || "Account suspended due to policy violation";
  report.resolvedAt = new Date();
  await report.save();

  const io = (req as any).io;

  // 1. Suspend target user and dispatch notice
  if (report.targetId) {
    await User.findByIdAndUpdate(report.targetId, {
      isBanned: true,
    });

    await Notification.create({
      userId: report.targetId,
      type: "warning",
      message: "Account Suspension Notice: Your account has been suspended following community guideline violations.",
    });

    if (io) {
      io.to(report.targetId.toString()).emit("accountSuspended", {
        message: "Your account has been suspended for policy violations.",
        isBanned: true,
      });
      io.in(report.targetId.toString()).disconnectSockets(true);
    }
  }

  // 2. Notify the complainant that action was taken
  if (report.actorId) {
    const notif = await Notification.create({
      userId: report.actorId,
      type: "system",
      message: "Safety update: The profile you reported has been investigated and suspended. Thank you for keeping our community safe.",
    });

    if (io) {
      io.to(report.actorId.toString()).emit("newNotification", notif);
    }
  }

  res.status(200).json({
    message: "User suspended, report resolved, and notifications dispatched successfully",
    report,
  });
});

