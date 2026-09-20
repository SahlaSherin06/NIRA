"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending, signOut } = useSession();

  // Basic route protection
  useEffect(() => {
    // Wait until React Query finishes checking the token
    if (isPending) return;

    // If query finished but no session (token invalid/expired), redirect to login
    if (!session) {
      localStorage.removeItem("nira_access_token");
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to NIRA Home!</h1>
      <p className="mb-4">You are logged in as {session?.user?.name} ({session?.user?.email}).</p>
      
      <button 
        onClick={async () => {
          await signOut.mutateAsync();
          router.push("/login");
        }}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
