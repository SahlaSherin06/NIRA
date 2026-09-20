"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Clear any lingering URL hashes (like #why-nira) from previous clicks
    // so the page always starts clean
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo(0, 0);
    }

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

    return () => observer.disconnect();
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Calculate exact position, subtract 80px for the sticky navbar height
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
      <nav className="fixed top-0 w-full z-50 bg-cream/90 backdrop-blur-md border-b border-brand-50 transition-all">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 rounded bg-[#e8dfd8] flex items-center justify-center">
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
                className={`relative py-2 transition-colors ${
                  activeSection === link.id ? "text-brand-900" : "text-gray-500 hover:text-brand-900"
                }`}
              >
                {link.name}
                {/* Underline indicator */}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-900 rounded-t-md layout-auto"></span>
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-900 transition">
              Log In
            </Link>
            <Link href="/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-brand-900 text-white hover:bg-brand-800 transition shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
  );
}
