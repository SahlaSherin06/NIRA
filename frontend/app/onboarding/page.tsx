"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import IntentionsStep from "@/components/onboarding/IntentionsStep";
import BasicInfoStep from "@/components/onboarding/BasicInfoStep";
import PhotosStep from "@/components/onboarding/PhotosStep";
import AboutYouStep from "@/components/onboarding/AboutYouStep";
import EducationStep from "@/components/onboarding/EducationStep";
import ProfessionStep from "@/components/onboarding/ProfessionStep";
import LifestyleStep from "@/components/onboarding/LifestyleStep";
import FamilyStep from "@/components/onboarding/FamilyStep";
import ReligionStep from "@/components/onboarding/ReligionStep";
import PartnerPreferencesStep from "@/components/onboarding/PartnerPreferencesStep";
import PreviewStep from "@/components/onboarding/PreviewStep";
import CompleteStep from "@/components/onboarding/CompleteStep";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 13;

  // 1. Fetch Draft from Database on Load
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile`, {
          credentials: "include"
        });
        
        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (res.ok) {
          const profile = await res.json();
          if (profile.isCompleted) {
            router.push("/home");
            return;
          }
          // Resume where they left off
          if (profile.currentStep > 1) {
            setStep(profile.currentStep);
          }
        }
      } catch (error) {
        console.error("Failed to load draft", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraft();
  }, [router]);

  // 2. Auto-save Draft when clicking Next
  const nextStep = async (stepData: any) => {
    const nextStepNumber = step + 1;
    setStep(nextStepNumber);
    window.scrollTo(0, 0);

    // If it's the final step (CompleteStep handles it), we don't need to patch here
    if (nextStepNumber === 13) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...stepData,
          currentStep: nextStepNumber,
        }),
      });
    } catch (error) {
      console.error("Failed to save draft", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcfaf8] to-[#f4ebe6] flex items-center justify-center text-[#7a303f]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#7a303f] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcfaf8] to-[#f4ebe6] flex flex-col items-center py-12 px-4 sm:px-6 relative">
      
      {/* Decorative background elements contained securely so they don't expand the page scroll height */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-[#7a303f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-[#7a303f]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Progress Bar Container (Hide on complete step) */}
      {step < 13 && (
        <div className="w-full max-w-2xl mb-10 relative z-10" data-reveal="fade">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Step {step} of {totalSteps - 1}</span>
            <span className="text-sm font-bold text-[#7a303f] bg-[#7a303f]/10 px-3 py-1 rounded-full">{Math.round((step / (totalSteps - 1)) * 100)}%</span>
          </div>
          <div className="h-3 bg-white/60 backdrop-blur-sm shadow-inner rounded-full w-full overflow-hidden border border-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-[#7a303f] to-[#a34458] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(122,48,63,0.3)]"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Dynamic Step Component */}
      <div 
        key={step}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-8 md:p-14 rounded-[2rem] shadow-xl shadow-[#7a303f]/5 border border-white/50 min-h-[450px] relative z-10"
      >
        {step === 1 && <WelcomeStep onNext={() => nextStep({})} />}
        {step === 2 && <IntentionsStep onNext={(data) => nextStep(data)} />}
        {step === 3 && <BasicInfoStep onNext={(data) => nextStep(data)} />}
        {step === 4 && <PhotosStep onNext={(data) => nextStep(data)} />}
        {step === 5 && <AboutYouStep onNext={(data) => nextStep(data)} />}
        {step === 6 && <EducationStep onNext={(data) => nextStep(data)} />}
        {step === 7 && <ProfessionStep onNext={(data) => nextStep(data)} />}
        {step === 8 && <LifestyleStep onNext={(data) => nextStep(data)} />}
        {step === 9 && <FamilyStep onNext={(data) => nextStep(data)} />}
        {step === 10 && <ReligionStep onNext={(data) => nextStep(data)} />}
        {step === 11 && <PartnerPreferencesStep onNext={(data) => nextStep(data)} />}
        {step === 12 && <PreviewStep onNext={() => nextStep({})} />}
        {step === 13 && <CompleteStep />}
      </div>

    </div>
  );
}
