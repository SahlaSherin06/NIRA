import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function PartnerPreferencesStep({ onNext }: { onNext: (data: any) => void }) {
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(35);
  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(180);

  const handleNext = () => {
    onNext({
      partnerAgeRange: { min: minAge, max: maxAge },
      partnerHeightRange: { min: minHeight, max: maxHeight }
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Partner Preferences</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">What are you looking for in a partner?</p>
      
      <div className="space-y-10">
        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-[#7a303f]" /> Age Preference
          </label>
          <div className="flex items-center gap-4" data-reveal="fade">
            <div className="flex-1">
              <span className="text-sm text-gray-500 mb-1 block">Min Age</span>
              <input 
                type="number" 
                min="18" max="80"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] text-center text-xl font-medium bg-white"
              />
            </div>
            <span className="text-gray-400 font-medium mt-6">to</span>
            <div className="flex-1">
              <span className="text-sm text-gray-500 mb-1 block">Max Age</span>
              <input 
                type="number" 
                min="18" max="80"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] text-center text-xl font-medium bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-[#7a303f]" /> Height Preference (cm)
          </label>
          <div className="flex items-center gap-4" data-reveal="fade">
            <div className="flex-1">
              <span className="text-sm text-gray-500 mb-1 block">Min Height</span>
              <input 
                type="number" 
                min="120" max="250"
                value={minHeight}
                onChange={(e) => setMinHeight(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] text-center text-xl font-medium bg-white"
              />
            </div>
            <span className="text-gray-400 font-medium mt-6">to</span>
            <div className="flex-1">
              <span className="text-sm text-gray-500 mb-1 block">Max Height</span>
              <input 
                type="number" 
                min="120" max="250"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] text-center text-xl font-medium bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#7a303f]/5 border border-[#7a303f]/20 text-[#7a303f] p-6 rounded-2xl text-sm leading-relaxed shadow-sm" data-reveal="up">
          <strong className="block text-base mb-1">Note:</strong> You can fine-tune these preferences later in your account settings.
        </div>
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
