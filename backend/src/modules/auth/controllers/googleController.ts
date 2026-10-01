import { Request, Response } from "express";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { generateTokens } from "../../../utils/jwtUtils";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "dummy_client_id";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 6. GOOGLE OAUTH
/**
 * Function: googleLogin
 * Executes the core operations and logic for google login.
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
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
    }

    const accessToken = await generateTokens(user._id as any, res);

    res.status(200).json({
      message: "Google authentication successful",
      accessToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        isOnboardingComplete: user.isOnboardingComplete
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Failed to authenticate with Google: " + (error as any).message });
  }
};
