"use client";

import React, { useState } from "react";
import { useSession } from "@/features/auth/auth.queries";
import { useDevUpgrade } from "@/features/subscription/subscription.queries";
import { CheckCircle2, Crown, Star, Heart, Infinity, MessageCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MockRazorpayModal } from "@/features/subscription/components/MockRazorpayModal";

export default function PremiumPage() {
  const { data: session } = useSession();
  const devUpgrade = useDevUpgrade();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);

  const isPremium = session?.user?.subscription?.plan === 'premium';

  const handleUpgrade = () => {
    setShowMockPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowMockPayment(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/explore");
    }, 3000);
  };

  if (isPremium && !success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FCF8F9] flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-[#EBD8DB] rounded-full flex items-center justify-center mb-6">
          <Crown className="w-12 h-12 text-[#82444D]" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">You are a Premium Member!</h1>
        <p className="text-gray-600 mb-8 max-w-md text-center">Enjoy your unlimited swipes, super likes, and priority profile placement.</p>
        <Link href="/explore" className="px-8 py-3 bg-[#82444D] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          Go to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FCF8F9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 mb-4 tracking-tight">
            Upgrade to <span className="text-[#82444D] relative inline-block">NIRA Premium<Sparkles className="absolute -top-6 -right-6 w-8 h-8 text-yellow-400 animate-pulse" /></span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get more matches, unlimited swipes, and see who likes you. Take your dating experience to the next level.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-extrabold text-gray-900">Free</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-gray-600">
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-green-500" /> 4 Likes per day</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-green-500" /> Basic Matching</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-green-500" /> Chat with matches</li>
              <li className="flex items-center opacity-50"><span className="w-5 h-5 mr-3 flex items-center justify-center font-bold text-xl">-</span> No Super Likes</li>
              <li className="flex items-center opacity-50"><span className="w-5 h-5 mr-3 flex items-center justify-center font-bold text-xl">-</span> Blurred 'Likes You'</li>
            </ul>
            <button disabled className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-xl font-bold">
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-b from-[#82444D] to-[#5a2e34] rounded-3xl p-8 shadow-xl border border-[#9b5661] flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            
            <h3 className="text-xl font-bold text-white/90 mb-2 flex items-center">
              Premium <Crown className="w-5 h-5 ml-2 text-yellow-400" />
            </h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-extrabold text-white">₹499</span>
              <span className="text-white/70 ml-2">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-white/90">
              <li className="flex items-center"><Infinity className="w-5 h-5 mr-3 text-yellow-400" /> Unlimited Likes</li>
              <li className="flex items-center"><Star className="w-5 h-5 mr-3 text-yellow-400" /> 2 Super Likes a day</li>
              
              <li className="flex items-center"><Heart className="w-5 h-5 mr-3 text-yellow-400" /> See who liked you</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-yellow-400" /> Premium Profile Badge</li>
            </ul>
            
            <button 
              onClick={handleUpgrade}
              disabled={devUpgrade.isPending || success}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex justify-center items-center"
            >
              {devUpgrade.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? "Activated! Redirecting..." : "Upgrade to Premium"}
            </button>
          </div>

        </div>

      </div>
      
      <MockRazorpayModal 
        isOpen={showMockPayment} 
        onClose={() => setShowMockPayment(false)} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}
