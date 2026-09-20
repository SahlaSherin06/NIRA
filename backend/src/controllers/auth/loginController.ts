import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { redis } from "../../utils/redisClient";
import { sendOtpEmail } from "../../utils/sendEmail";
import { generateTokens } from "../../utils/jwtUtils";

// 3. LOGIN PASSWORD
export const loginPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = await generateTokens(user._id as any, res);

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 4. LOGIN OTP INIT
export const loginOtpInit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(200).json({ message: "If an account exists, an OTP has been sent." });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const redisKey = `auth:login:${email.toLowerCase()}`;
    
    await redis.set(redisKey, hashedOtp, "EX", 300);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "If an account exists, an OTP has been sent." });
  } catch (error) {
    console.error("Login OTP Init Error:", error);
    res.status(500).json({ message: "Failed to initiate OTP login" });
  }
};

// 5. LOGIN OTP VERIFY
export const loginOtpVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const redisKey = `auth:login:${email.toLowerCase()}`;
    const hashedOtp = await redis.get(redisKey);

    if (!hashedOtp) {
      res.status(400).json({ message: "OTP expired or invalid." });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, hashedOtp);
    if (!isOtpValid) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    await redis.del(redisKey);
    const accessToken = await generateTokens(user._id as any, res);

    res.status(200).json({
      message: "Logged in successfully via OTP",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Verify OTP Login Error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
