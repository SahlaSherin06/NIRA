import { Router } from "express";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { getNotifications, markAsRead } from "../controllers/notificationController";

const router = Router();

router.use(requireAuth);

router.get("/", getNotifications);
router.put("/read", markAsRead);

export default router;
