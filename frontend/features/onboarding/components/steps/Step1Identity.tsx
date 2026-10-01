"use client";

import { useEffect, useRef } from "react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Calendar, Ruler, Weight, Droplet, Heart, Users, Baby, LucideIcon } from "lucide-react";
import { OnboardingData } from "../../types";

const step1Schema = z.object({
  dob: z.string().min(1, "Date of birth is required").refine(val => {
    const dob = new Date(val);
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
    return dob <= minAgeDate;
  }, "You must be at least 18 years old"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  haveChildren: z.string().optional(),
  numberOfChildren: z.string().optional(),
}).refine(data => {
  if (data.maritalStatus !== "Never Married" && !data.haveChildren) return false;
  if (data.haveChildren?.startsWith("Yes") && !data.numberOfChildren) return false;
  return true;
}, { message: "Please specify if you have children", path: ["haveChildren"] });

type Step1Values = z.infer<typeof step1Schema>;

// Static Data
const heights = Array.from({ length: 51 }, (_, i) => {
  const cm = i + 140;
  const inches = Math.round(cm / 2.54);
  return `${cm} cm - ${Math.floor(inches / 12)}'${inches % 12}"`;
});
const weights = Array.from({ length: 91 }, (_, i) => `${i + 40} kg`);
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const maritalStatuses = ["Never Married", "Divorced", "Widowed", "Separated"];
const childrenOptions = ["No", "Yes, living with me", "Yes, not living with me"];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

/**
 * Component: Step1Identity
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step1Identity({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { ...data }
  });

  const [currentMaritalStatus, currentChildren] = watch(["maritalStatus", "haveChildren"]);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll('.gsap-item');
    gsap.fromTo(elements, 
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.2)" }
    );
  }, []);

  const onSubmit = (values: Step1Values) => {
    if (values.maritalStatus === "Never Married") values.haveChildren = "No";
    onNext(values);
  };

  // Reusable UI Components
  const inputClasses = "w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-900/10 focus:border-brand-900/30 transition-all text-gray-800 shadow-sm appearance-none font-medium";

  const Field = ({ label, icon: Icon, error, children }: { label: string, icon: LucideIcon, error?: string, children: React.ReactNode }) => (
    <div className="gsap-item">
      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-900/60 pointer-events-none z-10" />
        {children}
      </div>
      {error && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  const SelectionGroup = ({ label, options, currentValue, onChange, error, icon: Icon }: any) => (
    <div className="gsap-item bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <label className="block text-sm font-semibold text-gray-700 mb-4 ml-1 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-brand-900" />} {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt: string) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 border ${
              currentValue === opt 
                ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/20 transform scale-[1.02]" 
                : "bg-white text-gray-600 border-gray-200 hover:border-brand-900/40 hover:bg-brand-50/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 ml-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto px-2">
      <div className="text-center mb-10 gsap-item">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <Heart className="w-8 h-8 text-brand-900" />
        </div>
        <h2 className="text-3xl font-serif text-brand-900 mb-2">Let's start with the basics</h2>
        <p className="text-base text-gray-500">Tell us a bit about yourself.</p>
      </div>

      <div className="space-y-6">
        <Field label="Date of Birth" icon={Calendar} error={errors.dob?.message}>
          <input type="date" max={maxDate} {...register("dob")} className={inputClasses} />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Height" icon={Ruler} error={errors.height?.message}>
            <select {...register("height")} className={inputClasses}>
              <option value="">Select Height</option>
              {heights.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Field>

          <Field label="Weight" icon={Weight} error={errors.weight?.message}>
            <select {...register("weight")} className={inputClasses}>
              <option value="">Select Weight</option>
              {weights.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Blood Group" icon={Droplet} error={errors.bloodGroup?.message}>
          <select {...register("bloodGroup")} className={inputClasses}>
            <option value="">Select Blood Group</option>
            {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>

        <SelectionGroup
          label="Marital Status"
          icon={Users}
          options={maritalStatuses}
          currentValue={currentMaritalStatus}
          error={errors.maritalStatus?.message}
          onChange={(val: string) => {
            setValue("maritalStatus", val, { shouldValidate: true });
            if (val === "Never Married") setValue("haveChildren", "No");
          }}
        />

        {currentMaritalStatus && currentMaritalStatus !== "Never Married" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <SelectionGroup
              label="Do you have children?"
              options={childrenOptions}
              currentValue={currentChildren}
              error={errors.haveChildren?.message}
              onChange={(val: string) => setValue("haveChildren", val, { shouldValidate: true })}
            />

            {currentChildren?.startsWith("Yes") && (
              <Field label="How many children?" icon={Baby} error={errors.numberOfChildren?.message}>
                <select {...register("numberOfChildren")} className={inputClasses}>
                  <option value="">Select number</option>
                  {["1", "2", "3", "4", "5+"].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-10 gsap-item">
        {onBack && (
          <button type="button" onClick={onBack} className="w-1/3 py-4 px-4 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
            Back
          </button>
        )}
        <button type="submit" className="flex-1 py-4 px-4 rounded-full text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-md shadow-brand-900/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
          Continue
        </button>
      </div>
    </form>
  );
}

