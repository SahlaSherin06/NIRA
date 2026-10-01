"use client";

import { MatchesFeed } from "@/features/matches/components/MatchesFeed";

/**
 * Component: MatchesPage
 * Renders the UI and handles the internal logic for the Matches Page.
 */
export default function MatchesPage() {
  return (
    <div className="w-full flex flex-col relative">
      <MatchesFeed />
    </div>
  );
}
