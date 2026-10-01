"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Component: Providers
 * Renders the UI and handles the internal logic for the Providers.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy";
  console.log("Google Client ID in Providers:", clientId);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

