import { Router } from "express";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { getRecommendations } from "../controllers/feedController";
import { recordAction, removeAction, getActivityLogs } from "../controllers/interactionController";
import { getExploreData } from "../controllers/exploreController";
import { getMatchesData } from "../controllers/matchesController";

const router = Router();

router.use(requireAuth);

router.get("/recommendations", getRecommendations);
router.get("/explore", getExploreData);
router.get("/matches", getMatchesData);
router.get("/activity", getActivityLogs);
router.post("/interact", recordAction);
router.delete("/interact/:targetId", removeAction);

export default router;
