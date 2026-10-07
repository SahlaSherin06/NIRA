import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { redis } from "../../../utils/redisClient";
import { sendOtpEmail } from "../../../utils/sendEmail";
import { generateTokens } from "../../../utils/jwtUtils";

/**
 * Function: loginStep1Email
 * Executes the core operations and logic for login step1 email.
 */
export const loginStep1Email = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal user existence strictly, but here we error for better UX
      res.status(404).json({ message: "No account found with this email" });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const redisKey = `auth:login:otp:${email.toLowerCase()}`;
    
    // Save to Redis for 300 seconds (5 minutes) to give them enough time
    await redis.set(redisKey, hashedOtp, "EX", 300);
    
    // Send email 
    sendOtpEmail(email, otp).catch((err) => console.error("OTP send failed:", err));

    res.status(200).json({ message: "OTP sent successfully" });
});

/**
 * Function: loginStep2OTP
 * Executes the core operations and logic for login step2 o t p.
 */
export const loginStep2OTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const redisKey = `auth:login:otp:${email.toLowerCase()}`;
    const hashedOtp = await redis.get(redisKey);

    if (!hashedOtp) {
      res.status(400).json({ message: "OTP expired or invalid" });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, hashedOtp);
    if (!isOtpValid) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    // Delete OTP, Set Success Flag valid for 5 mins
    await redis.del(redisKey);
    const passedKey = `auth:login:passed:${email.toLowerCase()}`;
    await redis.set(passedKey, "true", "EX", 300);

    res.status(200).json({ message: "OTP verified successfully" });
});

/**
 * Function: loginStep3Password
 * Executes the core operations and logic for login step3 password.
 */
export const loginStep3Password = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Check if they passed the OTP step
    const passedKey = `auth:login:passed:${email.toLowerCase()}`;
    const hasPassed = await redis.get(passedKey);

    if (!hasPassed) {
      res.status(401).json({ message: "Please verify OTP first or OTP verification expired" });
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

    // Passed both OTP and Password! Clear the flag and issue tokens
    await redis.del(passedKey);
    const accessToken = await generateTokens(user._id as any, res);

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        isOnboardingComplete: user.isOnboardingComplete 
      },
    });
});

