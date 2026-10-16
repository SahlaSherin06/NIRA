"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.queries";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

/**
 * Component: OnboardingPage
 * Renders the UI and handles the internal logic for the Onboarding Page.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const isAdmin =
      session?.user?.role === "admin" ||
      session?.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

    if (!session) {
      router.replace("/");
    } else if (isAdmin) {
      router.replace("/admin");
    } else if (session.user?.isOnboardingComplete) {
      router.replace("/home");
    }
  }, [isPending, session, router]);

  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

  if (isPending || !session || isAdmin || session.user?.isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-[#F9F7F6] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-brand-900 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F6] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <OnboardingWizard />
    </div>
  );
}
