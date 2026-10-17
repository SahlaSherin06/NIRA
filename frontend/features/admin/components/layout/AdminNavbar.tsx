"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/features/auth/auth.queries";
import { useAdminNotifications } from "../../admin.queries";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: notifData } = useAdminNotifications({ limit: 1 });

  const unreadNotifs = notifData?.counts?.unread || 0;

  const getPageTitle = () => {
    if (pathname.includes("/admin/notifications")) return "Notification Center";
    if (pathname.includes("/admin/users")) return "User Management";
    if (pathname.includes("/admin/reports")) return "Reports & Moderation";
    if (pathname.includes("/admin/subscriptions")) return "Subscriptions";
    return "Dashboard";
  };

  const userName = session?.user?.name || "Admin";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Page Title */}
        <h1 className="text-base sm:text-2xl font-semibold font-stretch-50% tracking-tight text-brand-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Notifications & Profile (Static, No Dropdown) */}
      <div className="flex items-center space-x-3">
        {/* Admin Notifications Center */}
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Admin Profile (Static - No Dropdown, No Console Admin) */}
        <div className="flex items-center space-x-2.5 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1">
          {/* Avatar matching brand palette */}
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center font-bold text-xs font-sans shadow-2xs">
            {userInitials}
          </div>

          {/* Profile Name Only */}
          <span className="hidden sm:block text-xs font-bold font-sans text-gray-900 truncate max-w-[140px]">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
