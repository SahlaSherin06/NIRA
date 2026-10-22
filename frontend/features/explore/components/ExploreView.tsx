"use client";
import { PremiumLimitModal } from "@/components/ui/PremiumLimitModal";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/auth.queries";
import { ExploreFeed } from "@/features/explore/components/ExploreFeed";
import { Recommendation, useInteract } from "@/features/feed/feed.api";
import { exploreKeys } from "@/features/explore/explore.queries";
import { ExploreResponse } from "@/features/explore/explore.api";

// Dynamically import heavy components that are only needed when a modal opens
const ProfileCard = dynamic(() => import("@/features/feed/components/ProfileCard").then(mod => mod.ProfileCard), { ssr: false });
const FloatingActions = dynamic(() => import("@/features/feed/components/FloatingActions").then(mod => mod.FloatingActions), { ssr: false });

/**
 * Component: ExplorePage
 * Renders the UI and handles the internal logic for the Explore Page.
 */
export function ExploreView() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isPremium = session?.user?.subscription?.plan === 'premium';
  const interactMutation = useInteract();

  const [selectedProfile, setSelectedProfile] = useState<Recommendation | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

    const handleInteract = useCallback((action: "like" | "superlike" | "pass" | "block" | "report", reason?: string) => {
    if (!selectedProfile || interactMutation.isPending) return;

    if (action === "superlike" && !isPremium) {
      setShowPremiumModal(true);
      return;
    }


        interactMutation.mutate(
      { targetId: selectedProfile._id, action, reason },
      {
        onError: (err: any) => {
          if (err.response?.status === 403 && (err.response?.data?.message === "LIMIT_REACHED" || err.response?.data?.message === "UPGRADE_REQUIRED")) {
            setShowPremiumModal(true);
          }
        },
        onSuccess: () => {
          queryClient.setQueryData(exploreKeys.all, (oldData: ExploreResponse | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              completeBios: oldData.completeBios.filter(p => p._id !== selectedProfile._id),
              justJoined: oldData.justJoined.filter(p => p._id !== selectedProfile._id),
            };
          });
        }
      }
    );

    setSelectedProfile(null);
  }, [selectedProfile, interactMutation, queryClient, isPremium]);

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
                onSuperLike={() => handleInteract("superlike")} 
                onPass={() => handleInteract("pass")}
                disabled={interactMutation.isPending}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center space-x-3 md:space-x-6 max-w-2xl z-40"
              />
            </div>
          </div>
                </div>
      )}

      {/* Premium Modal */}
      <PremiumLimitModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  );
}