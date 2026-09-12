"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, Globe, Smartphone } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Extra UI states that match the design but aren't required by Better Auth yet
  const [createdFor, setCreatedFor] = useState("Self");
  const [gender, setGender] = useState("Male");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use standard fetch to completely bypass client wrapper bugs
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // THIS IS REQUIRED TO SAVE THE SESSION COOKIE
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Could not parse JSON
        }
        setError(errorMessage);
        return;
      }

      // If successful, redirect to home
      router.push("/home");
      
    } catch (err: any) {
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const createdForOptions = ["Self", "Son", "Daughter", "Brother", "Sister", "Friend"];
  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-brand-900/5">
      <div className="text-center mb-8">
        <h1 className="text-brand-900 font-serif font-bold text-lg mb-2">NIRA</h1>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Begin Your Journey</h2>
        <p className="text-sm text-gray-600 max-w-[280px] mx-auto">
          Create an account to discover genuine, verified connections.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Profile Created For */}
        <div className="space-y-3">
          <label className="block text-sm text-gray-800">Profile Created For</label>
          <div className="flex flex-wrap gap-2">
            {createdForOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCreatedFor(option)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
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

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-800">Full Name</label>
          <input
            {...register("name")}
            className="w-full px-4 py-3.5 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm"
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-xs text-red-600 ml-1">{errors.name.message}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className="block text-sm text-gray-800">Gender</label>
          <div className="grid grid-cols-3 gap-2">
            {genderOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option)}
                className={`py-3 text-sm rounded-xl transition-colors ${
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

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-800">Email Address or Phone Number</label>
          <div className="flex space-x-2">
            <div className="flex items-center justify-between px-3 py-3.5 bg-[#F9F7F6] rounded-xl text-sm text-gray-700 w-20 cursor-not-allowed opacity-80">
              <span>+1</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div className="flex-1 relative">
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3.5 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>
          {errors.email && <p className="text-xs text-red-600 ml-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-800">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3.5 bg-[#F9F7F6] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all placeholder:text-gray-400 text-sm pr-12"
              placeholder="Create a secure password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {/* Password strength bars mimicking design */}
          <div className="flex space-x-1 mt-2">
            <div className="h-1 flex-1 bg-[#F9F7F6] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#F9F7F6] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#F9F7F6] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#F9F7F6] rounded-full"></div>
          </div>
          {errors.password && <p className="text-xs text-red-600 ml-1 mt-1">{errors.password.message}</p>}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <div className="flex items-center h-5 mt-0.5">
            <input
              {...register("agree")}
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-brand-900 focus:ring-brand-900"
            />
          </div>
          <label className="text-xs text-gray-600 leading-relaxed">
            I agree to the <Link href="#" className="text-brand-900 hover:underline">Terms of Service</Link>, <Link href="#" className="text-brand-900 hover:underline">Privacy Policy</Link>, and <Link href="#" className="text-brand-900 hover:underline">Community Standards</Link>.
          </label>
        </div>
        {errors.agree && <p className="text-xs text-red-600 ml-7 -mt-2">{errors.agree.message}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-medium text-white bg-[#8B4253] hover:bg-[#7a3847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Creating account..." : "Create Free Profile"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 mr-2 text-gray-600" />
            Google
          </button>
          
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Smartphone className="w-4 h-4 mr-2 text-gray-600" />
            Apple
          </button>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-900 hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}
