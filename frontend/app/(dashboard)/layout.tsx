"use client";

import { useSession } from "@/features/auth/auth.queries";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { GlobalNotificationListener } from "@/components/notifications/GlobalNotificationListener";

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

  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

  // Basic route protection
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      const token = typeof window !== "undefined" ? localStorage.getItem("nira_access_token") : null;
      if (!token) {
        router.replace("/");
      }
    } else if (isAdmin) {
      // Admin should never access member dating pages (/home, /profile, etc.)
      router.replace("/admin");
    } else if (session.user && !session.user.isOnboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isPending, session, isAdmin, router, pathname]);

  if (isPending || !session || isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F9] via-white to-[#FDF8F9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F9] via-white to-[#FDF8F9] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
      <DashboardNavbar />
      <GlobalNotificationListener />
      
      {/* Main Page Content */}
      <main className={`flex-1 flex flex-col relative w-full overflow-x-hidden min-w-0 ${
        pathname === "/messages"
          ? "pt-20 md:pt-24 px-0 sm:px-4 lg:px-8 pb-16 md:pb-8 max-w-7xl mx-auto"
          : "pt-24 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12 max-w-7xl mx-auto"
      }`}>
        {children}
      </main>
    </div>
  );
}
