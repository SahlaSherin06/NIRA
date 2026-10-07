"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Globe, MapPin, Building2, Book, Languages, Compass, Users, Edit3, X } from "lucide-react";
import { OnboardingData } from "../../types";

const step2Schema = z.object({
  nationality: z.string().min(1, "Nationality is required"),
  nationalityOther: z.string().optional(),
  
  grewUpIn: z.string().min(1, "Please tell us where you grew up"),
  grewUpInOther: z.string().optional(),
  
  country: z.string().min(1, "Current country is required"),
  countryOther: z.string().optional(),
  
  state: z.string().min(1, "State/Province is required"),
  city: z.string().min(1, "City is required"),
  
  religion: z.string().min(1, "Religion is required"),
  religionOther: z.string().optional(),
  
  caste: z.string().optional(),
  
  ethnicity: z.string().min(1, "Ethnicity is required"),
  ethnicityOther: z.string().optional(),
  
  motherTongue: z.string().min(1, "Mother tongue is required"),
  motherTongueOther: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.nationality === "Other" && !data.nationalityOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["nationalityOther"] });
  }
  if (data.grewUpIn === "Other" && !data.grewUpInOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["grewUpInOther"] });
  }
  if (data.country === "Other" && !data.countryOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["countryOther"] });
  }
  if (data.religion === "Other" && !data.religionOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["religionOther"] });
  }
  if (data.ethnicity === "Other" && !data.ethnicityOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["ethnicityOther"] });
  }
  if (data.motherTongue === "Other" && !data.motherTongueOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["motherTongueOther"] });
  }
});

type Step2Values = z.infer<typeof step2Schema>;

const countries = [
  "India", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", 
  "Kuwait", "Bahrain", "United Kingdom", "United States", "Canada", "Australia", "Other"
];

const religions = ["Islam", "Hinduism", "Christianity", "Sikhism", "Jainism", "Buddhism", "Other"];
const languages = ["Malayalam", "English", "Hindi", "Tamil", "Urdu", "Kannada", "Telugu", "Bengali", "Other"];
const ethnicities = ["South Asian", "Middle Eastern", "East Asian", "African", "Caucasian", "Mixed", "Other"];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step2Roots
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step2Roots({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      nationality: countries.includes(data.nationality || "") ? data.nationality : (data.nationality ? "Other" : ""),
      nationalityOther: countries.includes(data.nationality || "") ? "" : data.nationality,
      
      grewUpIn: countries.includes(data.grewUpIn || "") ? data.grewUpIn : (data.grewUpIn ? "Other" : ""),
      grewUpInOther: countries.includes(data.grewUpIn || "") ? "" : data.grewUpIn,
      
      country: countries.includes(data.country || "") ? data.country : (data.country ? "Other" : ""),
      countryOther: countries.includes(data.country || "") ? "" : data.country,
      
      state: data.state || "",
      city: data.city || "",
      
      religion: religions.includes(data.religion || "") ? data.religion : (data.religion ? "Other" : ""),
      religionOther: religions.includes(data.religion || "") ? "" : data.religion,
      
      caste: data.caste || "",
      
      ethnicity: ethnicities.includes(data.ethnicity || "") ? data.ethnicity : (data.ethnicity ? "Other" : ""),
      ethnicityOther: ethnicities.includes(data.ethnicity || "") ? "" : data.ethnicity,
      
      motherTongue: languages.includes(data.motherTongue || "") ? data.motherTongue : (data.motherTongue ? "Other" : ""),
      motherTongueOther: languages.includes(data.motherTongue || "") ? "" : data.motherTongue,
    }
  });

  const wNationality = watch("nationality");
  const wGrewUpIn = watch("grewUpIn");
  const wCountry = watch("country");
  const wReligion = watch("religion");
  const wEthnicity = watch("ethnicity");
  const wMotherTongue = watch("motherTongue");

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

  const onSubmit = (values: Step2Values) => {
    const finalData: Partial<OnboardingData> = {
      ...data,
      nationality: values.nationality === "Other" ? values.nationalityOther : values.nationality,
      grewUpIn: values.grewUpIn === "Other" ? values.grewUpInOther : values.grewUpIn,
      country: values.country === "Other" ? values.countryOther : values.country,
      state: values.state,
      city: values.city,
      religion: values.religion === "Other" ? values.religionOther : values.religion,
      caste: values.caste,
      ethnicity: values.ethnicity === "Other" ? values.ethnicityOther : values.ethnicity,
      motherTongue: values.motherTongue === "Other" ? values.motherTongueOther : values.motherTongue,
    };
    onNext(finalData);
  };

  // Restrict to letters and spaces only
  const handleLettersOnly = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, '');
  };

  const inputClasses = "w-full pl-12 pr-10 py-4 bg-white/70 backdrop-blur-sm hover:bg-white border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-900/10 focus:border-brand-900/30 transition-all text-gray-800 shadow-sm appearance-none font-medium";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2 ml-1";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-900/60 pointer-events-none z-10";

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto px-2 pb-10">
      <div className="text-center mb-10 gsap-item">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <Globe className="w-8 h-8 text-brand-900" />
        </div>
        <h2 className="text-3xl font-serif text-brand-900 mb-2">Roots & Background</h2>
        <p className="text-base text-gray-500">Tell us where you are from and your cultural background.</p>
      </div>

      <div className="space-y-6">
<div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-900" /> Origin
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Nationality (Passport)</label>
              {wNationality !== "Other" ? (
                <div className="relative">
                  <Globe className={iconClasses} />
                  <select {...register("nationality")} className={inputClasses}>
                    <option value="">Select Nationality</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.nationality && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.nationality.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type nationality..." {...register("nationalityOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("nationality", ""); setValue("nationalityOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.nationalityOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.nationalityOther.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Where did you grow up?</label>
              {wGrewUpIn !== "Other" ? (
                <div className="relative">
                  <MapPin className={iconClasses} />
                  <select {...register("grewUpIn")} className={inputClasses}>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.grewUpIn && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.grewUpIn.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type country..." {...register("grewUpInOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("grewUpIn", ""); setValue("grewUpInOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.grewUpInOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.grewUpInOther.message}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
<div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-900" /> Current Location
          </h3>
          
          <div>
            <label className={labelClasses}>Current Country of Residence</label>
            {wCountry !== "Other" ? (
              <div className="relative">
                <Globe className={iconClasses} />
                <select {...register("country")} className={inputClasses}>
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.country.message}</p>}
              </div>
            ) : (
              <div className="relative animate-in fade-in zoom-in-95 duration-200">
                <Edit3 className={iconClasses} />
                <input type="text" placeholder="Type country..." {...register("countryOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                <button type="button" onClick={() => { setValue("country", ""); setValue("countryOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                  <X className="w-5 h-5" />
                </button>
                {errors.countryOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.countryOther.message}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>State / Province</label>
              <div className="relative">
                <MapPin className={iconClasses} />
                <input type="text" placeholder="E.g. Kerala, Dubai" {...register("state")} onInput={handleLettersOnly} className={inputClasses} />
              </div>
              {errors.state && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.state.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>City</label>
              <div className="relative">
                <Building2 className={iconClasses} />
                <input type="text" placeholder="E.g. Kochi" {...register("city")} onInput={handleLettersOnly} className={inputClasses} />
              </div>
              {errors.city && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.city.message}</p>}
            </div>
          </div>
        </div>
<div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-900" /> Culture & Religion
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Religion</label>
              {wReligion !== "Other" ? (
                <div className="relative">
                  <Book className={iconClasses} />
                  <select {...register("religion")} className={inputClasses}>
                    <option value="">Select Religion</option>
                    {religions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.religion && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.religion.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type religion..." {...register("religionOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("religion", ""); setValue("religionOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.religionOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.religionOther.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Sect / Caste <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <Users className={iconClasses} />
                <input type="text" placeholder="E.g. Sunni, Nair" {...register("caste")} onInput={handleLettersOnly} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Ethnicity</label>
              {wEthnicity !== "Other" ? (
                <div className="relative">
                  <Globe className={iconClasses} />
                  <select {...register("ethnicity")} className={inputClasses}>
                    <option value="">Select Ethnicity</option>
                    {ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.ethnicity && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.ethnicity.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type ethnicity..." {...register("ethnicityOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("ethnicity", ""); setValue("ethnicityOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.ethnicityOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.ethnicityOther.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Mother Tongue</label>
              {wMotherTongue !== "Other" ? (
                <div className="relative">
                  <Languages className={iconClasses} />
                  <select {...register("motherTongue")} className={inputClasses}>
                    <option value="">Select Language</option>
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.motherTongue && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.motherTongue.message}</p>}
                </div>
              ) : (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <Edit3 className={iconClasses} />
                  <input type="text" placeholder="Type language..." {...register("motherTongueOther")} onInput={handleLettersOnly} className={inputClasses} autoFocus />
                  <button type="button" onClick={() => { setValue("motherTongue", ""); setValue("motherTongueOther", ""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-5 h-5" />
                  </button>
                  {errors.motherTongueOther && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.motherTongueOther.message}</p>}
                </div>
              )}
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


