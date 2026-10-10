"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Search, MessageCircle, Bell, User, Globe, LogOut, Compass, Crown } from "lucide-react";
import { useSession } from "@/features/auth/auth.queries";
import { useNotifications } from "@/features/notifications/notification.queries";
import { useMyProfile } from "@/features/profile/profile.queries";

/**
 * Component: DashboardNavbar
 * Renders the UI and handles the internal logic for the Dashboard Navbar.
 */
export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  const { data: notifications } = useNotifications();
  const { data: myProfile } = useMyProfile();

  const hasUnread = notifications?.some(n => !n.isRead);

  const navLinks = [
    { name: "Discover", href: "/home", icon: Heart },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Matches", href: "/matches", icon: Search },
    { name: "Messages", href: "/messages", icon: MessageCircle },
    { name: "Premium", href: "/premium", icon: Crown },
  ];

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    router.push("/");
  };

  return (
    <>
      <header 
        className="w-full bg-white/85 backdrop-blur-lg border-b border-white/40 fixed top-0 left-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/home" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors duration-300">
                <span className="text-brand-900 font-serif font-bold text-lg leading-none">N</span>
              </div>
              <span className="text-xl font-bold font-serif tracking-tight text-brand-900">NIRA</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 lg:px-4 py-2 rounded-full text-[14px] lg:text-[15px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-brand-900 text-white shadow-md shadow-brand-900/20"
                      : "text-gray-600 hover:text-brand-900 hover:bg-brand-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-1 lg:mr-2 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-5">
            
            <Link 
              href="/notifications" 
              className="p-2.5 rounded-full text-gray-400 bg-white hover:text-brand-900 hover:bg-brand-50 transition-colors relative shadow-sm border border-gray-100"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            
            <Link 
              href="/profile" 
              className="rounded-full text-gray-400 bg-white hover:text-brand-900 hover:bg-brand-50 transition-colors shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center p-1"
              title="My Profile"
            >
              {myProfile?.profile?.mainPhoto ? (
                <img src={myProfile.profile.mainPhoto} alt="My Profile" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </Link>

            <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>

            {/* Back to Landing Page / Website */}
            <Link 
              href="/" 
              className="hidden md:flex items-center p-2 lg:px-4 lg:py-2 text-sm font-semibold text-gray-600 hover:text-brand-900 bg-white hover:bg-brand-50 rounded-full transition-colors border border-gray-200 shadow-sm"
              title="Website"
            >
              <Globe className="w-4 h-4 lg:mr-2 text-gray-400" />
              <span className="hidden lg:inline">Website</span>
            </Link>

            <button 
              onClick={handleSignOut}
              className="hidden md:flex items-center p-2 lg:px-4 lg:py-2 text-sm font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-full transition-colors border border-red-100 shadow-sm"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Navigation (Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 z-50 pb-safe">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-brand-900" : "text-gray-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-brand-50" : ""}`} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
