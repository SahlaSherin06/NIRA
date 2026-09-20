import express from "express";
import { registerInit, registerVerify } from "../controllers/auth/registerController";
import { loginPassword, loginOtpInit, loginOtpVerify } from "../controllers/auth/loginController";
import { googleLogin } from "../controllers/auth/googleController";
import { forgotPassword, resetPassword } from "../controllers/auth/passwordController";
import { getMe, refreshToken, logout } from "../controllers/auth/sessionController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerInit);
router.post("/verify-registration", registerVerify);

router.post("/login/password", loginPassword);
router.post("/login/otp/init", loginOtpInit);
router.post("/login/otp/verify", loginOtpVerify);

router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireAuth, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;

