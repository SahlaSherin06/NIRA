"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.queries";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === "sahlasherins86+admin@gmail.com";

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#FCFAF8] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-900 mb-3" />
        <p className="text-sm font-semibold text-brand-900 font-serif">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FCFAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          This portal is reserved for authorized NIRA platform administrators only.
        </p>
        <Link
          href="/home"
          className="px-6 py-3 rounded-full bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md"
        >
          Return to Member App
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8] flex text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <AdminNavbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
