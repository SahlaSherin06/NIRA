"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/api/authqueries";
import {
  ShieldCheck, 
  Lock, 
  HeartHandshake, 
  MessageCircleHeart,
  UserPlus,
  SlidersHorizontal,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Heart,
  Star,
  Camera,
  LineChart,
  UserCheck
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";

/**
 * Component: LandingPage
 * Renders the UI and handles the internal logic for the Landing Page.
 */
export default function LandingPage() {
  const { data: session } = useSession();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-cream text-dark font-sans selection:bg-brand-100 selection:text-brand-900">
      <LandingNavbar />

      <div className="pt-20">
        
        {/* ===== HERO SECTION ===== */}
        <section id="hero" className="px-8 pt-6 lg:pt-10 pb-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8 lg:mt-12">
            <div data-reveal="up" className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-900 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Intentionally designed for meaningful matrimony</span>
            </div>
            
            <h1 data-reveal="up" className="text-5xl md:text-6xl font-serif text-brand-900 leading-[1.1]">
              Meet Someone Who <br/>
              <span className="italic text-brand-800 font-light">Shares Your Future</span>
            </h1>
            
            <p data-reveal="up" className="text-lg text-gray-600 max-w-md leading-relaxed">
              A modern, purpose-driven matrimony platform designed to connect you with 
              individuals seeking authentic, serious, and lasting relationships based on shared values.
            </p>

            <div data-reveal="fade" className="flex items-center space-x-4 pt-4">
              {session ? (
                <Link href="/home" className="px-8 py-3.5 rounded-full bg-brand-900 text-white font-medium hover:bg-brand-800 transition shadow-lg shadow-brand-900/20 hover:-translate-y-1 transform">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register" className="px-8 py-3.5 rounded-full bg-brand-900 text-white font-medium hover:bg-brand-800 transition shadow-lg shadow-brand-900/20 hover:-translate-y-1 transform">
                  Create Profile
                </Link>
              )}
              <a href="#how-it-works" onClick={(e) => scrollTo(e, 'how-it-works')} className="px-8 py-3.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">
                How NIRA Works
              </a>
            </div>

            <div data-reveal="fade" className="pt-8 flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100",
                  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=100&h=100"
                ].map((src, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-cream overflow-hidden">
                    <img src={src} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">10,000+ Success Stories</div>
                <div className="text-gray-500">Trusted by families worldwide for serious intent</div>
              </div>
            </div>
          </div>

          <div className="relative" data-reveal="scale">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative">
              <img 
                src="https://i.pinimg.com/736x/12/de/53/12de53b0f03b84a4484a031e65209587.jpg" 
                alt="Married Couple" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-900 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">100% Verified Profiles</h4>
                    <p className="text-xs text-gray-600 mt-1">Every member goes through strict identity and photo verification.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW NIRA WORKS (SWAPPED TO BE BEFORE PRIVACY) ===== */}
        <section id="how-it-works" className="py-24 bg-brand-50/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 data-reveal="up" className="text-sm font-bold tracking-widest uppercase text-brand-900 mb-2">How It Works</h2>
            <h3 data-reveal="up" className="text-3xl md:text-4xl font-serif text-gray-900 mb-16">Four simple steps to your lifelong partnership</h3>
            
            <div className="grid md:grid-cols-4 gap-8 relative" data-reveal-group>
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-brand-100 -z-10"></div>
              
              {[
                { icon: UserPlus, num: "1", title: "Create Your Profile", desc: "Tell us about yourself, your background, your family values, and what matters most to your future." },
                { icon: SlidersHorizontal, num: "2", title: "Set Preferences", desc: "Choose what you're looking for in a partner. Define your non-negotiables for a filtered feed." },
                { icon: Sparkles, num: "3", title: "Discover Matches", desc: "Explore curated profiles highly compatible with your specific criteria and intent." },
                { icon: MessageSquare, num: "4", title: "Start Conversations", desc: "Connect securely with mutual matches and see where the journey takes you." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-50 relative z-10 hover:-translate-y-1 transition duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md border-4 border-white">
                    {step.num}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed text-center">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TRUST / PRIVACY SECTION (SWAPPED TO BE AFTER HOW IT WORKS) ===== */}
        <section id="privacy-safety" className="bg-white py-24 border-y border-gray-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 data-reveal="up" className="text-sm font-bold tracking-widest uppercase text-brand-900 mb-2">Privacy & Safety</h2>
              <h3 data-reveal="up" className="text-3xl md:text-4xl font-serif text-gray-900">A secure environment built on trust and respect</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" data-reveal-group>
              {[
                { icon: ShieldCheck, title: "Verified Profiles", desc: "Every single user undergoes rigorous government ID & live photo verification before they can message anyone." },
                { icon: Lock, title: "Total Privacy Control", desc: "You decide who sees your photos. Keep them blurred publicly and reveal them only to your mutual matches." },
                { icon: HeartHandshake, title: "Intentional Connections", desc: "Our algorithm actively filters out casual daters, ensuring you only meet those with serious marriage intent." },
                { icon: MessageCircleHeart, title: "Secure Conversations", desc: "Connect securely through our built-in encrypted messaging system without revealing your phone number." },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-brand-50 border border-brand-100/50 hover:shadow-lg transition duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-6 text-brand-900">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY NIRA IS UNIQUE ===== */}
        <section id="why-nira" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 data-reveal="up" className="text-sm font-bold tracking-widest uppercase text-brand-900 mb-2">The NIRA Difference</h2>
              <h3 data-reveal="up" className="text-3xl md:text-4xl font-serif text-gray-900">Why choose NIRA for your search</h3>
              <p data-reveal="up" className="mt-4 text-gray-600 max-w-2xl mx-auto">We've stripped away the noise of casual dating apps to build a platform dedicated entirely to serious, long-term commitment.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6" data-reveal-group>
              {[
                { icon: LineChart, title: "Compatibility-Focused Matching", desc: "We don't just show you people nearby. We analyze core values, religious beliefs, and long-term life goals to suggest truly compatible matches." },
                { icon: Camera, title: "Rich, Intentional Profiles", desc: "Say goodbye to empty bios. Our extensive onboarding ensures every profile is detailed, giving you deep insights before you ever say hello." },
                { icon: UserCheck, title: "Active Moderation", desc: "Our human moderation team actively reviews reports and suspicious behavior to keep the community safe and free from fake accounts." },
                { icon: Heart, title: "Designed for Marriage", desc: "Every feature, from our 'Intent' badges to our family-involvement settings, is purpose-built to facilitate the journey to marriage." },
              ].map((feature, i) => (
                <div key={i} className="flex gap-6 p-8 rounded-2xl bg-cream border border-gray-100 hover:shadow-md transition">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-900">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section id="success-stories" className="py-24 bg-brand-50/30 border-y border-brand-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 data-reveal="up" className="text-sm font-bold tracking-widest uppercase text-brand-900 mb-2">Success Stories</h2>
              <h3 data-reveal="up" className="text-3xl md:text-4xl font-serif text-gray-900">Hear from couples who found love through NIRA</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8" data-reveal-group>
              {[
                { 
                  name: "Layla & Ahmed", 
                  date: "Married December 2024", 
                  img: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=150&h=150", 
                  quote: "We were both exhausted by apps that didn't prioritize commitment. On NIRA, we immediately knew we had the same fundamental goals for life. Two months of talking, and the families met!" 
                },
                { 
                  name: "Sarah & Zain", 
                  date: "Engaged May 2025", 
                  img: "https://images.unsplash.com/photo-1623091410901-00e2d268901f?auto=format&fit=crop&q=80&w=150&h=150", 
                  quote: "The deep profile questions on NIRA sparked our first conversation. We skipped the small talk and discussed our values from day one. I couldn't have found a better partner." 
                }
              ].map((story, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                  <div className="flex text-brand-900 mb-4">
                    <Star className="w-4 h-4 fill-brand-900" />
                    <Star className="w-4 h-4 fill-brand-900" />
                    <Star className="w-4 h-4 fill-brand-900" />
                    <Star className="w-4 h-4 fill-brand-900" />
                    <Star className="w-4 h-4 fill-brand-900" />
                  </div>
                  <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">"{story.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-100" />
                    <div>
                      <div className="font-bold text-gray-900">{story.name}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{story.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <section className="bg-brand-900 py-24 text-center">
          <div className="max-w-3xl mx-auto px-8">
            <Heart data-reveal="scale" className="w-12 h-12 text-brand-100 mx-auto mb-6 fill-brand-100" />
            <h2 data-reveal="up" className="text-4xl md:text-5xl font-serif text-white mb-6">Your story could start here.</h2>
            <p data-reveal="up" className="text-brand-100 text-lg mb-10 max-w-xl mx-auto opacity-90">
              Join thousands of singles who are finding meaningful, lifelong connections in a secure and trusted community.
            </p>
            <div data-reveal="fade">
              {session ? (
                <Link href="/home" className="inline-block px-10 py-4 bg-white text-brand-900 font-bold rounded-full hover:bg-cream transition shadow-xl hover:-translate-y-1">
                  Go to Dashboard &rarr;
                </Link>
              ) : (
                <Link href="/register" className="inline-block px-10 py-4 bg-white text-brand-900 font-bold rounded-full hover:bg-cream transition shadow-xl hover:-translate-y-1">
                  Create Your Profile &rarr;
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
      </div>
      <LandingFooter />
    </div>
  );
}
