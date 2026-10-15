"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Users,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/features/auth/auth.queries";
import { useAdminStats } from "../../admin.queries";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();
  const { data: session, signOut } = useSession();
  const { data: stats } = useAdminStats();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes("/admin/users")) return "User Management";
    if (pathname.includes("/admin/reports")) return "Reports & Moderation";
    if (pathname.includes("/admin/subscriptions")) return "Subscriptions";
    return "Dashboard";
  };

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "admin@nira.app";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Page Title */}
        <h1 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Notifications & Attractive Admin Profile */}
      <div className="flex items-center space-x-3">
        {/* Moderation Alerts */}
        <Link
          href="/admin/reports"
          className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Moderation & Safety Alerts"
        >
          <Bell className="w-4 h-4" />
          {stats?.reportsCount && stats.reportsCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          ) : null}
        </Link>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`flex items-center space-x-2.5 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-xl border transition-all cursor-pointer ${
              profileOpen
                ? "bg-gray-50 border-gray-200 shadow-2xs"
                : "border-transparent hover:border-gray-200 hover:bg-gray-50/80"
            }`}
          >
            {/* Avatar matching brand palette */}
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center font-bold text-xs font-sans shadow-2xs">
              {userInitials}
            </div>

            {/* Profile Info */}
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold font-sans text-gray-900 block truncate max-w-[130px]">
                {userName}
              </span>
              <span className="text-[10px] text-gray-400 block font-medium font-sans">
                Console Admin
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180 text-gray-700" : ""
              }`}
            />
          </button>

          {/* Interactive Profile Popover Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center font-bold text-sm font-sans shadow-2xs">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold font-sans text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate font-sans">
                      {userEmail}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-50 text-brand-900 border border-brand-100 font-sans">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="py-1 px-1.5 space-y-0.5">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium font-sans text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />
                  <span>Dashboard Overview</span>
                </Link>

                <Link
                  href="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium font-sans text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>User Management</span>
                </Link>

                <Link
                  href="/admin/reports"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium font-sans text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-gray-400" />
                  <span>Reports & Safety</span>
                  {stats?.reportsCount && stats.reportsCount > 0 ? (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-sans">
                      {stats.reportsCount}
                    </span>
                  ) : null}
                </Link>

                <Link
                  href="/admin/subscriptions"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium font-sans text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Crown className="w-4 h-4 text-gray-400" />
                  <span>Subscriptions</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 px-1.5 border-t border-gray-100 mt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    signOut.mutate();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold font-sans text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
