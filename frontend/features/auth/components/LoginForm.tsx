"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/features/auth/auth.queries";
import { useGoogleLogin } from "@react-oauth/google";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

/**
 * Component: LoginForm
 * Renders the UI and handles the internal logic for the Login Form.
 */
export function LoginForm() {
  const router = useRouter();
  const { data: session, loginStep1, loginStep2, loginStep3, signInWithGoogle } = useSession();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  
  // Stored values
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Step 2: OTP Timer state
  const [resendTimer, setResendTimer] = useState(0);

  // Step 3: Password UI state
  const [showPassword, setShowPassword] = useState(false);

    // If user is already logged in, redirect based on role
  useEffect(() => {
    if (session) {
      if (session.user?.role === "admin" || session.user?.email === "sahlasherins86+admin@gmail.com") {
        router.replace("/admin/dashboard");
      } else if (session.user?.isOnboardingComplete) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [session, router]);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("suspended") === "true") {
        setError(
          "Your account has been suspended by the administrator due to safety or community guidelines violations. Please contact support."
        );
        sessionStorage.removeItem("nira_login_step");
        sessionStorage.removeItem("nira_login_email");
        return;
      }
    }

    const savedStep = sessionStorage.getItem("nira_login_step");
    const savedEmail = sessionStorage.getItem("nira_login_email");
    if (savedStep && savedEmail) {
      setStep(Number(savedStep) as 1 | 2 | 3);
      setEmail(savedEmail);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    sessionStorage.setItem("nira_login_step", step.toString());
    if (email) {
      sessionStorage.setItem("nira_login_email", email);
    }
  }, [step, email]);

  // Email Form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const onEmailSubmit = async (data: EmailFormValues) => {
    setError(null);
    try {
      await loginStep1.mutateAsync({ email: data.email });
      setEmail(data.email);
      setResendTimer(120); // 2 minutes
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  const onResendOtp = async () => {
    setError(null);
    try {
      await loginStep1.mutateAsync({ email });
      setResendTimer(120);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strict digit validation (no letters, emojis, or spaces)
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    try {
      await loginStep2.mutateAsync({ email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setError(null);
    try {
      const response = await loginStep3.mutateAsync({ email, password: data.password });
      sessionStorage.removeItem("nira_login_step");
      sessionStorage.removeItem("nira_login_email");
      
      const isAdmin =
        response.user?.role === "admin" ||
        response.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

      if (isAdmin) {
        router.replace("/admin");
        return;
      }

      if (response.user?.isOnboardingComplete) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid password.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError(null);
        const response = await signInWithGoogle.mutateAsync(tokenResponse.access_token);
        
        const isAdmin =
          response.user?.role === "admin" ||
          response.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

        if (isAdmin) {
          router.replace("/admin");
          return;
        }

        if (response.user?.isOnboardingComplete) {
          router.replace("/home");
        } else {
          router.replace("/onboarding");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Google login failed");
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  // Format timer (e.g., 120 -> 02:00)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div data-reveal="up" className="w-full max-w-[440px] bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-brand-900"></div>
      
      <div className="text-center mb-6 sm:mb-8" data-reveal="fade">
        <h1 className="text-brand-900 font-serif font-bold text-base sm:text-lg mb-1 sm:mb-2">NIRA</h1>
        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 mb-1.5 sm:mb-2">
          {step === 1 && "Welcome Back"}
          {step === 2 && "Verify Email"}
          {step === 3 && "Secure Login"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-[280px] mx-auto">
          {step === 1 && "Enter your email to securely log in."}
          {step === 2 && `We've sent a 6-digit code to ${email}`}
          {step === 3 && "Enter your password to access your account."}
        </p>
      </div>
      
      {error && (
        <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-red-50/50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      {/* STEP 1: EMAIL */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-5" data-reveal-group>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
            <input
              {...registerEmail("email")}
              type="email"
              className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400"
              placeholder="you@example.com"
            />
            {emailErrors.email && <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium">{emailErrors.email.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loginStep1.isPending}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loginStep1.isPending ? "Sending OTP..." : "Send OTP"}
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
      )}

      {/* STEP 2: OTP */}
      {step === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-gray-800 text-center font-medium">Enter 6-digit OTP</label>
            <input
              type="text" // using text to allow max length & strict filtering
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="w-full px-4 py-4 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-center text-2xl tracking-widest font-mono"
              placeholder="------"
              autoComplete="one-time-code"
            />
          </div>
          
          <button
            type="submit"
            disabled={loginStep2.isPending || otp.length !== 6}
            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loginStep2.isPending ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-medium text-brand-900">{formatTime(resendTimer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={onResendOtp}
                disabled={loginStep1.isPending}
                className="text-sm text-brand-900 font-medium hover:underline focus:outline-none disabled:opacity-50"
              >
                {loginStep1.isPending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => { sessionStorage.removeItem("nira_login_step"); sessionStorage.removeItem("nira_login_email"); setStep(1); setOtp(""); setError(null); }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
          >
            Change Email
          </button>
        </form>
      )}

      {/* STEP 3: PASSWORD */}
      {step === 3 && (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5" data-reveal-group>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand-900 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                {...registerPassword("password")}
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordErrors.password && <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium">{passwordErrors.password.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loginStep3.isPending}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loginStep3.isPending ? "Logging in..." : "Login Securely"}
            </button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
          <span className="text-gray-500">Don't have an account? </span>
          <Link href="/register" className="font-bold text-brand-900 hover:text-brand-800 transition-colors">
            Create Profile
          </Link>
        </div>
      )}
    </div>
  );
}

