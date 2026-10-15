import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Component: AuthLayout
 * Renders the UI and handles the internal logic for the Auth Layout.
 */
export function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F6] font-sans selection:bg-brand-100 selection:text-brand-900 relative overflow-x-hidden overflow-y-auto">
      {/* Soft background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <header className="w-full p-6 absolute top-0 left-0 flex justify-between items-center z-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen py-10 px-4">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

