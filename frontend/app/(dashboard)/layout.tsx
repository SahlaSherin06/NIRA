"use client";

import { useSession } from "@/features/auth/api/authqueries";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { DashboardFooter } from "@/components/layout/DashboardFooter";

/**
 * Component: DashboardLayout
 * Renders the UI and handles the internal logic for the Dashboard Layout.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Basic route protection
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      localStorage.removeItem("nira_access_token");
      router.replace("/");
    } else if (session.user && !session.user.isOnboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isPending, session, router, pathname]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F9] via-white to-[#FDF8F9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F9] via-white to-[#FDF8F9] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
      <DashboardNavbar />
      
      {/* Main Page Content */}
      <main className="flex-1 flex flex-col pt-24 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12 relative w-full max-w-7xl mx-auto">
        {children}
      </main>

      <DashboardFooter />
    </div>
  );
}
