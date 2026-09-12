"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Basic route protection
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
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
      <p className="mb-4">You are logged in as {session.user.name} ({session.user.email}).</p>
      
      <button 
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
