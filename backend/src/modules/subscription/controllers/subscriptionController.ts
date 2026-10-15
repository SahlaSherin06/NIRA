import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";
import { Notification } from "../../notifications/models/Notification";

// POST /api/subscription/dev-upgrade 
export const devUpgrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const duration = req.body?.duration;
  type DurationType = "1_month" | "3_months" | "6_months" | "lifetime";

  const planConfigs: Record<DurationType, { label: string; days: number | null; price: number; durationKey: DurationType }> = {
    "1_month": { label: "1 Month VIP", days: 30, price: 499, durationKey: "1_month" },
    "3_months": { label: "3 Months VIP", days: 90, price: 1199, durationKey: "3_months" },
    "6_months": { label: "6 Months VIP", days: 180, price: 1999, durationKey: "6_months" },
    "lifetime": { label: "Lifetime VIP", days: null, price: 4999, durationKey: "lifetime" },
  };

  const planKey: DurationType = (duration && duration in planConfigs ? duration : "1_month") as DurationType;
  const selectedPlan = planConfigs[planKey];
  const now = new Date();
  const expiresAt = selectedPlan.days ? new Date(now.getTime() + selectedPlan.days * 24 * 60 * 60 * 1000) : null;

  // Upgrade user with selected package details and price
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      subscription: {
        plan: "premium",
        duration: selectedPlan.durationKey,
        amountPaid: selectedPlan.price,
        startDate: now,
        expiresAt,
        source: "razorpay",
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        adminNote: `Subscribed to ${selectedPlan.label} via Razorpay (₹${selectedPlan.price.toLocaleString()})`,
      },
    },
    { new: true }
  );

  // Send real-time notification
  try {
    const notif = await Notification.create({
      userId,
      type: "system",
      message: `🎉 Congratulations! Your NIRA ${selectedPlan.label} membership is active. Enjoy unlimited likes, priority visibility, and premium perks!`,
    });
    const io = (req as any).io;
    if (io) {
      io.to(userId.toString()).emit("newNotification", notif);
    }
  } catch (e) {
    // notification failure should not block upgrade
  }

  res.status(200).json({
    message: `Upgraded to ${selectedPlan.label} successfully`,
    plan: selectedPlan.label,
    price: selectedPlan.price,
    expiresAt,
    user: updatedUser,
  });
});
