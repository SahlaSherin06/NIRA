import { Router } from "express";
import { completeOnboarding, getMyProfile, updateMyProfile, saveDraft, getDraft } from "../controllers/profileController";
import { requireAuth } from "../../auth/middleware/authMiddleware";

const router = Router();

router.get("/draft", requireAuth, getDraft);
router.post("/draft", requireAuth, saveDraft);

router.post("/onboarding", requireAuth, completeOnboarding);
router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

export default router;
