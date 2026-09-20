"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Key } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useSession } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInOtpInit, signInOtpVerify, signInWithGoogle } = useSession();
  
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError(null);
        await signInWithGoogle.mutateAsync(tokenResponse.access_token);
        router.push("/home");
      } catch (err: any) {
        setError(err.response?.data?.message || "Google login failed");
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  // Login Modes
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  
  // OTP State
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [savedEmail, setSavedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    try {
      if (loginMode === "password") {
        if (!data.password) {
          setError("Password is required");
          return;
        }
        const result = await signIn.mutateAsync({
          email: data.email,
          password: data.password,
        });
        router.push("/home"); // Adjust to /onboarding if needed based on profile check
      } else {
        // Init OTP
        await signInOtpInit.mutateAsync({ email: data.email });
        setSavedEmail(data.email);
        setOtpStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    try {
      const result = await signInOtpVerify.mutateAsync({
        email: savedEmail,
        otp: otp
      });
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Google Sign In (Mock trigger, real integration requires Google OAuth Provider setup on frontend)


  return (
    <div data-reveal="up" className="bg-white p-10 rounded-[2rem] shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-900"></div>
      
      <div className="text-center mb-8" data-reveal="fade">
        <h1 className="text-brand-900 font-serif font-bold text-lg mb-2">NIRA</h1>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">
          {otpStep === 2 ? "Enter OTP" : "Welcome Back"}
        </h2>
        <p className="text-sm text-gray-600 max-w-[280px] mx-auto">
          {otpStep === 2 
            ? `We've sent a 6-digit code to ${savedEmail}`
            : "Log in to continue your journey."}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      {otpStep === 1 ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-reveal-group>
          {/* Method Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setLoginMode("password")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMode === "password" ? "bg-white text-brand-900 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("otp")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMode === "otp" ? "bg-white text-brand-900 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Email OTP
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
          </div>

          {loginMode === "password" && (
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-900 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={signIn.isPending || signInOtpInit.isPending}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {signIn.isPending || signInOtpInit.isPending 
                ? "Processing..." 
                : (loginMode === "password" ? "Sign In to NIRA" : "Send Login OTP")}
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-gray-800 text-center font-medium">Enter 6-digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-4 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-center text-2xl tracking-widest font-mono"
              placeholder="------"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isVerifying ? "Verifying..." : "Verify & Login"}
          </button>
          <button
            type="button"
            onClick={() => setOtpStep(1)}
            className="w-full text-center text-sm text-brand-900 hover:underline mt-2"
          >
            Wrong email or try password instead
          </button>
        </form>
      )}

      {otpStep === 1 && (
        <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6" data-reveal="fade">
          <span className="text-gray-500">Don't have an account? </span>
          <Link href="/register" className="font-bold text-brand-900 hover:text-brand-800 transition-colors">
            Create Profile
          </Link>
        </div>
      )}
    </div>
  );
}



