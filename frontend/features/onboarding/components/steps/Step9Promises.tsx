"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { ShieldCheck, HeartHandshake, UserCheck, MessageCircleHeart, CheckCircle2 } from "lucide-react";
import { OnboardingData } from "../../types";

const step9Schema = z.object({
  promisesAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the NIRA community promises to continue",
  }),
});

type Step9Values = z.infer<typeof step9Schema>;

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

/**
 * Component: Step9Promises
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step9Promises({ data, onNext, onBack, isSubmitting = false }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Step9Values>({
    resolver: zodResolver(step9Schema),
    defaultValues: {
      promisesAccepted: data.promisesAccepted || false,
    }
  });

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

  const onSubmit = (values: Step9Values) => {
    onNext({ ...data, ...values });
  };

  const promises = [
    {
      icon: HeartHandshake,
      title: "Genuine Intentions",
      desc: "I am here to find a meaningful relationship and am serious about my search.",
    },
    {
      icon: UserCheck,
      title: "Honesty & Authenticity",
      desc: "I confirm that all information and photos I have provided are accurate and truly represent me.",
    },
    {
      icon: MessageCircleHeart,
      title: "Respect & Kindness",
      desc: "I will treat all matches with respect, regardless of their background or personal choices.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy & Safety",
      desc: "I will respect the privacy of others and will not share screenshots or private conversations outside NIRA.",
    }
  ];

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-6 sm:space-y-8 max-w-2xl mx-auto px-0 sm:px-2 pb-10">
      <div className="text-center mb-8 sm:mb-10 gsap-item">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-brand-100">
          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-brand-900" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-brand-900 mb-1.5 sm:mb-2">The NIRA Promise</h2>
        <p className="text-sm sm:text-base text-gray-500 px-2 sm:px-4">To ensure a safe and premium experience for everyone, we ask all members to agree to our community guidelines.</p>
      </div>

      <div className="w-full min-w-0 bg-white sm:bg-white/50 backdrop-blur-md p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 sm:border-white/60 shadow-xs sm:shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6 sm:space-y-8 gsap-item">
        <div className="space-y-5 sm:space-y-6">
          {promises.map((promise, idx) => {
            const Icon = promise.icon;
            return (
              <div key={idx} className="flex gap-3 sm:gap-4 items-start">
                <div className="bg-brand-50/50 p-2 sm:p-2.5 rounded-full text-brand-900 shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-0.5 sm:mb-1">{promise.title}</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">{promise.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200/60 pt-5 sm:pt-6 mt-5 sm:mt-6">
          <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                {...register("promisesAccepted")}
                className="peer appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded-md checked:border-brand-900 checked:bg-brand-900 transition-all cursor-pointer"
              />
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              I promise to follow the NIRA Community Guidelines and understand that my account may be banned if I violate them.
            </div>
          </label>
          {errors.promisesAccepted && (
            <p className="mt-2 sm:mt-3 text-xs text-red-500 font-medium text-center">{errors.promisesAccepted.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 pt-6 sm:pt-10 gsap-item">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="w-1/3 py-3.5 sm:py-4 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 sm:py-4 px-4 rounded-full text-xs sm:text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-md shadow-brand-900/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            "Submit Profile"
          )}
        </button>
      </div>
    </form>
  );
}


