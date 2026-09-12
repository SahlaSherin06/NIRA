"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="bg-white p-10 rounded-3xl shadow-xl shadow-brand-900/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-900"></div>
      
      <div className="text-center mb-8">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <input
            {...register("password")}
            type="password"
            className="w-full px-4 py-3 bg-cream/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all placeholder:text-gray-400"
            placeholder="••••••••"
          />
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

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Google
          </button>
          
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.496 3.609-2.978 1.153-1.682 1.629-3.315 1.65-3.398-.035-.015-3.186-1.221-3.218-4.858-.026-3.04 2.482-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.533 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
            </svg>
            Apple
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
        <span className="text-gray-500">Don't have an account? </span>
        <Link href="/register" className="font-bold text-brand-900 hover:text-brand-800 transition-colors">
          Create Profile
        </Link>
      </div>
    </div>
  );
}
