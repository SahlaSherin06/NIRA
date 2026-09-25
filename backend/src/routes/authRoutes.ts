import express from "express";
import { registerStep1, registerStep2, registerStep3 } from "../controllers/auth/registerController";
import { loginStep1Email, loginStep2OTP, loginStep3Password } from "../controllers/auth/loginController";
import { googleLogin } from "../controllers/auth/googleController";
import { forgotPassword, resetPassword } from "../controllers/auth/passwordController";
import { getMe, refreshToken, logout } from "../controllers/auth/sessionController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register/step1", registerStep1);
router.post("/register/step2", registerStep2);
router.post("/register/step3", registerStep3);

router.post("/login/step1-email", loginStep1Email);
router.post("/login/step2-otp", loginStep2OTP);
router.post("/login/step3-password", loginStep3Password);

router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireAuth, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
