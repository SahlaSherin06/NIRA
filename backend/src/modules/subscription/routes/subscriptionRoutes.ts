import { Router } from "express";
import { requireAuth } from "../../auth/middleware/authMiddleware";
import { createOrder, verifyPayment, devUpgrade } from "../controllers/subscriptionController";

const router = Router();

router.use(requireAuth);

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/dev-upgrade", devUpgrade);

export default router;
