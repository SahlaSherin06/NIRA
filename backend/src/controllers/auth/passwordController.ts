import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { Session } from "../../models/Session";
import { redis } from "../../utils/redisClient";
import { sendPasswordResetOtpEmail } from "../../utils/sendEmail";

// 7. FORGOT PASSWORD (OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const redisKey = `auth:reset:${email.toLowerCase()}`;
    
    await redis.set(redisKey, hashedOtp, "EX", 900); // 15 mins

    // Send OTP via email (asynchronous to prevent UI hanging)
    sendPasswordResetOtpEmail(email, otp).catch(err => console.error("Reset OTP email failed:", err));

    res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// 8. RESET PASSWORD (WITH OTP)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: "Email, OTP, and new password are required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    const redisKey = `auth:reset:${email.toLowerCase()}`;
    const hashedOtp = await redis.get(redisKey);

    if (!hashedOtp) {
      res.status(400).json({ message: "OTP expired or invalid." });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, hashedOtp);
    if (!isOtpValid) {
      res.status(400).json({ message: "OTP expired or invalid." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Session.deleteMany({ userId: user._id });
    await redis.del(redisKey);

    res.status(200).json({ message: "Password has been reset successfully. Please log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
