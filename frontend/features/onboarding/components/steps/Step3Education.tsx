"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { GraduationCap, Briefcase, Wallet, Edit3, X } from "lucide-react";
import { OnboardingData } from "../../types";
import { CustomSelect } from "@/components/ui/CustomSelect";

const step3Schema = z.object({
  educationLevel: z.string().min(1, "Education level is required"),
  educationLevelOther: z.string().optional(),
  
  profession: z.string().min(1, "Profession is required"),
  professionOther: z.string().optional(),
  
  annualIncome: z.string().min(1, "Annual income is required"),
}).superRefine((data, ctx) => {
  if (data.educationLevel === "Other" && !data.educationLevelOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["educationLevelOther"] });
  }
  if (data.profession === "Other" && !data.professionOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["professionOther"] });
  }
});

type Step3Values = z.infer<typeof step3Schema>;

const educationLevels = [
  "High School", "Non-Degree", "Diploma", "Undergraduate", "Bachelors", "Masters", "Doctorate", "Other"
];

const professions = [
  "Software Engineer", "Doctor / Medical Professional", "Teacher / Professor", 
  "Business / Entrepreneur", "Finance / Accounting", "Engineer", 
  "Government Service", "Student", "Not Working", "Other"
];

const incomeRanges = [
  "Student / No Income", "Under ₹3 Lakhs", "₹3 - 5 Lakhs", "₹5 - 10 Lakhs", 
  "₹10 - 20 Lakhs", "₹20 - 50 Lakhs", "₹50+ Lakhs", "Prefer not to say"
];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step3Education
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step3Education({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      educationLevel: educationLevels.includes(data.educationLevel || "") ? data.educationLevel : (data.educationLevel ? "Other" : ""),
      educationLevelOther: educationLevels.includes(data.educationLevel || "") ? "" : data.educationLevel,
      
      profession: professions.includes(data.profession || "") ? data.profession : (data.profession ? "Other" : ""),
      professionOther: professions.includes(data.profession || "") ? "" : data.profession,
      
      annualIncome: data.annualIncome || "",
    }
  });

  const wEducation = watch("educationLevel");
  const wProfession = watch("profession");
  const wAnnualIncome = watch("annualIncome");

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

  const onSubmit = (values: Step3Values) => {
    const finalData: Partial<OnboardingData> = {
      ...data,
      educationLevel: values.educationLevel === "Other" ? values.educationLevelOther : values.educationLevel,
      profession: values.profession === "Other" ? values.professionOther : values.profession,
      annualIncome: values.annualIncome,
    };
    onNext(finalData);
  };

  const handleLettersOnly = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, '');
  };

  const inputClasses = "w-full pl-10 pr-8 sm:pl-12 sm:pr-10 py-3.5 sm:py-4 bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-900/10 focus:border-brand-900/30 transition-all text-gray-800 shadow-xs sm:shadow-sm appearance-none font-medium text-sm sm:text-base";
  const labelClasses = "block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 ml-1";
  const iconClasses = "absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-900/60 pointer-events-none z-10";

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-6 sm:space-y-8 max-w-3xl mx-auto px-0 sm:px-2 pb-10">
      <div className="text-center mb-8 sm:mb-10 gsap-item">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-brand-100">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-brand-900" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-brand-900 mb-1.5 sm:mb-2">Education & Career</h2>
        <p className="text-sm sm:text-base text-gray-500">Tell us about your educational background and profession.</p>
      </div>

      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        <div className="w-full min-w-0 bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 sm:space-y-6 gsap-item">
          <div>
            <label className={labelClasses}>Highest Education Level</label>
            {wEducation !== "Other" ? (
              <div className="relative">
                <GraduationCap className={iconClasses} />
                <CustomSelect
                  value={wEducation || ""}
                  onChange={(val) => setValue("educationLevel", val, { shouldValidate: true })}
                  options={educationLevels}
                  placeholder="Select Education Level"
                  className={inputClasses}
                />
                <input type="hidden" {...register("educationLevel")} />
                {errors.educationLevel && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.educationLevel.message}</p>}
              </div>
            ) : (
              <div className="relative animate-in fade-in zoom-in-95 duration-200">
                <Edit3 className={iconClasses} />
                <input type="text" placeholder="Type your degree (e.g. B.Tech)..." {...register("educationLevelOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                <button type="button" onClick={() => { setValue("educationLevel", ""); setValue("educationLevelOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                  <X className="w-5 h-5" />
                </button>
                {errors.educationLevelOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.educationLevelOther.message}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="w-full min-w-0 bg-white sm:bg-white/40 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 sm:space-y-6 gsap-item">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={labelClasses}>Current Profession</label>
              {wProfession !== "Other" ? (
                <div className="relative">
                  <Briefcase className={iconClasses} />
                  <CustomSelect
                    value={wProfession || ""}
                    onChange={(val) => setValue("profession", val, { shouldValidate: true })}
                    options={professions}
                    placeholder="Select Profession"
                    className={inputClasses}
                  />
                  <input type="hidden" {...register("profession")} />
                  {errors.profession && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.profession.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type your profession..." {...register("professionOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("profession", ""); setValue("professionOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.professionOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.professionOther.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Annual Income</label>
              <div className="relative">
                <Wallet className={iconClasses} />
                <CustomSelect
                  value={wAnnualIncome || ""}
                  onChange={(val) => setValue("annualIncome", val, { shouldValidate: true })}
                  options={incomeRanges}
                  placeholder="Select Annual Income"
                  className={inputClasses}
                />
                <input type="hidden" {...register("annualIncome")} />
              </div>
              {errors.annualIncome && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.annualIncome.message}</p>}
            </div>
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


