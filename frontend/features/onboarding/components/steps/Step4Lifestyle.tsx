"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Utensils, Cigarette, Wine, Shirt, HeartPulse } from "lucide-react";
import { OnboardingData } from "../../types";

const step4Schema = z.object({
  diet: z.string().min(1, "Please select your diet preference"),
  dressingSense: z.string().min(1, "Please select your dressing style"),
  smoke: z.string().min(1, "Please answer this question"),
  drink: z.string().min(1, "Please answer this question"),
});

type Step4Values = z.infer<typeof step4Schema>;

const diets = ["Non-Vegetarian", "Vegetarian", "Eggetarian", "Vegan", "Halal Only"];
const dressingStyles = ["Traditional", "Modest", "Casual", "Trendy & Fashionable"];
const smokeDrinkOptions = ["No", "Occasionally", "Yes", "Trying to quit"];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step4Lifestyle
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step4Lifestyle({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      diet: data.diet || "",
      dressingSense: data.dressingSense || "",
      smoke: data.smoke || "",
      drink: data.drink || "",
    }
  });

  const wDiet = watch("diet");
  const wDressing = watch("dressingSense");
  const wSmoke = watch("smoke");
  const wDrink = watch("drink");

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
        ease: "back.out(1.2)"
      });
    }
  }, []);

  const onSubmit = (values: Step4Values) => {
    onNext(values);
  };

  const getPillClasses = (isSelected: boolean) => 
    `px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
      isSelected 
        ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/20 transform scale-[1.02]" 
        : "bg-white text-gray-600 border-gray-200 hover:border-brand-900/40 hover:bg-brand-50/50"
    }`;

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-6 sm:space-y-8 max-w-3xl mx-auto px-0 sm:px-2 pb-10">
      <div className="text-center mb-8 sm:mb-10 gsap-item">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-brand-100">
          <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8 text-brand-900" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-brand-900 mb-1.5 sm:mb-2">Lifestyle & Habits</h2>
        <p className="text-sm sm:text-base text-gray-500">Tell us a bit about your day-to-day lifestyle.</p>
      </div>

      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        <div className="w-full min-w-0 bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 sm:space-y-8 gsap-item">
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 sm:mb-4 ml-1 flex items-center gap-2">
              <Utensils className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> Diet Preference
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {diets.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("diet", option, { shouldValidate: true })}
                  className={getPillClasses(wDiet === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.diet && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.diet.message}</p>}
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 sm:mb-4 ml-1 flex items-center gap-2">
              <Shirt className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> Dressing Sense
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {dressingStyles.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("dressingSense", option, { shouldValidate: true })}
                  className={getPillClasses(wDressing === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.dressingSense && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.dressingSense.message}</p>}
          </div>

        </div>

        <div className="bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 sm:space-y-8 gsap-item">
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 sm:mb-4 ml-1 flex items-center gap-2">
              <Cigarette className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> Do you smoke?
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {smokeDrinkOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("smoke", option, { shouldValidate: true })}
                  className={getPillClasses(wSmoke === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.smoke && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.smoke.message}</p>}
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3 sm:mb-4 ml-1 flex items-center gap-2">
              <Wine className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900" /> Do you drink alcohol?
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {smokeDrinkOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("drink", option, { shouldValidate: true })}
                  className={getPillClasses(wDrink === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.drink && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.drink.message}</p>}
          </div>

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


