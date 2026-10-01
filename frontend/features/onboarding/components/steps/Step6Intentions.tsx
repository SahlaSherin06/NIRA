"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Target, HeartHandshake, Clock, CalendarHeart, Plane } from "lucide-react";
import { OnboardingData } from "../../types";

const step6Schema = z.object({
  whatBringsYouHere: z.string().min(1, "Please tell us what brings you here"),
  knowSomeoneFor: z.string().min(1, "Please select an option"),
  marryWithin: z.string().min(1, "Please select your timeline"),
  moveAbroad: z.string().min(1, "Please select your preference on moving abroad"),
});

type Step6Values = z.infer<typeof step6Schema>;

const intentions = ["Marriage", "Serious Relationship", "Let's see where it goes"];
const knowingDuration = ["1-3 months", "3-6 months", "6-12 months", "1-2 years", "Whenever it feels right"];
const marryTimelines = ["Within 6 months", "1 year", "1-2 years", "2+ years", "No strict timeline"];
const abroadOptions = ["Yes, definitely", "Open to it", "No, prefer staying here"];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step6Intentions
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step6Intentions({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<Step6Values>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      whatBringsYouHere: data.whatBringsYouHere || "",
      knowSomeoneFor: data.knowSomeoneFor || "",
      marryWithin: data.marryWithin || "",
      moveAbroad: data.moveAbroad || "",
    }
  });

  const wWhatBrings = watch("whatBringsYouHere");
  const wKnowFor = watch("knowSomeoneFor");
  const wMarry = watch("marryWithin");
  const wAbroad = watch("moveAbroad");

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

  const onSubmit = (values: Step6Values) => {
    onNext(values);
  };

  const getPillClasses = (isSelected: boolean) => 
    `px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 border ${
      isSelected 
        ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/20 transform scale-[1.02]" 
        : "bg-white text-gray-600 border-gray-200 hover:border-brand-900/40 hover:bg-brand-50/50"
    }`;

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto px-2 pb-10">
      <div className="text-center mb-10 gsap-item">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <Target className="w-8 h-8 text-brand-900" />
        </div>
        <h2 className="text-3xl font-serif text-brand-900 mb-2">Intentions & Goals</h2>
        <p className="text-base text-gray-500">What are you looking for and what's your timeline?</p>
      </div>

      <div className="space-y-6">
        
        {/* Core Intentions */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-brand-900" /> What brings you to NIRA?
            </label>
            <div className="flex flex-wrap gap-3">
              {intentions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("whatBringsYouHere", option, { shouldValidate: true })}
                  className={getPillClasses(wWhatBrings === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.whatBringsYouHere && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.whatBringsYouHere.message}</p>}
          </div>

        </div>

        {/* Timelines */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-900" /> How long do you want to get to know someone?
            </label>
            <div className="flex flex-wrap gap-3">
              {knowingDuration.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("knowSomeoneFor", option, { shouldValidate: true })}
                  className={getPillClasses(wKnowFor === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.knowSomeoneFor && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.knowSomeoneFor.message}</p>}
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-brand-900" /> Ideally, when do you want to get married?
            </label>
            <div className="flex flex-wrap gap-3">
              {marryTimelines.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("marryWithin", option, { shouldValidate: true })}
                  className={getPillClasses(wMarry === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.marryWithin && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.marryWithin.message}</p>}
          </div>

        </div>

        {/* Relocation */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <Plane className="w-5 h-5 text-brand-900" /> Are you willing to relocate or move abroad?
            </label>
            <div className="flex flex-wrap gap-3">
              {abroadOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("moveAbroad", option, { shouldValidate: true })}
                  className={getPillClasses(wAbroad === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.moveAbroad && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{errors.moveAbroad.message}</p>}
          </div>

        </div>

      </div>

      <div className="flex gap-4 pt-10 gsap-item">
        <button type="button" onClick={onBack} className="w-1/3 py-4 px-4 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
          Back
        </button>
        <button type="submit" className="flex-1 py-4 px-4 rounded-full text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-md shadow-brand-900/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
          Continue
        </button>
      </div>
    </form>
  );
}

