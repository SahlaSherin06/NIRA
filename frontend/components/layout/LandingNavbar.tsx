"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/auth.queries";
import { Menu, X, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";

/**
 * Component: LandingNavbar
 * Renders the UI and handles the internal logic for the Landing Navbar.
 */
export function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, signOut } = useSession();

  // Scroll and active section listeners
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const navLinks = [
    { name: "How it Works", id: "how-it-works" },
    { name: "Privacy & Safety", id: "privacy-safety" },
    { name: "Why NIRA", id: "why-nira" },
    { name: "Success Stories", id: "success-stories" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-100/60 py-3 sm:py-3.5"
          : "bg-white/70 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none py-3.5 sm:py-5 border-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-50 border border-brand-100/70 flex items-center justify-center group-hover:bg-brand-100 group-hover:scale-105 transition-all duration-300 shadow-xs">
            <span className="text-brand-900 font-serif font-bold text-lg sm:text-xl leading-none">
              N
            </span>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-brand-900 font-serif">
            NIRA
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => scrollTo(e, link.id)}
              className={`relative py-2 transition-colors duration-300 ${
                activeSection === link.id
                  ? "text-brand-900 font-semibold"
                  : "text-gray-500 hover:text-brand-900"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-900 rounded-full transition-transform duration-300 origin-left ${
                  activeSection === link.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          ))}
        </div>

        {/* Action Buttons (Desktop) & Mobile Hamburger */}
        <div className="flex items-center space-x-3">
          {session ? (
            <>
              {/* Desktop Logout & Dashboard */}
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => signOut.mutate()}
                  disabled={signOut.isPending}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-700 px-3 py-2 rounded-full hover:bg-red-50/60 transition-all duration-200"
                  title="Log out of NIRA"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                  <span>{signOut.isPending ? "Logging out..." : "Log Out"}</span>
                </button>

                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-brand-900 text-white hover:bg-brand-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 shrink-0"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Desktop Login & Get Started */}
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-brand-900 px-3 py-2 rounded-full hover:bg-brand-50/50 transition-colors"
                >
                  Log In
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full bg-brand-900 text-white hover:bg-brand-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 shrink-0"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:text-brand-900 hover:bg-brand-50/80 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-brand-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay to dim the hero section underneath */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs -z-10 md:hidden"
          />

          <div className="md:hidden px-4 pt-3 pb-6 border-t border-brand-100/50 bg-white/95 backdrop-blur-xl shadow-2xl rounded-b-3xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollTo(e, link.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "bg-brand-50 text-brand-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-brand-900"
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="text-gray-300">›</span>
                </a>
              ))}
            </div>

            {/* Mobile Bottom Actions */}
            <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
              {session ? (
                <>
                  <Link
                    href="/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-900 text-white font-semibold text-sm shadow-sm hover:bg-brand-800 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut.mutate();
                    }}
                    disabled={signOut.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-100/50 font-medium text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{signOut.isPending ? "Logging out..." : "Log Out"}</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-brand-900 text-white font-semibold text-sm hover:bg-brand-800 transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
