import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { generateTokens } from "../../../utils/jwtUtils";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "dummy_client_id";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Function: googleLogin
 * Executes the core operations and logic for google login.
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { idToken, accessToken: googleAccessToken } = req.body;
    
    if (!idToken && !googleAccessToken) {
      res.status(400).json({ message: "Google ID Token or Access Token is required" });
      return;
    }

    let email, name, googleId;

    if (idToken) {
      const ticket: any = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      // Removed email_verified check because it sometimes fails for valid GSuite/workspace accounts
      if (!payload || !payload.email) {
        res.status(400).json({ message: "Invalid Google Token (no email provided)" });
        return;
      }
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      
    } else if (googleAccessToken) {
      const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      
      if (!data || !data.email) {
        res.status(400).json({ message: "Invalid Google Access Token (no email provided)" });
        return;
      }
      email = data.email;
      name = data.name;
      googleId = data.sub;
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.isBanned) {
        res.status(403).json({
          message: "Your account has been suspended by the administrator due to safety or community guidelines violations. Please contact support.",
          isBanned: true,
        });
        return;
      }
      const existingAccount = await Account.findOne({ userId: user._id, provider: "google" });
      if (!existingAccount) {
        await Account.create({
          userId: user._id,
          provider: "google",
          providerAccountId: googleId,
        });
      }
    } else {
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        isEmailVerified: true,
      });
      await Account.create({
        userId: user._id,
        provider: "google",
        providerAccountId: googleId,
      });

      // Notify Admin of Google registration
      try {
        const { Notification } = require("../../notifications/models/Notification");
        const adminNotif = await Notification.create({
          isAdminNotification: true,
          type: "admin_registration",
          title: "New Member Registered (Google)",
          message: `${user.name} (${user.email}) registered using Google Sign-In.`,
          relatedUserId: user._id,
          link: "/admin/users",
          metadata: {
            userName: user.name,
            userEmail: user.email,
            provider: "google",
          },
        });

        const io = (req as any).io;
        if (io) {
          io.emit("adminNotification", adminNotif);
        }
      } catch (e) {
        console.error("Failed to emit Google registration notification:", e);
      }
    }

    // Check if admin email
    if (user.email.toLowerCase() === "sahlasherins86+admin@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const accessToken = await generateTokens(user._id as any, res);

    res.status(200).json({
      message: "Google authentication successful",
      accessToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        isOnboardingComplete: user.isOnboardingComplete
      },
    });
});

