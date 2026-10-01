import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { redis } from "../../../utils/redisClient";
import { sendOtpEmail } from "../../../utils/sendEmail";
import { generateTokens } from "../../../utils/jwtUtils";

// STEP 1: Basic Info & Send OTP
/**
 * Function: registerStep1
 * Executes the core operations and logic for register step1.
 */
export const registerStep1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, gender, createdFor } = req.body;

    if (!name || !email || !gender || !createdFor) {
      res.status(400).json({ message: "All basic fields are required" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const redisKey = `auth:register:otp:${email.toLowerCase()}`;
    const tempData = JSON.stringify({ name, email: email.toLowerCase(), gender, createdFor, otp: hashedOtp });
    
    // Save to Redis for 5 minutes
    await redis.set(redisKey, tempData, "EX", 300);
    
    // Send email asynchronously
    sendOtpEmail(email, otp).catch(err => console.error("Register OTP email failed:", err));

    res.status(200).json({ message: "OTP sent successfully. Please check your email." });
  } catch (error) {
    console.error("Register Step 1 Error:", error);
    res.status(500).json({ message: "Failed to initiate registration" });
  }
};

// STEP 2: Verify OTP
/**
 * Function: registerStep2
 * Executes the core operations and logic for register step2.
 */
export const registerStep2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const redisKey = `auth:register:otp:${email.toLowerCase()}`;
    const tempDataString = await redis.get(redisKey);

    if (!tempDataString) {
      res.status(400).json({ message: "OTP expired or invalid. Please try again." });
      return;
    }

    const tempData = JSON.parse(tempDataString);
    const isOtpValid = await bcrypt.compare(otp, tempData.otp);
    
    if (!isOtpValid) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    // Delete OTP, move details to "Passed" state valid for 10 minutes (to give them time to set a password)
    await redis.del(redisKey);
    
    const passedKey = `auth:register:passed:${email.toLowerCase()}`;
    // Save details without the OTP
    const passedData = JSON.stringify({
      name: tempData.name,
      email: tempData.email,
      gender: tempData.gender,
      createdFor: tempData.createdFor
    });
    
    await redis.set(passedKey, passedData, "EX", 600); // 10 minutes

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Register Step 2 Error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// STEP 3: Set Password & Create Account
/**
 * Function: registerStep3
 * Executes the core operations and logic for register step3.
 */
export const registerStep3 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      res.status(400).json({ message: "Password is required" });
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

    const passedKey = `auth:register:passed:${email.toLowerCase()}`;
    const passedDataString = await redis.get(passedKey);

    if (!passedDataString) {
      res.status(401).json({ message: "Please verify OTP first or OTP verification expired" });
      return;
    }

    const passedData = JSON.parse(passedDataString);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: passedData.name,
      email: passedData.email,
      password: hashedPassword,
      gender: passedData.gender,
      createdFor: passedData.createdFor,
      isEmailVerified: true,
    });

    await Account.create({
      userId: newUser._id,
      provider: "email",
      providerAccountId: newUser.email,
    });

    // Clear passed flag
    await redis.del(passedKey);
    
    const accessToken = await generateTokens(newUser._id as any, res);

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email,
        isOnboardingComplete: newUser.isOnboardingComplete
      },
    });
  } catch (error) {
    console.error("Register Step 3 Error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
};
