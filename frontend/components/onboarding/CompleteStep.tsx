import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteStep() {
  const router = useRouter();

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const completeOnboarding = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            isCompleted: true,
          }),
        });

        if (!res.ok) {
          if (isMounted) setError("Failed to save. Please try again.");
          return;
        }

        // Add a slight delay for animation UX
        setTimeout(() => {
          if (isMounted) {
            // Force full page reload to bypass Next.js aggressive redirect caching!
            window.location.href = "/home";
          }
        }, 1500);
      } catch (error) {
        console.error("Failed to complete onboarding", error);
        if (isMounted) setError("Network error. Please try again.");
      }
    };

    completeOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
      {error ? (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">!</div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-500 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#7a303f] text-white rounded-full font-semibold hover:bg-[#602531]"
          >
            Retry
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-[#7a303f] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="fade">Generating Matches...</h2>
          <p className="text-gray-500 text-lg" data-reveal="fade">Taking you to your dashboard</p>
        </>
      )}
    </div>
  );
}
