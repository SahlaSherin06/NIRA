"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use standard fetch to completely bypass client wrapper bugs
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // THIS IS REQUIRED TO SAVE THE SESSION COOKIE
        body: JSON.stringify({
          email: data.email,
          password: data.password,
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

  return (
    <div data-reveal="up" className="bg-white p-10 rounded-3xl shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-900"></div>
      
      <div className="text-center mb-8" data-reveal="fade">
        <h1 className="text-brand-900 font-serif font-bold text-lg mb-2">NIRA</h1>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-600 max-w-[280px] mx-auto">
          Log in to continue your journey.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-reveal-group>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-3 bg-cream/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 bg-cream/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all placeholder:text-gray-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 rounded-full shadow-lg shadow-brand-900/20 text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
          >
            {isLoading ? "Signing in..." : "Sign In to NIRA"}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6" data-reveal="fade">
        <span className="text-gray-500">Don't have an account? </span>
        <Link href="/register" className="font-bold text-brand-900 hover:text-brand-800 transition-colors">
          Create Profile
        </Link>
      </div>
    </div>
  );
}
