import express from "express";
import { devUpgrade } from "../controllers/subscriptionController";
import { requireAuth } from "../../auth/middleware/authMiddleware";

const router = express.Router();

router.use(requireAuth);

// Dev shortcut route
router.post("/dev-upgrade", devUpgrade);

export default router;
