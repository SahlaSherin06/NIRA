import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Transaction } from "../models/Transaction";
import { User } from "../../auth/models/User";

// Safe init (won't crash if keys are missing in env, just throws when called)
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";
  return new Razorpay({ key_id, key_secret });
};

// POST /api/subscription/create-order
export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Define plan price (e.g., 499 INR)
  const amount = 499 * 100; // Razorpay expects amount in paise
  const currency = "INR";

  const rzp = getRazorpayInstance();
  
  try {
    const order = await rzp.orders.create({
      amount,
      currency,
      receipt: `receipt_order_${userId}_${Date.now()}`,
    });

    // Save transaction in DB
    await Transaction.create({
      userId,
      razorpayOrderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      plan: 'premium',
      status: 'created'
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key"
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: "Could not create Razorpay order", error: error.message });
  }
});

// POST /api/subscription/verify-payment
export const verifyPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Update Transaction
    await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'successful'
      }
    );

    // Upgrade User
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1); // 1 Month plan

    await User.findByIdAndUpdate(userId, {
      "subscription.plan": "premium",
      "subscription.expiresAt": expiry
    });

    res.status(200).json({ message: "Payment verified successfully. Welcome to Premium!" });
  } else {
    // Update Transaction
    await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    res.status(400).json({ message: "Invalid payment signature" });
  }
});

// POST /api/subscription/dev-upgrade (Bypass for testing without Razorpay account)
export const devUpgrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);

  await User.findByIdAndUpdate(userId, {
    "subscription.plan": "premium",
    "subscription.expiresAt": expiry
  });

  res.status(200).json({ message: "Dev upgrade successful. Welcome to Premium!" });
});
