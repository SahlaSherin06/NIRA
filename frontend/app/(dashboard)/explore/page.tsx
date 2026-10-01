"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ExploreFeed } from "@/features/explore/components/ExploreFeed";
import { ProfileCard } from "@/features/feed/components/ProfileCard";
import { FloatingActions } from "@/features/feed/components/FloatingActions";
import { Recommendation, useInteract } from "@/features/feed/api/feedapi";
import { exploreKeys } from "@/features/explore/api/explorequeries";
import { ExploreResponse } from "@/features/explore/api/exploreapi";

/**
 * Component: ExplorePage
 * Renders the UI and handles the internal logic for the Explore Page.
 */
export default function ExplorePage() {
  const queryClient = useQueryClient();
  const interactMutation = useInteract();

  // Selected Profile for Modal View
  const [selectedProfile, setSelectedProfile] = useState<Recommendation | null>(null);

  const handleInteract = (action: "like" | "pass" | "block" | "report", reason?: string) => {
    if (!selectedProfile || interactMutation.isPending) return;

    // Mutate backend
    interactMutation.mutate({ targetId: selectedProfile._id, action, reason });

    // Optimistically update the UI to remove this profile from explore lists
    queryClient.setQueryData(exploreKeys.all, (oldData: ExploreResponse | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        completeBios: oldData.completeBios.filter(p => p._id !== selectedProfile._id),
        justJoined: oldData.justJoined.filter(p => p._id !== selectedProfile._id),
      };
    });

    // Close the modal
    setSelectedProfile(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col relative">
      <ExploreFeed onProfileClick={setSelectedProfile} />

      {/* Profile Modal View */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 custom-scrollbar overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-transparent my-auto h-max pt-10 pb-10">
            {/* Close button */}
            <button 
              onClick={() => setSelectedProfile(null)}
              className="absolute top-0 right-0 z-50 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* We reuse the ProfileCard from Discover feed */}
            <div className="w-full bg-transparent relative">
              <ProfileCard 
                user={selectedProfile} 
                onAction={(action, reason) => handleInteract(action, reason)} 
              />
              <FloatingActions 
                onLike={() => handleInteract("like")} 
                onPass={() => handleInteract("pass")}
                disabled={interactMutation.isPending}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
