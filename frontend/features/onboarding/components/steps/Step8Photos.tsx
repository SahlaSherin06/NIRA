"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import { Camera, ImagePlus, Shield, Eye, EyeOff, X, Lock } from "lucide-react";
import { OnboardingData } from "../../types";

const step8Schema = z.object({
  mainPhoto: z.string().min(1, "A main profile photo is required"),
  galleryPhotos: z.array(z.string()).max(4, "Maximum 4 gallery photos allowed"),
  photoPrivacy: z.string().min(1, "Please select a privacy setting"),
});

type Step8Values = z.infer<typeof step8Schema>;

const privacyOptions = [
  { id: "Public", icon: Eye, title: "Visible to all", desc: "Your photos are clearly visible to your matches." },
  { id: "Premium", icon: Lock, title: "Premium Only", desc: "Only premium verified users can see your photos." }
];

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

/**
 * Component: Step8Photos
 * Handles the data collection and validation for this specific onboarding step.
 * @param props.data - The current onboarding draft data
 * @param props.onNext - Callback fired when the user successfully completes this step
 * @param props.onBack - Optional callback to return to the previous step
 */
export function Step8Photos({ data, onNext, onBack }: Props) {
  const containerRef = useRef<HTMLFormElement>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<Step8Values>({
    resolver: zodResolver(step8Schema),
    defaultValues: {
      mainPhoto: data.mainPhoto || "",
      galleryPhotos: data.galleryPhotos || [],
      photoPrivacy: data.photoPrivacy || "Public",
    }
  });

  const wMainPhoto = watch("mainPhoto");
  const wGalleryPhotos = watch("galleryPhotos");
  const wPrivacy = watch("photoPrivacy");

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

  const onSubmit = (values: Step8Values) => {
    // Note: In production, we would upload these File blobs to Cloudinary here 
    // or pass them to the final Step 9 to submit to the backend.
    onNext({ ...data, ...values });
  };

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("mainPhoto", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentGallery = [...wGalleryPhotos];
      const remainingSlots = 4 - currentGallery.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);
      
      const readers = filesToAdd.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newBase64s => {
        setValue("galleryPhotos", [...currentGallery, ...newBase64s], { shouldValidate: true });
      });
    }
  };

  const removeGalleryPhoto = (indexToRemove: number) => {
    const updated = wGalleryPhotos.filter((_, idx) => idx !== indexToRemove);
    setValue("galleryPhotos", updated, { shouldValidate: true });
  };

  return (
    <form ref={containerRef} onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto px-2 pb-10">
      <div className="text-center mb-10 gsap-item">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <Camera className="w-8 h-8 text-brand-900" />
        </div>
        <h2 className="text-3xl font-serif text-brand-900 mb-2">Photos & Privacy</h2>
        <p className="text-base text-gray-500">Add your best photos to get more matches.</p>
      </div>

      <div className="space-y-6">
        
        {/* Main Photo Upload */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-gray-800 ml-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-900" /> Main Profile Photo
            </label>
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-md">Required</span>
          </div>

          <div 
            onClick={() => !wMainPhoto && mainPhotoInputRef.current?.click()}
            className={`relative w-full h-64 sm:h-80 rounded-2xl flex flex-col items-center justify-center border-2 overflow-hidden transition-all ${
              wMainPhoto ? 'border-brand-900/30 shadow-md' : 'border-dashed border-gray-300 hover:border-brand-900/50 hover:bg-white/50 cursor-pointer'
            }`}
          >
            {wMainPhoto ? (
              <>
                <img src={wMainPhoto} alt="Main Profile" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setValue("mainPhoto", "", { shouldValidate: true })}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-700 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-600">Tap to upload your main photo</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG up to 5MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={mainPhotoInputRef}
              onChange={handleMainPhotoChange}
              accept="image/*" 
              className="hidden" 
            />
          </div>
          {errors.mainPhoto && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.mainPhoto.message}</p>}
        </div>

        {/* Gallery Photos */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-gray-800 ml-1 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-brand-900" /> Gallery Photos
            </label>
            <span className="text-xs font-semibold text-gray-500">{wGalleryPhotos.length}/4</span>
          </div>
          <p className="text-xs text-gray-500 ml-1 mb-4">Adding more photos increases your chances of getting noticed.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {wGalleryPhotos.map((url, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeGalleryPhoto(idx)}
                  className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {wGalleryPhotos.length < 4 && (
              <div 
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-900/50 hover:bg-white/50 cursor-pointer flex flex-col items-center justify-center text-gray-400 transition-all"
              >
                <ImagePlus className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium">Add Photo</span>
              </div>
            )}
            
            <input 
              type="file" 
              ref={galleryInputRef}
              onChange={handleGalleryPhotosChange}
              accept="image/*" 
              multiple
              className="hidden" 
            />
          </div>
        </div>

        {/* Photo Privacy Settings */}
        <div className="bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 gsap-item">
          <label className="block text-sm font-bold text-gray-800 mb-2 ml-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-900" /> Photo Privacy Settings
          </label>
          <p className="text-xs text-gray-500 ml-1 mb-4">You have full control over who sees your photos.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privacyOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = wPrivacy === opt.id;
              
              return (
                <div 
                  key={opt.id}
                  onClick={() => setValue("photoPrivacy", opt.id, { shouldValidate: true })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center ${
                    isSelected 
                      ? 'border-brand-900 bg-brand-50/50 shadow-md transform scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:border-brand-900/30'
                  }`}
                >
                  <div className={`p-3 rounded-full mb-3 ${isSelected ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{opt.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{opt.desc}</p>
                </div>
              )
            })}
          </div>
          {errors.photoPrivacy && <p className="mt-2 ml-1 text-xs text-red-500 font-medium">{errors.photoPrivacy.message}</p>}
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

