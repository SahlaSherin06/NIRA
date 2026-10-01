"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingData } from "../types";
import { useOnboarding } from "../api/onboardingqueries";
import { Step1Identity } from "./steps/Step1Identity";
import { Step2Roots } from "./steps/Step2Roots";
import { Step3Education } from "./steps/Step3Education";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Personality } from "./steps/Step5Personality";
import { Step6Intentions } from "./steps/Step6Intentions";
import { Step7Preferences } from "./steps/Step7Preferences";
import { Step8Photos } from "./steps/Step8Photos";
import { Step9Promises } from "./steps/Step9Promises";

const DRAFT_KEY = "nira_onboarding_draft";

/**
 * Component: OnboardingWizard
 * The master controller for the onboarding flow.
 * Manages the current step state, local storage drafting, and final API submission.
 */
export function OnboardingWizard() {
  const router = useRouter();
  const { submitOnboarding } = useOnboarding();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mount, load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.data) setFormData(parsed.data);
        if (parsed.step) setCurrentStep(parsed.step);
      } catch (e) {
        console.error("Failed to parse onboarding draft", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleNext = async (stepData: Partial<OnboardingData>) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);
    
    if (currentStep < 9) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Save draft to localStorage
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: nextStep, data: newData }));
      window.scrollTo(0, 0);
    } else {
      try {
        setIsSubmitting(true);
        await submitOnboarding.mutateAsync(newData);
        // Remove draft after successful completion
        localStorage.removeItem(DRAFT_KEY);
        // Redirect to home
        router.replace("/home");
      } catch (error) {
        console.error("Failed to submit profile", error);
        alert("Failed to submit profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Save draft with previous step
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: prevStep, data: formData }));
      window.scrollTo(0, 0);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Identity data={formData} onNext={handleNext} />;
      case 2: return <Step2Roots data={formData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <Step3Education data={formData} onNext={handleNext} onBack={handleBack} />;
      case 4: return <Step4Lifestyle data={formData} onNext={handleNext} onBack={handleBack} />;
      case 5: return <Step5Personality data={formData} onNext={handleNext} onBack={handleBack} />;
      case 6: return <Step6Intentions data={formData} onNext={handleNext} onBack={handleBack} />;
      case 7: return <Step7Preferences data={formData} onNext={handleNext} onBack={handleBack} />;
      case 8: return <Step8Photos data={formData} onNext={handleNext} onBack={handleBack} />;
      case 9: return <Step9Promises data={formData} onNext={handleNext} onBack={handleBack} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  // Prevent rendering until localStorage is read to avoid hydration mismatch
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9F7F6] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-brand-900 font-medium">Resuming your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F6] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(139,66,83,0.1)] border border-white relative overflow-hidden w-full max-w-4xl mx-auto min-h-[500px]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <div 
            className="h-full bg-brand-900 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          ></div>
        </div>
        <div className="mt-4">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

