import React, { useState, useEffect } from "react";
import { useRecommendations, useInteract, Recommendation } from "../api/feedapi";
import { ProfileCard } from "./ProfileCard";
import { FloatingActions } from "./FloatingActions";
import { Heart } from "lucide-react";

export function DiscoverFeed() {
  const { data: recommendations, isLoading, isError } = useRecommendations();
  const interactMutation = useInteract();
  
  // Local queue of profiles to show
  const [queue, setQueue] = useState<Recommendation[]>([]);
  // Tracking if a card is animating out
  const [animatingOut, setAnimatingOut] = useState<"like" | "pass" | "block" | "report" | null>(null);

  // Bottom scroll detection hooks (must be called unconditionally)
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  useEffect(() => {
    if (recommendations) {
      setQueue(recommendations);
    }
  }, [recommendations]);

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

  const handleInteract = async (action: "like" | "pass" | "block" | "report", reason?: string) => {
    if (animatingOut || interactMutation.isPending) return;
    
    setAnimatingOut(action);
    
    try {
      // Record in backend
      interactMutation.mutate({ targetId: currentProfile._id, action, reason });
      
      // Delay to allow CSS animation to play
      setTimeout(() => {
        setQueue((prev) => prev.slice(1));
        setAnimatingOut(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300); // 300ms matches the CSS transition
    } catch (err) {
      console.error(err);
      setAnimatingOut(null);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen w-full max-w-2xl mx-auto pt-8 pb-16 px-4 md:px-0">
      <div 
        className={`w-full relative transition-all duration-300 ease-in-out origin-bottom
          ${animatingOut === 'like' ? 'translate-x-full rotate-12 opacity-0' : ''}
          ${(animatingOut === 'pass' || animatingOut === 'block' || animatingOut === 'report') ? '-translate-x-full -rotate-12 opacity-0' : ''}
        `}
      >
        <ProfileCard user={currentProfile} onAction={(action, reason) => handleInteract(action, reason)} />
        
        {/* Invisible marker to detect bottom of card */}
        <div ref={bottomRef} className="h-10 w-full absolute bottom-4 pointer-events-none" />

        <FloatingActions 
          onLike={() => handleInteract("like")} 
          onPass={() => handleInteract("pass")}
          disabled={!!animatingOut || interactMutation.isPending}
          className={isAtBottom ? "absolute bottom-6 left-0" : "fixed bottom-10 left-1/2 -translate-x-1/2 max-w-2xl"}
        />
      </div>
    </div>
  );
}
