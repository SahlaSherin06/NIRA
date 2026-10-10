import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { User } from "../../auth/models/User";

// POST /api/subscription/dev-upgrade 
export const devUpgrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Upgrade the user
  await User.findByIdAndUpdate(userId, {
    subscription: {
      plan: 'premium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  res.status(200).json({ message: "Upgraded to premium successfully (Dev Mode)" });
});
