import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  family: 4 
} as any);

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `NIRA Matrimony <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your NIRA OTP Verification Code",
    html: `<div style='font-family: Arial, sans-serif; padding: 20px;'>
      <h2>Welcome to NIRA!</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style='color: #4A154B; letter-spacing: 5px;'>${otp}</h1>
      <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Could not send OTP email");
  }
};


export const sendPasswordResetOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `NIRA Matrimony <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Password Reset OTP",
    html: `<div style='font-family: Arial, sans-serif; padding: 20px;'>
      <h2>Password Reset OTP</h2>
      <p>Your OTP to reset your password is:</p>
      <h1 style='color: #4A154B; letter-spacing: 5px;'>${otp}</h1>
      <p style='color: #666; font-size: 12px;'>This OTP is valid for 15 minutes. Do not share it with anyone.</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Reset OTP email sending failed:", error);
    throw new Error("Could not send reset OTP email");
  }
};
