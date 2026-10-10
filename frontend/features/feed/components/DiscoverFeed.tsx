import { PremiumLimitModal } from "@/components/ui/PremiumLimitModal";
import React, { useState, useEffect } from "react";
import { useRecommendations, useInteract, Recommendation } from "../feed.api";
import { useSession } from "@/features/auth/auth.queries";
import { ProfileCard } from "./ProfileCard";
import { FloatingActions } from "./FloatingActions";
import { Heart } from "lucide-react";

export function DiscoverFeed() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecommendations();
  const interactMutation = useInteract();
    const { data: session } = useSession();
    const isPremium = session?.user?.subscription?.plan === 'premium';
  // Local queue of profiles to show
  const [queue, setQueue] = useState<Recommendation[]>([]);
  const [loadedPages, setLoadedPages] = useState<number>(0);

  // Tracking if a card is animating out
  const [animatingOut, setAnimatingOut] = useState<"like" | "superlike" | "pass" | "block" | "report" | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // Bottom scroll detection hooks (must be called unconditionally)
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // Append new pages to the queue
  useEffect(() => {
    if (data && data.pages.length > loadedPages) {
      const newPages = data.pages.slice(loadedPages);
      const newProfiles = newPages.flatMap(p => p.recommendations);
      setQueue(prev => [...prev, ...newProfiles]);
      setLoadedPages(data.pages.length);
    }
  }, [data, loadedPages]);

  // Trigger fetchNextPage when queue gets low
  useEffect(() => {
    if (queue.length <= 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [queue.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const currentProfile = queue[0];

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -40px 0px" } // trigger right before it leaves viewport
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [currentProfile]); // re-run if profile changes

          const handleInteract = React.useCallback(async (action: "like" | "superlike" | "pass" | "block" | "report", reason?: string) => {
        if (animatingOut || interactMutation.isPending) return;
  
        if (action === "superlike" && !isPremium) {
          setShowPremiumModal(true);
          return;
        }
  
      setAnimatingOut(action);
      
      interactMutation.mutate(
        { targetId: currentProfile._id, action, reason },
        {
          onSuccess: () => {
            setTimeout(() => {
              setQueue((prev) => prev.slice(1));
              setAnimatingOut(null);
              setIsEntering(true);
              setTimeout(() => setIsEntering(false), 50);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
          },
          onError: (err: any) => {
            setAnimatingOut(null);
            if (err.response?.status === 403) {
              setShowPremiumModal(true);
            }
          }
        }
      );
    }, [animatingOut, interactMutation, currentProfile, isEntering, isPremium]);

    if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh]">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Finding your perfect match...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[85vh] text-red-500">
        <p>Failed to load recommendations. Please try again later.</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] text-center px-6">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-brand-900 fill-brand-900/20" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">You're all caught up!</h2>
        <p className="text-gray-500 max-w-sm">We've shown you all the available profiles matching your preferences. Check back later for more.</p>
      </div>
    );
  }

    return (
    <div className="relative flex flex-col items-center justify-start min-h-screen w-full max-w-2xl mx-auto pt-8 pb-16 px-4 md:px-0">
      <div className="w-full relative">
        <div 
          className={`w-full transition-all duration-500 ease-out origin-bottom animate-slide-up-fade
            ${isEntering ? 'opacity-0' : 'opacity-100'}
            ${animatingOut === 'like' ? 'translate-x-[120%] rotate-12 opacity-0 scale-95' : ''}
            ${(animatingOut === 'pass' || animatingOut === 'block' || animatingOut === 'report') ? '-translate-x-[120%] -rotate-12 opacity-0 scale-95' : ''}
          `}
        >
          <ProfileCard user={currentProfile} onAction={(action, reason) => handleInteract(action, reason)} />
        </div>
        
        {/* Invisible marker to detect bottom of card */}
        <div ref={bottomRef} className="h-10 w-full absolute bottom-4 pointer-events-none" />

                  <FloatingActions 
            onLike={() => handleInteract("like")} 
            onSuperLike={() => handleInteract("superlike")} 
            onPass={() => handleInteract("pass")}
            disabled={!!animatingOut || interactMutation.isPending}
            className={isAtBottom ? "absolute bottom-6 left-0 flex justify-center space-x-3 md:space-x-6" : "fixed bottom-10 left-1/2 -translate-x-1/2 flex justify-center space-x-3 md:space-x-6 max-w-2xl z-50"}
          />
      
      {/* Premium Modal */}
        <PremiumLimitModal 
          isOpen={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)} 
        />
      </div>
    </div>
  );
}