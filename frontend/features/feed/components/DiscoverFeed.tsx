"use client";

import { PremiumLimitModal } from "@/components/ui/PremiumLimitModal";
import React, { useState, useEffect } from "react";
import { useRecommendations, useInteract, Recommendation, FeedFilterParams } from "../feed.api";
import { useSession } from "@/features/auth/auth.queries";
import { ProfileCard } from "./ProfileCard";
import { FloatingActions } from "./FloatingActions";
import { Heart, SlidersHorizontal } from "lucide-react";
import { PartnerFilterPanel } from "./PartnerFilterPanel";
import { api } from "@/lib/axios";
import { useMyProfile, profileKeys } from "@/features/profile/profile.queries";
import { useQueryClient } from "@tanstack/react-query";

const FEED_FILTERS_STORAGE_KEY = "nira_feed_filters";

function getSavedFeedFilters(): FeedFilterParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FEED_FILTERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

export function DiscoverFeed() {
  const queryClient = useQueryClient();
  const { data: myProfile } = useMyProfile();
  const [filters, setFilters] = useState<FeedFilterParams>(getSavedFeedFilters);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Immediately hydrate filters from localStorage on client mount BEFORE queries run
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }

    const local = getSavedFeedFilters();
    if (Object.keys(local).length > 0) {
      setFilters(local);
    }
    setIsHydrated(true);
  }, []);

  // Sync saved preferences from MongoDB on page load/refresh if localStorage was empty
  useEffect(() => {
    if (myProfile?.preferences && !hasInitializedFilters) {
      const p = myProfile.preferences as any;
      const mongoSaved = p.savedFilters || {};
      const localFilters = getSavedFeedFilters();
      const hasLocalFilters = Object.keys(localFilters).length > 0;

      if (!hasLocalFilters && Object.keys(mongoSaved).length > 0) {
        setFilters(mongoSaved);
        try {
          localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(mongoSaved));
        } catch (_) {}
      }
      setHasInitializedFilters(true);
    }
  }, [myProfile, hasInitializedFilters]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecommendations(filters, { enabled: isHydrated });
  const interactMutation = useInteract();
  const { data: session } = useSession();
  const isPremium = session?.user?.subscription?.plan === 'premium';

  // Local queue of profiles to show
  const [queue, setQueue] = useState<Recommendation[]>([]);
  const [loadedPages, setLoadedPages] = useState<number>(0);

  // Whenever filters change, reset queue and loadedPages so that new filtered data replaces the queue cleanly
  useEffect(() => {
    setQueue([]);
    setLoadedPages(0);
  }, [filters]);

  // Tracking if a card is animating out
  const [animatingOut, setAnimatingOut] = useState<"like" | "superlike" | "pass" | "block" | "report" | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Bottom scroll detection hooks (must be called unconditionally)
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // Apply filters and persist to localStorage & MongoDB
  const handleApplyFilters = async (newFilters: FeedFilterParams) => {
    setFilters(newFilters);
    setQueue([]);
    setLoadedPages(0);

    // Save immediately to localStorage
    try {
      localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    } catch (e) {
      console.warn("Failed to save filters to localStorage", e);
    }

    // Persist to user's saved preferences in MongoDB
    try {
      await api.put("/profile/me", { preferences: { ...newFilters, savedFilters: newFilters } });
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    } catch (e) {
      console.error("Failed to auto-save preferences to MongoDB", e);
    }
  };

  // Clear filters and wipe from localStorage & MongoDB
  const handleClearAllFilters = async () => {
    setFilters({});
    setQueue([]);
    setLoadedPages(0);

    try {
      localStorage.removeItem(FEED_FILTERS_STORAGE_KEY);
    } catch (_) {}

    try {
      await api.put("/profile/me", { preferences: { savedFilters: {} } });
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    } catch (e) {
      console.error("Failed to clear preferences in MongoDB", e);
    }
  };

  // Append new pages to the queue
  useEffect(() => {
    if (data && data.pages.length > loadedPages) {
      const newPages = data.pages.slice(loadedPages);
      const newProfiles = newPages.flatMap(p => p.recommendations);
      setQueue(prev => (loadedPages === 0 ? newProfiles : [...prev, ...newProfiles]));
      setLoadedPages(data.pages.length);
    }
  }, [data, loadedPages]);

  // Preload upcoming profiles' photos into browser cache so they appear with 0ms visual delay
  useEffect(() => {
    if (queue.length > 1) {
      queue.slice(1, 4).forEach((item) => {
        if (item.profile?.mainPhoto) {
          const img = new Image();
          img.src = item.profile.mainPhoto;
        }
        if (item.profile?.galleryPhotos && item.profile.galleryPhotos.length > 0) {
          const gImg = new Image();
          gImg.src = item.profile.galleryPhotos[0];
        }
      });
    }
  }, [queue]);

  // Trigger fetchNextPage ahead of time when queue drops below 5
  useEffect(() => {
    if (queue.length <= 5 && hasNextPage && !isFetchingNextPage) {
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
    // Only debounce if a swipe animation is actively running
    if (animatingOut) return;

    if (action === "superlike" && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (!currentProfile) return;

    const profileToInteract = currentProfile;
    setAnimatingOut(action);

    // 1. Fire interaction to server in the background (optimistic)
    interactMutation.mutate(
      { targetId: profileToInteract._id, action, reason },
      {
        onError: (err: any) => {
          if (err?.response?.status === 403) {
            setShowPremiumModal(true);
            // Re-insert profile if blocked by daily limits
            setQueue((prev) => [profileToInteract, ...prev]);
          }
        }
      }
    );

    // 2. Snappy 200ms swipe: immediately advance to next profile without waiting for network!
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setQueue((prev) => prev.slice(1));
      setAnimatingOut(null);
    }, 200);
  }, [animatingOut, currentProfile, isPremium, interactMutation]);

  const activeFilterCount = Object.keys(filters).filter(k => {
    const v = (filters as any)[k];
    return v !== undefined && v !== "Doesn't matter" && v !== "No preference" && v !== "Anywhere" && (!Array.isArray(v) || v.length > 0);
  }).length;

  return (
    <div className="w-full max-w-7xl mx-auto pt-0 pb-16 px-2 sm:px-4 overflow-x-clip">
      {/* Top Header: Visible on both Desktop & Mobile */}
      <div className="flex items-center justify-between mb-5 px-1 sm:px-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-gray-900 tracking-tight">Discover</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Find your ideal match</p>
        </div>
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-brand-900 font-semibold text-xs hover:bg-brand-50 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-900" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-900 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Two-Column Layout on Laptop: Filter Panel on LEFT, Feed on RIGHT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-full">
        {/* Left Column: Filter Section on Laptop/Desktop - Sized cleanly to viewport */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 h-[calc(100vh-7.5rem)] max-h-[860px] rounded-3xl">
          <PartnerFilterPanel
            initialFilters={filters}
            onApply={handleApplyFilters}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Right / Center: Profile Cards Swiper Area */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center min-h-[80vh] overflow-x-clip">
          {(!isHydrated || isLoading) && queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] w-full">
              <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">Finding your perfect match...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-[70vh] text-red-500">
              <p>Failed to load recommendations. Please try again later.</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-brand-900 fill-brand-900/20" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">You're all caught up!</h2>
              <p className="text-gray-500 max-w-sm">We've shown you all the available profiles matching your filters. Try adjusting your preferences on the left.</p>
            </div>
          ) : (
            <div className="w-full relative overflow-x-clip">
              <div 
                className={`w-full transition-all duration-200 ease-out origin-bottom
                  ${animatingOut === 'like' ? 'translate-x-[110%] rotate-6 opacity-0 scale-95 pointer-events-none' : ''}
                  ${animatingOut === 'superlike' ? '-translate-y-[110%] opacity-0 scale-95 pointer-events-none' : ''}
                  ${(animatingOut === 'pass' || animatingOut === 'block' || animatingOut === 'report') ? '-translate-x-[110%] -rotate-6 opacity-0 scale-95 pointer-events-none' : ''}
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
                className={
                  isAtBottom 
                    ? "absolute bottom-20 md:bottom-6 left-0 w-full flex justify-center space-x-3 md:space-x-6 z-40" 
                    : "fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-10 left-1/2 -translate-x-1/2 lg:left-[calc(50%+12rem)] w-[calc(100%-2rem)] max-w-xl flex justify-center space-x-3 md:space-x-6 z-40"
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Responsive Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileFilterOpen(false)} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          />
          {/* Slide-over Drawer */}
          <div className="relative ml-auto w-full max-w-md h-full bg-[#FAF8F7] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <PartnerFilterPanel 
              initialFilters={filters} 
              onApply={handleApplyFilters} 
              onClearAll={handleClearAllFilters}
              onClose={() => setIsMobileFilterOpen(false)} 
              isMobile={true} 
            />
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