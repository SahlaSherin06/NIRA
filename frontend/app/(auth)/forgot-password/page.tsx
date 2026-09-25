"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Clear any saved login state when entering forgot password
  useEffect(() => {
    sessionStorage.removeItem("nira_login_step");
    sessionStorage.removeItem("nira_login_email");
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", { email, otp, newPassword });
      setStatus("success");
      setMessage(res.data.message || "Password successfully reset!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to reset password. The OTP might have expired.");
    }
  };

  return (
    <div data-reveal="up" className="bg-white p-10 rounded-[2rem] shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-900"></div>
      
      <div className="text-center mb-8" data-reveal="fade">
        <h1 className="text-brand-900 font-serif font-bold text-lg mb-2">NIRA</h1>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="text-sm text-gray-600 max-w-[280px] mx-auto">
          {step === 1 
            ? "Enter your email and we'll send you an OTP."
            : `Enter the OTP sent to ${email} and set a new password.`}
        </p>
      </div>

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
          {message}
        </div>
      )}

      {status === "success" ? (
        <div className="text-center space-y-6">
          <div className="p-4 bg-green-50/50 border border-green-100 text-green-700 text-sm rounded-xl">
            {message}
          </div>
          <p className="text-sm text-gray-600">
            You can now log in with your new password.
          </p>
          <div className="pt-4">
            <Link 
              href="/login"
              className="inline-block w-full py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-brand-900 hover:bg-brand-800 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 transition-all"
            >
              {status === "loading" ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-brand-900 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1 text-center">Enter 6-digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-4 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-center text-2xl tracking-widest font-mono"
              placeholder="------"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading" || otp.length !== 6}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] disabled:opacity-50 transition-all"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-brand-900 hover:underline"
            >
              Wrong email or resend OTP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
