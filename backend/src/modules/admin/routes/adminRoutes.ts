import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  toggleBanUser,
  togglePremiumUser,
  getAdminReports,
} from "../controllers/adminController";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.patch("/users/:id/ban", toggleBanUser);
router.patch("/users/:id/premium", togglePremiumUser);
router.get("/reports", getAdminReports);

export default router;
