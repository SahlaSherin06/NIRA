"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.queries";
import { LoginForm } from "@/features/auth/components/LoginForm";

import { AuthLayout } from "@/features/auth/components/AuthLayout";

/**
 * Component: Page
 * Renders the UI and handles the internal logic for the Page.
 */
export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (session) {
      if (session.user?.role === "admin" || session.user?.email === "sahlasherins86+admin@gmail.com") {
        router.replace("/admin/dashboard");
      } else if (session.user?.isOnboardingComplete) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isPending, session, router]);

  if (isPending || session) {
    return (
      <div className="min-h-screen bg-[#F9F7F6] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-brand-900 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
