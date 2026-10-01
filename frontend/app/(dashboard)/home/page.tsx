"use client";

import { DiscoverFeed } from "@/features/feed/components/DiscoverFeed";

/**
 * Component: HomePage
 * Renders the UI and handles the internal logic for the Home Page.
 */
export default function HomePage() {
  return (
    <div className="w-full flex flex-col relative">
      <DiscoverFeed />
    </div>
  );
}
