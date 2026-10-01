import Link from "next/link";
import { Heart } from "lucide-react";

/**
 * Component: DashboardFooter
 * Renders the UI and handles the internal logic for the Dashboard Footer.
 */
export function DashboardFooter() {
  return (
    <footer className="bg-dark text-gray-400 py-16 text-sm w-full mt-auto">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 rounded bg-[#4a3b3b] flex items-center justify-center">
              <span className="text-white font-serif font-bold text-sm leading-none">N</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NIRA</span>
          </div>
          <p className="mb-4 max-w-sm leading-relaxed">
            A modern, inclusive matrimony platform designed to connect people based on shared values, deep compatibility, and serious future goals.
          </p>
          <p>&copy; {new Date().getFullYear()} NIRA Premium Matrimony. All rights reserved.</p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Discover</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/home" className="hover:text-white transition">Matches</Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-white transition">Explore</Link>
            </li>
            <li>
              <Link href="/safety" className="hover:text-white transition">Safety & Trust</Link>
            </li>
            <li>
              <Link href="/success-stories" className="hover:text-white transition">Success Stories</Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            </li>
            <li>
              <Link href="/guidelines" className="hover:text-white transition">Community Guidelines</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
