"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingData } from "../types";
import { useOnboarding } from "../onboarding.queries";
import { saveDraftApi, getDraftApi } from "../onboarding.api";
import { Step1Identity } from "./steps/Step1Identity";
import { Step2Roots } from "./steps/Step2Roots";
import { Step3Education } from "./steps/Step3Education";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Personality } from "./steps/Step5Personality";
import { Step6Intentions } from "./steps/Step6Intentions";
import { Step8Photos } from "./steps/Step8Photos";
import { Step9Promises } from "./steps/Step9Promises";

const DRAFT_KEY = "nira_onboarding_draft";

/**
 * Component: OnboardingWizard
 * The master controller for the onboarding flow.
 * Manages the current step state, MongoDB draft persistence, local storage drafting, and final submission.
 */
export function OnboardingWizard() {
  const router = useRouter();
  const { submitOnboarding } = useOnboarding();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // On mount, fetch draft from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function initDraft() {
      try {
        const backendDraft = await getDraftApi();
        if (!isMounted) return;

        if (backendDraft && backendDraft.data && Object.keys(backendDraft.data).length > 0) {
          // Existing draft found in MongoDB
          const step = Math.min(Math.max(backendDraft.step || 1, 1), 8);
          setFormData(backendDraft.data);
          setCurrentStep(step);
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data: backendDraft.data }));
        } else {
          // New user or no draft in MongoDB: fresh start at Step 1
          localStorage.removeItem(DRAFT_KEY);
          setFormData({});
          setCurrentStep(1);
        }
      } catch (err) {
        console.error("Error loading onboarding draft from MongoDB:", err);
        // Fallback to localStorage
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.data) setFormData(parsed.data);
            if (parsed.step) setCurrentStep(Math.min(Math.max(parsed.step, 1), 8));
          } catch (e) {
            console.error("Failed to parse local draft", e);
          }
        }
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    initDraft();
    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Continuous Auto-Save to MongoDB & localStorage on input/selection change
  const handleSaveDraft = useCallback((partialData: Partial<OnboardingData>, stepOverride?: number) => {
    setFormData((prev) => {
      const merged = { ...prev, ...partialData };
      const stepToSave = stepOverride ?? currentStep;

      // Immediate local save
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: stepToSave, data: merged }));
      } catch (e) {
        console.error("LocalStorage save error:", e);
      }

      // Debounced backend MongoDB save (600ms)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveDraftApi({ step: stepToSave, data: merged });
        } catch (err) {
          console.error("Auto-save draft to MongoDB failed:", err);
        }
      }, 600);

      return merged;
    });
  }, [currentStep]);

  const handleNext = async (stepData: Partial<OnboardingData>) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const newData = { ...formData, ...stepData };
    setFormData(newData);
    
    if (currentStep < 8) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Immediately persist next step to localStorage & MongoDB
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: nextStep, data: newData }));
      try {
        await saveDraftApi({ step: nextStep, data: newData });
      } catch (err) {
        console.error("Failed to save draft to MongoDB on Next:", err);
      }
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

  const handleBack = async () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Save draft with previous step
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: prevStep, data: formData }));
      try {
        await saveDraftApi({ step: prevStep, data: formData });
      } catch (err) {
        console.error("Failed to save draft to MongoDB on Back:", err);
      }
      window.scrollTo(0, 0);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Identity data={formData} onNext={handleNext} onSaveDraft={handleSaveDraft} />;
      case 2: return <Step2Roots data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 3: return <Step3Education data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 4: return <Step4Lifestyle data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 5: return <Step5Personality data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 6: return <Step6Intentions data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 7: return <Step8Photos data={formData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 8: return <Step9Promises data={formData} onNext={handleNext} onBack={handleBack} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  // Prevent rendering until draft check completes
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
    <div className="w-full max-w-4xl mx-auto bg-transparent sm:bg-white/80 sm:backdrop-blur-xl px-3 py-6 sm:p-10 md:p-14 rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-[0_20px_60px_-15px_rgba(139,66,83,0.1)] border-0 sm:border border-white relative min-h-screen sm:min-h-[500px] flex flex-col justify-start sm:justify-center">
      <div className="fixed sm:absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gray-200/80 sm:bg-gray-100 z-50">
        <div 
          className="h-full bg-brand-900 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 8) * 100}%` }}
        ></div>
      </div>
      <div className="w-full min-w-0 mt-2 sm:mt-4">
        {renderStep()}
      </div>
    </div>
  );
}
