"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Crown,
  LogOut,
} from "lucide-react";
import { useSession } from "@/features/auth/auth.queries";
import { useAdminStats } from "../../admin.queries";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useSession();
  const { data: stats } = useAdminStats();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      badge: stats?.totalUsers,
    },
    {
      name: "Reports & Moderation",
      href: "/admin/reports",
      icon: ShieldAlert,
      badge: stats?.reportsCount && stats.reportsCount > 0 ? stats.reportsCount : undefined,
      badgeColor: "bg-red-500 text-white",
    },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
      icon: Crown,
      badge: stats?.premiumUsers,
      badgeColor: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 bg-white">
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5 group">
            {/* Same as user-side logo icon */}
            <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors duration-300">
              <span className="text-brand-900 font-serif font-bold text-lg leading-none">N</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold font-serif tracking-tight text-brand-900">
                NIRA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-900 border border-brand-200/60 font-sans">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? "bg-brand-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Footer Section */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          {/* Logout Button */}
          <button
            onClick={() => signOut.mutate()}
            className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
