import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../../models/User";
import { Account } from "../../models/Account";
import { redis } from "../../utils/redisClient";
import { sendOtpEmail } from "../../utils/sendEmail";
import { generateTokens } from "../../utils/jwtUtils";

// 1. INITIATE REGISTRATION
export const registerInit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const redisKey = `auth:register:${email.toLowerCase()}`;
    const tempData = JSON.stringify({ name, email, password: hashedPassword, otp: hashedOtp });
    
    await redis.set(redisKey, tempData, "EX", 300);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully. Please check your email." });
  } catch (error) {
    console.error("Register Init Error:", error);
    res.status(500).json({ message: "Failed to initiate registration" });
  }
};

// 2. VERIFY REGISTRATION
export const registerVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const redisKey = `auth:register:${email.toLowerCase()}`;
    const tempDataString = await redis.get(redisKey);

    if (!tempDataString) {
      res.status(400).json({ message: "OTP expired or invalid. Please register again." });
      return;
    }

    const tempData = JSON.parse(tempDataString);
    const isOtpValid = await bcrypt.compare(otp, tempData.otp);
    if (!isOtpValid) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    const newUser = await User.create({
      name: tempData.name,
      email: tempData.email.toLowerCase(),
      password: tempData.password,
      isEmailVerified: true,
    });

    await Account.create({
      userId: newUser._id,
      provider: "email",
      providerAccountId: newUser.email,
    });

    await redis.del(redisKey);
    const accessToken = await generateTokens(newUser._id as any, res);

    res.status(201).json({
      message: "Registration verified and completed successfully",
      accessToken,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Verify Registration Error:", error);
    res.status(500).json({ message: "Failed to verify registration" });
  }
};
