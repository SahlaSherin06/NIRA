import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans selection:bg-brand-100 selection:text-brand-900">
      <header className="w-full p-6 absolute top-0 left-0 flex justify-between items-center">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
