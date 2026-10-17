"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Crown,
  Globe,
  LogOut,
} from "lucide-react";
import { useSession } from "@/features/auth/auth.queries";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useSession();

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
    },
    {
      name: "Reports & Moderation",
      href: "/admin/reports",
      icon: ShieldAlert,
    },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
      icon: Crown,
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
        {/* Brand Header (Static - Not clickable) */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            {/* Logo Monogram - No Border */}
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
              <span className="text-brand-900 font-serif font-bold text-xl leading-none">N</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-serif tracking-tight text-brand-900">
                  NIRA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-900 border border-brand-200/60 font-sans">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Management Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 font-sans">
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-brand-900 text-white shadow-md shadow-brand-900/20"
                    : "text-gray-600 hover:text-brand-900 hover:bg-brand-50/60"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3.5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-brand-900"
                  }`}
                />
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/60">
          {/* Back to Landing Page Button */}
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-brand-50 hover:text-brand-900 border border-gray-200 hover:border-brand-200/80 transition-all cursor-pointer shadow-2xs mb-2"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>Back to Landing Page</span>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut.mutate()}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50/60 hover:bg-red-100/80 border border-red-100 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
