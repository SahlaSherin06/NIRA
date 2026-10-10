import { Router } from "express";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { getConversations, getMessages, sendMessage, clearChat } from "../controllers/chatController";

const router = Router();

router.use(requireAuth);

router.get("/conversations", getConversations);
router.get("/:targetId", getMessages);
router.post("/:targetId", sendMessage);

export default router;

router.delete("/:targetId", clearChat);
