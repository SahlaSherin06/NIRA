"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Heart, UserPlus, MapPin, GraduationCap, Briefcase, Coffee, Star, ArrowUpDown } from "lucide-react";
import { OnboardingData } from "../../types";

const step7Schema = z.object({
  prefAgeMin: z.string().optional(),
  prefAgeMax: z.string().optional(),
  prefHeightMin: z.string().optional(),
  prefHeightMax: z.string().optional(),
  prefMaritalStatus: z.array(z.string()).optional(),
  prefLocation: z.string().optional(),
  prefEducation: z.string().optional(),
  prefProfession: z.string().optional(),
  prefReligion: z.string().optional(),
  prefSmoking: z.string().optional(),
  prefDrinking: z.string().optional(),
  prefDiet: z.string().optional(),
  prefValues: z.array(z.string()).optional(),
});

type Step7Values = z.infer<typeof step7Schema>;

const maritalStatusOptions = ["Doesn't matter", "Never married", "Divorced", "Widowed"];
const locationOptions = ["Anywhere", "Anywhere in India", "Same state", "Same city"];
const educationOptions = ["Doesn't matter", "Higher Secondary", "Diploma", "Bachelor's", "Master's", "Doctorate"];
const professionOptions = ["Doesn't matter", "IT / Software", "Healthcare", "Education", "Business", "Government", "Finance", "Other"];
const lifestyleSmoking = ["Doesn't matter", "Non-smoker", "Smoker"];
const lifestyleDrinking = ["Doesn't matter", "Non-drinker", "Drinks occasionally"];
const dietOptions = ["Doesn't matter", "Vegetarian", "Non-vegetarian", "Vegan"];
const religionOptions = ["Doesn't matter", "Islam", "Hinduism", "Christianity", "Sikhism", "Jainism", "Buddhism"];
const valuesOptions = ["Family-oriented", "Career-oriented", "Open-minded", "Traditional values", "Independent", "Religious/Spiritual", "Other"];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step7Preferences
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step7Preferences({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, watch, setValue } = useForm<Step7Values>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      prefAgeMin: data.prefAgeMin || "22",
      prefAgeMax: data.prefAgeMax || "30",
      prefHeightMin: data.prefHeightMin || "150",
      prefHeightMax: data.prefHeightMax || "180",
      prefMaritalStatus: data.prefMaritalStatus || ["Doesn't matter"],
      prefLocation: data.prefLocation || "Anywhere",
      prefEducation: data.prefEducation || "Doesn't matter",
      prefProfession: data.prefProfession || "Doesn't matter",
      prefReligion: data.prefReligion || "Doesn't matter",
      prefSmoking: data.prefSmoking || "Doesn't matter",
      prefDrinking: data.prefDrinking || "Doesn't matter",
      prefDiet: data.prefDiet || "Doesn't matter",
      prefValues: data.prefValues || [],
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.gsap-item');
      gsap.set(elements, { opacity: 0, y: 30, scale: 0.95 });
      
      gsap.to(elements, { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.1, 
        ease: "back.out(1.2)"
      });
    }
  }, []);

  const onSubmit = (values: Step7Values) => {
    onNext({ ...data, ...values });
  };

  const toggleMultiSelect = (field: "prefMaritalStatus" | "prefValues", value: string, currentArray: string[] = []) => {
    if (value === "Doesn't matter") {
      setValue(field, ["Doesn't matter"], { shouldValidate: true });
      return;
    }
    
    let updated = currentArray.filter(i => i !== "Doesn't matter");
    if (updated.includes(value)) {
      updated = updated.filter(i => i !== value);
    } else {
      updated.push(value);
    }

    if (updated.length === 0 && field === "prefMaritalStatus") {
      updated = ["Doesn't matter"];
    }

    setValue(field, updated, { shouldValidate: true });
  };

  const getPillClasses = (isSelected: boolean) => 
    `px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
      isSelected 
        ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/20 transform scale-[1.02]" 
        : "bg-white text-gray-600 border-gray-200 hover:border-brand-900/40 hover:bg-brand-50/50"
    }`;

  const renderSingleSelect = (field: keyof Step7Values, options: string[]) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setValue(field, option as any, { shouldValidate: true })}
          className={getPillClasses(formValues[field] === option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderMultiSelect = (field: "prefMaritalStatus" | "prefValues", options: string[]) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = (formValues[field] as string[] || []).includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleMultiSelect(field, option, formValues[field] as string[])}
            className={getPillClasses(isSelected)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );

  const inputClasses = "w-full pl-4 pr-4 py-3 bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-900/10 focus:border-brand-900/30 transition-all text-gray-800 shadow-sm appearance-none font-medium text-center";

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto px-2 pb-10">
      <div className="text-center mb-10 gsap-item">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <Heart className="w-8 h-8 text-brand-900" />
        </div>
        <h2 className="text-3xl font-serif text-brand-900 mb-2">Partner Preferences</h2>
        <p className="text-base text-gray-500">What are you looking for? (You can choose "Doesn't matter" for any field)</p>
      </div>

      <div className="space-y-6">
        
        {/* Core & Basic */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-900" /> Age & Height
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <input type="number" {...register("prefAgeMin")} className={inputClasses} placeholder="Min Age" />
                <span className="text-gray-400 font-medium">to</span>
                <input type="number" {...register("prefAgeMax")} className={inputClasses} placeholder="Max Age" />
              </div>
              <div className="flex items-center gap-3">
                <input type="number" {...register("prefHeightMin")} className={inputClasses} placeholder="Min cm" />
                <span className="text-gray-400 font-medium">to</span>
                <input type="number" {...register("prefHeightMax")} className={inputClasses} placeholder="Max cm" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1">Preferred Marital Status</label>
            {renderMultiSelect("prefMaritalStatus", maritalStatusOptions)}
          </div>
        </div>

        {/* Background */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-900" /> Location Preference
            </label>
            {renderSingleSelect("prefLocation", locationOptions)}
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-900" /> Education Preference
            </label>
            {renderSingleSelect("prefEducation", educationOptions)}
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-900" /> Profession / Career
            </label>
            {renderSingleSelect("prefProfession", professionOptions)}
          </div>
        </div>

        {/* Lifestyle & Values */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 gsap-item">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brand-900" /> Lifestyle Compatability
            </label>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Smoking</p>
                {renderSingleSelect("prefSmoking", lifestyleSmoking)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Drinking</p>
                {renderSingleSelect("prefDrinking", lifestyleDrinking)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Food Preference</p>
                {renderSingleSelect("prefDiet", dietOptions)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100/60 pt-6">
            <label className="block text-sm font-bold text-gray-800 mb-4 ml-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-900" /> Religion & Values
            </label>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Religion</p>
                {renderSingleSelect("prefReligion", religionOptions)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Important Values (Select multiple)</p>
                {renderMultiSelect("prefValues", valuesOptions)}
              </div>
            </div>
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

