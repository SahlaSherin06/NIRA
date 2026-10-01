"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Heart, ShieldCheck, Sparkles, Search, Filter, X } from "lucide-react";
import { useExploreData } from "../api/explorequeries";
import { Recommendation } from "@/features/feed/api/feedapi";

interface ExploreFeedProps {
  onProfileClick: (profile: Recommendation) => void;
}

const HorizontalScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="flex space-x-6 overflow-x-auto pb-8 pt-2 custom-scrollbar snap-x snap-mandatory">
      {children}
    </div>
  </div>
);

const ProfileCardSmall = ({ profile, type, onClick }: { profile: Recommendation, type: 'complete' | 'new', onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-72 md:w-80 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-center border border-gray-50 group cursor-pointer relative"
    >
      
      {/* Top badges */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        {type === 'complete' && (
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 rounded-full flex items-center shadow-sm">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
            100% Bio Complete
          </span>
        )}
        {type === 'new' && (
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Name overlay */}
        <div className="absolute bottom-4 left-5 text-white">
          <h3 className="text-xl font-bold font-serif shadow-sm flex items-center">
            {profile.name}, {new Date().getFullYear() - new Date(profile.profile.dob).getFullYear()}
            <ShieldCheck className="w-4 h-4 ml-2 text-yellow-400" />
          </h3>
          <div className="flex items-center text-white/90 text-sm font-medium mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {profile.profile.city} • {profile.profile.profession}
          </div>
        </div>
      </div>

      <div className="p-5 bg-white">
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {profile.profile.bio || `Passionate about creating spaces that breathe. Avid reader of contemporary fiction.`}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="px-2 py-1 bg-brand-50 text-brand-900 text-[10px] font-bold uppercase tracking-wider rounded-md">
            {profile.profile.diet}
          </span>
          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
            {profile.profile.smoke === "Non-smoker" ? "Non-Smoker" : profile.profile.smoke}
          </span>
        </div>

        <div className="pt-4 border-t border-gray-50">
          <button className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 text-sm font-bold rounded-xl transition-colors">
            View Bio
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: ExploreFeed
 * Renders the UI and handles the internal logic for the Explore Feed.
 */
export function ExploreFeed({ onProfileClick }: ExploreFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query to prevent spamming the backend
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); // 400ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data, isLoading } = useExploreData(debouncedQuery ? { q: debouncedQuery } : {});

  const clearFilters = () => {
    setSearchQuery("");
  };

  const renderContent = () => {
    if (isLoading || !data) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const totalResults = data.completeBios.length + data.justJoined.length;

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

        {/* Complete Bios Section */}
        {data.completeBios.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-gray-900">Profiles with Complete Bios</h2>
                <p className="text-sm text-gray-500 mt-1">Detailed insights into lifestyle, values, and family background.</p>
              </div>
              <div className="hidden md:flex space-x-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-50 hover:text-brand-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-50 hover:text-brand-900 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <HorizontalScrollContainer>
              {data.completeBios.map((profile) => (
                <ProfileCardSmall 
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
        {data.justJoined.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-gray-900 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
                  Just Joined NIRA
                </h2>
                <p className="text-sm text-gray-500 mt-1">Freshly onboarded members looking for meaningful connections.</p>
              </div>
              <div className="hidden md:flex space-x-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-50 hover:text-brand-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-50 hover:text-brand-900 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <HorizontalScrollContainer>
              {data.justJoined.map((profile) => (
                <ProfileCardSmall 
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
    <div className="flex-1 w-full relative">
      
      {/* Top Search Bar (Live Filter) */}
      <div className="mb-10 bg-white p-3 md:p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center relative z-20">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, city, profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-11 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-brand-900/20 placeholder-gray-400 transition-shadow"
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
      </div>

      {renderContent()}

    </div>
  );
}
