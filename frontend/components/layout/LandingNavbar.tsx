"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/auth.queries";

/**
 * Component: LandingNavbar
 * Renders the UI and handles the internal logic for the Landing Navbar.
 */
export function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { data: session, signOut } = useSession();

  // Scroll and active section listeners
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
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

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-50 py-3' : 'bg-transparent py-5 border-transparent'}`}>
        <div className="flex items-center justify-between px-8 max-w-7xl mx-auto transition-all duration-500">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors duration-300">
              <span className="text-brand-900 font-serif font-bold text-lg leading-none">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-900">NIRA</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollTo(e, link.id)}
                className={`relative py-2 transition-colors duration-300 ${
                  activeSection === link.id ? "text-brand-900" : "text-gray-500 hover:text-brand-900"
                }`}
              >
                {link.name}
                {/* Smooth Underline indicator using CSS scale */}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-900 rounded-t-md transition-transform duration-300 origin-left ${activeSection === link.id ? 'scale-x-100' : 'scale-x-0'}`}></span>
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <button
                  onClick={() => signOut.mutate()}
                  disabled={signOut.isPending}
                  className="text-sm font-medium text-gray-600 hover:text-brand-900 transition-colors duration-300"
                >
                  {signOut.isPending ? "Logging out..." : "Log Out"}
                </button>
                <Link href="/home" className="text-sm font-medium px-5 py-2.5 rounded-full bg-brand-900 text-white hover:bg-brand-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-900 transition-colors duration-300">
                  Log In
                </Link>
                <Link href="/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-brand-900 text-white hover:bg-brand-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
  );
}
