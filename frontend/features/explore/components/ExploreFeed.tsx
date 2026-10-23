"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin,
  Crown, Heart, ShieldCheck, Sparkles, Search, SlidersHorizontal, X, Lock } from "lucide-react";
import { useExploreData } from "../explore.queries";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.queries";
import { Recommendation, FeedFilterParams } from "@/features/feed/feed.api";
import { PartnerFilterPanel } from "@/features/feed/components/PartnerFilterPanel";
import { api } from "@/lib/axios";

import { useMyProfile, profileKeys } from "@/features/profile/profile.queries";
import { useQueryClient } from "@tanstack/react-query";

interface ExploreFeedProps {
  onProfileClick: (profile: Recommendation) => void;
}

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

const HorizontalScrollContainer = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Mouse drag support for desktop
  const isDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);

  const checkScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
    }
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
  };

  return (
    <div className="relative group w-full max-w-full overflow-hidden">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-md items-center justify-center text-gray-700 hover:text-brand-900 hover:bg-white hover:scale-105 transition-all border border-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ WebkitOverflowScrolling: "touch" }}
        className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 pt-2 no-scrollbar md:custom-scrollbar w-full max-w-full overscroll-x-contain select-none cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-md items-center justify-center text-gray-700 hover:text-brand-900 hover:bg-white hover:scale-105 transition-all border border-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const ProfileCardSmall = React.memo(({ profile, type, onClick, isPremium }: { profile: Recommendation, type: 'complete' | 'new', onClick: () => void, isPremium: boolean }) => {
  const router = useRouter();
  const isBlurred = profile.profile?.photoPrivacy === "Blurred" && !isPremium;
  const touchStartPos = React.useRef({ x: 0, y: 0 });
  const isDragging = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) {
      isDragging.current = true;
    }
  };

  const handleClick = () => {
    if (isDragging.current) {
      return;
    }
    onClick();
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      className="flex-shrink-0 w-64 sm:w-72 md:w-80 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-50 group cursor-pointer relative select-none"
    >
      
      {/* Top badges */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        {type === 'complete' ? (
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 rounded-full flex items-center shadow-sm">
            <span className="w-2 h-2 bg-brand-900 rounded-full mr-2"></span>
            Recommended
          </span>
        ) : (
          <span className="px-3 py-1 bg-brand-50/90 backdrop-blur text-xs font-semibold text-brand-900 rounded-full flex items-center shadow-sm">
            <Sparkles className="w-3 h-3 mr-1 text-brand-500" />
            Just Joined
          </span>
        )}
      </div>

      <div className="relative w-full h-80 overflow-hidden bg-gray-100">
        <img 
          src={profile.profile.mainPhoto} 
          alt={profile.name} 
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none select-none ${isBlurred ? 'blur-2xl scale-110 grayscale-[30%]' : 'group-hover:scale-105'}`}
        />
        {isBlurred && (
          <div onClick={(e) => { e.stopPropagation(); router.push('/premium'); }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 cursor-pointer hover:bg-black/40 transition-colors">
            <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <p className="text-white font-bold text-sm drop-shadow-md px-4 text-center">Private Photo</p>
            <button className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md hover:bg-yellow-300">Upgrade to view</button>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Name overlay */}
        <div className="absolute bottom-4 left-5 text-white">
          <h3 className="text-xl font-bold font-serif shadow-sm flex items-center">
            {profile.name}, {new Date().getFullYear() - new Date(profile.profile.dob).getFullYear()}
              {profile.subscription?.plan === 'premium' && (
                <div className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 p-0.5 rounded-full shadow-lg" title="Premium Member">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
          </h3>
          <div className="flex items-center text-xs text-white/80 mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>{profile.profile.city}, {profile.profile.country}</span>
          </div>
        </div>
      </div>

      {/* Quick details */}
      <div className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
            {profile.profile.educationLevel}
          </span>
          <span className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
            {profile.profile.profession}
          </span>
          <span className="text-xs bg-brand-50/50 border border-brand-100/50 text-brand-900 px-2.5 py-1 rounded-lg font-medium">
            {profile.profile.diet}
          </span>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
          {profile.profile.bio || "Looking to build a meaningful connection based on shared values and trust."}
        </p>
      </div>

    </div>
  );
});

ProfileCardSmall.displayName = 'ProfileCardSmall';

export function ExploreFeed({ onProfileClick }: ExploreFeedProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: myProfile } = useMyProfile();
  const isPremium = session?.user?.subscription?.plan === 'premium';
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<FeedFilterParams>(getSavedFeedFilters);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Immediately hydrate filters from localStorage on client mount BEFORE queries run
  React.useEffect(() => {
    const local = getSavedFeedFilters();
    if (Object.keys(local).length > 0) {
      setFilters(local);
    }
    setIsHydrated(true);
  }, []);

  // Sync saved preferences from MongoDB on page load/refresh if localStorage was empty
  React.useEffect(() => {
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

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data, isLoading } = useExploreData(
    {
      q: debouncedQuery || undefined,
      ...filters
    },
    { enabled: isHydrated }
  );

  const handleApplyFilters = async (newFilters: FeedFilterParams) => {
    setFilters(newFilters);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      } catch (e) {
        console.warn("Failed to save filters to localStorage", e);
      }
    }

    try {
      await api.put("/profile/me", { preferences: { ...newFilters, savedFilters: newFilters } });
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    } catch (e) {
      console.error("Failed to auto-save preferences", e);
    }
  };

  const handleClearAllFilters = async () => {
    setFilters({});
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(FEED_FILTERS_STORAGE_KEY);
      } catch (_) {}
    }

    try {
      await api.put("/profile/me", { preferences: { savedFilters: {} } });
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    } catch (e) {
      console.error("Failed to clear saved filters from MongoDB", e);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  const activeFilterCount = Object.keys(filters).filter(k => {
    const v = (filters as any)[k];
    return v !== undefined && v !== "Doesn't matter" && v !== "No preference" && v !== "Anywhere" && (!Array.isArray(v) || v.length > 0);
  }).length;

  const renderContent = () => {
    if (isLoading || !data) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const completeBios = data.pages.flatMap(page => page.completeBios);
    const justJoined = data.pages.flatMap(page => page.justJoined);
    const totalResults = completeBios.length + justJoined.length;

    return (
      <>
        <div className="flex items-center space-x-3 mb-8">
          <button className="flex-shrink-0 px-5 py-2.5 bg-brand-50 text-brand-900 text-sm font-bold rounded-full flex items-center shadow-sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {debouncedQuery ? 'Search Results' : 'All Matches'} ({totalResults})
          </button>
        </div>

        {totalResults === 0 && (
          <div className="w-full bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mb-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">No Profiles Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">We couldn't find any matches matching your exact search criteria. Try adjusting your filters.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-brand-50 text-brand-900 font-bold text-sm rounded-xl hover:bg-brand-100 transition-colors shadow-sm">Clear Filters</button>
          </div>
        )}

        {/* Recommended Section */}
        {completeBios.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-gray-900">Recommended For You</h2>
                <p className="text-sm text-gray-500 mt-1">Curated profiles matching your preferences and lifestyle.</p>
              </div>
            </div>

            <HorizontalScrollContainer>
              {completeBios.map((profile) => (
                <ProfileCardSmall isPremium={isPremium}
                  key={profile._id} 
                  profile={profile} 
                  type="complete" 
                  onClick={() => onProfileClick(profile)}
                />
              ))}
            </HorizontalScrollContainer>
          </div>
        )}

        {/* Just Joined Section */}
        {justJoined.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-gray-900 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
                  Just Joined NIRA
                </h2>
                <p className="text-sm text-gray-500 mt-1">Freshly onboarded members looking for meaningful connections.</p>
              </div>
            </div>

            <HorizontalScrollContainer>
              {justJoined.map((profile) => (
                <ProfileCardSmall isPremium={isPremium}
                  key={profile._id} 
                  profile={profile} 
                  type="new" 
                  onClick={() => onProfileClick(profile)} 
                />
              ))}
            </HorizontalScrollContainer>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex-1 w-full max-w-full overflow-hidden relative">
      {/* Top Search Bar & Mobile Filter Trigger */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex-1 bg-white p-2.5 md:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, city, profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-11 pr-11 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-brand-900/20 placeholder-gray-400 transition-shadow"
          />
          {searchQuery && (
            <button 
              onClick={clearFilters}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-brand-900 font-semibold text-sm hover:bg-brand-50 transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-900" />
          <span>Filters</span>
        </button>
      </div>

      {/* Main Two-Column Layout on Laptop: Filter on LEFT, Content on RIGHT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-full overflow-hidden">
        {/* Left Column: Filter Section on Laptop/Desktop - Extending to Just Joined NIRA cards */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 h-[1320px] overflow-hidden rounded-3xl">
          <PartnerFilterPanel
            initialFilters={filters}
            onApply={handleApplyFilters}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Right: Explore Feed Content */}
        <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
          {renderContent()}
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
    </div>
  );
}
