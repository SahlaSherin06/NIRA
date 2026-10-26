"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Smile, Sparkles, UserPen, Palette } from "lucide-react";
import { OnboardingData } from "../../types";

const step5Schema = z.object({
  personality: z.array(z.string()).min(1, "Select at least 1 personality trait").max(5, "You can select up to 5 traits"),
  interests: z.array(z.string()).min(3, "Select at least 3 interests").max(10, "You can select up to 10 interests"),
  bio: z.string().min(20, "Please write a bit more about yourself (min 20 characters)").max(500, "Keep it under 500 characters"),
});

type Step5Values = z.infer<typeof step5Schema>;

const personalityTraits = [
  "Introvert", "Extrovert", "Ambivert", "Funny", "Logical", 
  "Emotional", "Ambitious", "Spontaneous", "Organized", 
  "Creative", "Adventurous", "Homebody", "Empathetic", "Direct"
];

const interestOptions = [
  "Traveling", "Reading", "Fitness / Gym", "Movies & TV", "Music", 
  "Tech & Gadgets", "Foodie", "Cooking", "Photography", "Art & Design", 
  "Sports", "Gaming", "Nature", "Business", "Volunteering", "Fashion", "Pets"
];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  onSaveDraft?: (data: Partial<OnboardingData>) => void;
}

/**
 * Component: Step5Personality
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 * @param props.onSaveDraft - Callback to auto-save field values to MongoDB draft
 */
export function Step5Personality({ data, onNext, onBack, onSaveDraft }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step5Values>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      personality: data.personality || [],
      interests: data.interests || [],
      bio: data.bio || "",
    }
  });

  const wPersonality = watch("personality");
  const wInterests = watch("interests");
  const wBio = watch("bio");

  useEffect(() => {
    const subscription = watch((val) => {
      onSaveDraft?.(val as Partial<OnboardingData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onSaveDraft]);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.gsap-item');
      gsap.set(elements, { opacity: 0, y: 30, scale: 0.95 });
      
      gsap.to(elements, { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.15, 
        ease: "back.out(1.2)",
        clearProps: "transform,scale"
      });
    }
  }, []);

  const onSubmit = (values: Step5Values) => {
    onNext(values);
  };

  const toggleArrayItem = (field: "personality" | "interests", value: string, currentArray: string[], maxLimit: number) => {
    if (currentArray.includes(value)) {
      setValue(field, currentArray.filter(i => i !== value), { shouldValidate: true });
    } else {
      if (currentArray.length < maxLimit) {
        setValue(field, [...currentArray, value], { shouldValidate: true });
      }
    }
  };

  const getPillClasses = (isSelected: boolean, isDisabled: boolean) => 
    `px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
      isSelected 
        ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/20 transform scale-[1.02]" 
        : isDisabled 
          ? "bg-gray-100/50 text-gray-400 border-gray-200/50 cursor-not-allowed"
          : "bg-white text-gray-600 border-gray-200 hover:border-brand-900/40 hover:bg-brand-50/50"
    }`;

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-6 sm:space-y-8 max-w-3xl mx-auto px-0 sm:px-2 pb-10">
      <div className="text-center mb-8 sm:mb-10 gsap-item">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-brand-100">
          <Smile className="w-7 h-7 sm:w-8 sm:h-8 text-brand-900" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-brand-900 mb-1.5 sm:mb-2">Personality & Interests</h2>
        <p className="text-sm sm:text-base text-gray-500">What makes you unique? Express yourself.</p>
      </div>

      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        <div className="w-full min-w-0 bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 sm:space-y-5 gsap-item">
          <div className="flex justify-between items-end mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-bold text-gray-800 ml-1 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> My Personality 
            </label>
            <span className="text-[11px] sm:text-xs font-medium text-brand-900/70 bg-brand-50 px-2.5 sm:px-3 py-1 rounded-full">
              {wPersonality.length} / 5 selected
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {personalityTraits.map((trait) => {
              const isSelected = wPersonality.includes(trait);
              const isDisabled = !isSelected && wPersonality.length >= 5;
              return (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleArrayItem("personality", trait, wPersonality, 5)}
                  disabled={isDisabled}
                  className={getPillClasses(isSelected, isDisabled)}
                >
                  {trait}
                </button>
              );
            })}
          </div>
          {errors.personality && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.personality.message}</p>}
        </div>

        <div className="bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 sm:space-y-5 gsap-item">
          <div className="flex justify-between items-end mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-bold text-gray-800 ml-1 flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> My Interests
            </label>
            <span className="text-[11px] sm:text-xs font-medium text-brand-900/70 bg-brand-50 px-2.5 sm:px-3 py-1 rounded-full">
              {wInterests.length} / 10 selected
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {interestOptions.map((interest) => {
              const isSelected = wInterests.includes(interest);
              const isDisabled = !isSelected && wInterests.length >= 10;
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleArrayItem("interests", interest, wInterests, 10)}
                  disabled={isDisabled}
                  className={getPillClasses(isSelected, isDisabled)}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          {errors.interests && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.interests.message}</p>}
        </div>

        <div className="bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 sm:space-y-5 gsap-item">
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 ml-1 flex items-center gap-2">
            <UserPen className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> About Me (Bio)
          </label>
          <p className="text-xs text-gray-500 ml-1 mb-3 sm:mb-4">Write a short bio. Mention your goals, what you value, or what you're looking for in a partner.</p>
          
          <div className="relative">
            <textarea
              {...register("bio")}
              rows={5}
              placeholder="E.g., I'm a software engineer who loves weekend hiking trips..."
              className="w-full p-4 sm:p-5 bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-900/10 focus:border-brand-900/30 transition-all text-gray-800 shadow-xs sm:shadow-sm font-medium text-sm sm:text-base resize-none"
            ></textarea>
            <span className={`absolute bottom-4 right-4 text-xs font-bold ${wBio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {wBio.length}/500
            </span>
          </div>
          {errors.bio && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.bio.message}</p>}
        </div>

      </div>

      <div className="flex gap-3 sm:gap-4 pt-6 sm:pt-10 gsap-item">
        <button type="button" onClick={onBack} className="w-1/3 py-3.5 sm:py-4 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
          Back
        </button>
        <button type="submit" className="flex-1 py-3.5 sm:py-4 px-4 rounded-full text-xs sm:text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-md shadow-brand-900/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
          Continue
        </button>
      </div>
    </form>
  );
}


