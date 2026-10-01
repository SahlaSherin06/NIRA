import { Router } from "express";
import { completeOnboarding, getMyProfile, updateMyProfile } from "../controllers/profileController";
import { requireAuth } from "../../auth/middleware/authMiddleware";

const router = Router();

router.post("/onboarding", requireAuth, completeOnboarding);
router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

export default router;
