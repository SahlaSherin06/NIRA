"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.queries";
import { useGoogleLogin } from "@react-oauth/google";

const createdForOptions = ["Myself", "Son", "Daughter", "Brother", "Sister", "Friend", "Relative"];
const genderOptions = ["Male", "Female", "Other"];

// Step 1 Schema
const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});
type BasicInfoValues = z.infer<typeof basicInfoSchema>;

// Step 3 Schema
const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordValues = z.infer<typeof passwordSchema>;

/**
 * Component: RegisterForm
 * Renders the UI and handles the internal logic for the Register Form.
 */
export function RegisterForm() {
  const router = useRouter();
  const { data: session, registerStep1, registerStep2, registerStep3, signInWithGoogle } = useSession();

  // If user is already logged in, redirect them to home
  useEffect(() => {
    if (session) {
      router.replace("/home");
    }
  }, [session, router]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  // Global State for Registration Flow
  const [createdFor, setCreatedFor] = useState("Myself");
  const [gender, setGender] = useState("Female");
  const [email, setEmail] = useState("");

  // OTP Timer State
  const [timeLeft, setTimeLeft] = useState(120);
  const [otp, setOtp] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedStep = sessionStorage.getItem("nira_reg_step");
    const savedEmail = sessionStorage.getItem("nira_reg_email");
    const savedGender = sessionStorage.getItem("nira_reg_gender");
    const savedCreatedFor = sessionStorage.getItem("nira_reg_createdFor");
    
    if (savedStep && savedEmail) {
      setStep(Number(savedStep) as 1 | 2 | 3);
      setEmail(savedEmail);
      if (savedGender) setGender(savedGender);
      if (savedCreatedFor) setCreatedFor(savedCreatedFor);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    sessionStorage.setItem("nira_reg_step", step.toString());
    if (email) sessionStorage.setItem("nira_reg_email", email);
    sessionStorage.setItem("nira_reg_gender", gender);
    sessionStorage.setItem("nira_reg_createdFor", createdFor);
  }, [step, email, gender, createdFor]);

  // Timer logic for OTP (Step 2)
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  // Forms
  const { register: registerBasic, handleSubmit: handleBasicSubmit, formState: { errors: basicErrors } } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
  });

  const { register: registerPass, handleSubmit: handlePassSubmit, formState: { errors: passErrors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Action Handlers
  const onBasicSubmit = async (data: BasicInfoValues) => {
    setError(null);
    try {
      await registerStep1.mutateAsync({
        name: data.name,
        email: data.email,
        gender,
        createdFor,
      });
      setEmail(data.email);
      setStep(2);
      setTimeLeft(120); // Reset timer
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initiate registration");
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }
    try {
      await registerStep2.mutateAsync({ email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const resendOtp = async () => {
    setError(null);
    try {
      setStep(1);
      setError("Please re-submit your details to receive a new OTP.");
    } catch (err) {
      console.error(err);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setError(null);
    try {
      const response = await registerStep3.mutateAsync({
        email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      sessionStorage.removeItem("nira_reg_step");
      sessionStorage.removeItem("nira_reg_email");
      sessionStorage.removeItem("nira_reg_gender");
      sessionStorage.removeItem("nira_reg_createdFor");
      
      if (response.user?.isOnboardingComplete) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account.");
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError(null);
        const response = await signInWithGoogle.mutateAsync(tokenResponse.access_token);
        
        if (response.user?.isOnboardingComplete) {
          router.replace("/home");
        } else {
          router.replace("/onboarding");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Google registration failed");
      }
    },
    onError: () => setError("Google registration failed"),
  });

  return (
    <div data-reveal="up" className="w-full max-w-[440px] bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-brand-900"></div>
      
      <div className="text-center mb-6 sm:mb-8" data-reveal="fade">
        <h1 className="text-brand-900 font-serif font-bold text-base sm:text-lg mb-1 sm:mb-2">NIRA</h1>
        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 mb-1.5 sm:mb-2">Create an Account</h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-[280px] mx-auto">
          {step === 1 ? "Start your journey to find genuine connections." : 
           step === 2 ? `Enter the 6-digit OTP sent to ${email}` :
           "Final step! Secure your account with a password."}
        </p>
      </div>

      {error && (
        <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-red-50/50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      {/* STEP 1: BASIC INFO */}
      {step === 1 && (
        <form onSubmit={handleBasicSubmit(onBasicSubmit)} className="space-y-4 sm:space-y-5" data-reveal-group>
          {/* Profile Created For */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-medium text-gray-800">Profile Created For</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {createdForOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCreatedFor(option)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-colors ${
                    createdFor === option 
                      ? "bg-brand-900 text-white shadow-md" 
                      : "bg-[#F9F7F6] text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-800">Full Name</label>
            <input
              {...registerBasic("name")}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm"
              placeholder="Enter your full name"
            />
            {basicErrors.name && <p className="text-xs text-red-600 ml-1">{basicErrors.name.message}</p>}
          </div>

          <div className="space-y-2 sm:space-y-3 w-full min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-800">Gender</label>
            <div className="grid grid-cols-3 gap-2 w-full min-w-0">
              {genderOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`py-2 px-1 text-xs sm:text-sm rounded-xl transition-colors font-medium truncate text-center ${
                    gender === option 
                      ? "bg-brand-900 text-white shadow-md" 
                      : "bg-[#F9F7F6] text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-800">Email Address</label>
            <input
              {...registerBasic("email")}
              type="email"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm"
              placeholder="name@example.com"
            />
            {basicErrors.email && <p className="text-xs text-red-600 ml-1">{basicErrors.email.message}</p>}
          </div>

          <div className="pt-1 sm:pt-2">
            <button
              type="submit"
              disabled={registerStep1.isPending}
              className="w-full flex justify-center py-3.5 sm:py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-900/10"
            >
              {registerStep1.isPending ? "Sending OTP..." : "Continue"}
            </button>
          </div>

          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loginGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
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

      {/* STEP 2: VERIFY OTP */}
      {step === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-5 sm:space-y-6" data-reveal-group>
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm text-gray-800 text-center font-medium">Enter 6-digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="w-full px-4 py-3 sm:py-4 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-center text-xl sm:text-2xl tracking-widest font-mono"
              placeholder="------"
            />
            <div className="text-center mt-2">
              {timeLeft > 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
              ) : (
                <button type="button" onClick={resendOtp} className="text-xs sm:text-sm text-brand-900 hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={registerStep2.isPending || otp.length !== 6}
            className="w-full flex justify-center py-3.5 sm:py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-900/10"
          >
            {registerStep2.isPending ? "Verifying..." : "Verify & Continue"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("nira_reg_step");
              sessionStorage.removeItem("nira_reg_email");
              setStep(1); 
              setOtp(""); 
              setError(null); 
            }}
            className="w-full text-center text-xs sm:text-sm text-brand-900 hover:underline mt-2"
          >
            Wrong email? Go back
          </button>
        </form>
      )}

      {/* STEP 3: SECURITY (PASSWORD & TERMS) */}
      {step === 3 && (
        <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-4 sm:space-y-5" data-reveal-group>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full min-w-0">
            <div className="space-y-1.5 min-w-0 w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-800">Password</label>
              <div className="relative w-full min-w-0">
                <input
                  {...registerPass("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm pr-10 box-border"
                  placeholder="Password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors.password && <p className="text-xs text-red-600 ml-1 mt-1">{passErrors.password.message}</p>}
            </div>

            <div className="space-y-1.5 min-w-0 w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-800">Confirm Password</label>
              <div className="relative w-full min-w-0">
                <input
                  {...registerPass("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm pr-10 box-border"
                  placeholder="Confirm"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors.confirmPassword && <p className="text-xs text-red-600 ml-1 mt-1">{passErrors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2.5 sm:space-x-3 pt-1 sm:pt-2">
            <div className="flex items-center h-5 mt-0.5 shrink-0">
              <input
                {...registerPass("agree")}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-brand-900 focus:ring-brand-900"
              />
            </div>
            <label className="text-xs text-gray-600 leading-relaxed">
              I agree to the <Link href="#" className="text-brand-900 hover:underline">Terms of Service</Link>, <Link href="#" className="text-brand-900 hover:underline">Privacy Policy</Link>, and <Link href="#" className="text-brand-900 hover:underline">Community Standards</Link>.
            </label>
          </div>
          {passErrors.agree && <p className="text-xs text-red-600 ml-6 sm:ml-7 -mt-2">{passErrors.agree.message}</p>}

          <div className="pt-1 sm:pt-2">
            <button
              type="submit"
              disabled={registerStep3.isPending}
              className="w-full flex justify-center py-3.5 sm:py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-900/10"
            >
              {registerStep3.isPending ? "Creating Profile..." : "Create Free Profile"}
            </button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="mt-6 sm:mt-8 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-900 hover:underline">
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
