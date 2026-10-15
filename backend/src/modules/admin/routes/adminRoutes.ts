import express from "express";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

// Domain-specific Controllers
import { getAdminStats } from "../controllers/dashboardController";
import {
  getAdminUsers,
  toggleBanUser,
  togglePremiumUser,
} from "../controllers/usersController";
import {
  getAdminReports,
  warnReportUser,
  dismissAdminReport,
  resolveAdminReport,
} from "../controllers/reportsController";
import {
  getAdminSubscriptions,
  getEligibleUsersForGrant,
  grantVipAccess,
  extendVipSubscription,
  revokeVipSubscription,
} from "../controllers/subscriptionsController";

const router = express.Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// 1. Dashboard Overview
router.get("/stats", getAdminStats);

// 2. Member Management
router.get("/users", getAdminUsers);
router.patch("/users/:id/ban", toggleBanUser);
router.patch("/users/:id/premium", togglePremiumUser);

// 3. Safety, Moderation & Reports
router.get("/reports", getAdminReports);
router.patch("/reports/:id/warn", warnReportUser);
router.patch("/reports/:id/dismiss", dismissAdminReport);
router.patch("/reports/:id/resolve", resolveAdminReport);

// 4. Subscriptions & Revenue Management
router.get("/subscriptions", getAdminSubscriptions);
router.get("/subscriptions/eligible-users", getEligibleUsersForGrant);
router.post("/subscriptions/grant", grantVipAccess);
router.patch("/subscriptions/:id/extend", extendVipSubscription);
router.patch("/subscriptions/:id/revoke", revokeVipSubscription);

export default router;
