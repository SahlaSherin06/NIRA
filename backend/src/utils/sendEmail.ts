import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: `NIRA Matrimony <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your NIRA Password",
    html: `<div style='font-family: Arial, sans-serif; padding: 20px;'>
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href='${resetLink}' style='background-color: #4A154B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;'>Reset Password</a>
      <p style='margin-top: 20px; font-size: 12px; color: #666;'>This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Reset email sending failed:", error);
    throw new Error("Could not send reset password email");
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
