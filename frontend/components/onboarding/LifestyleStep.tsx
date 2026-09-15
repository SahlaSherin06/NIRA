import { useState } from "react";
import { Utensils, Cigarette, Wine, Ban } from "lucide-react";

export default function LifestyleStep({ onNext }: { onNext: (data: any) => void }) {
  const [diet, setDiet] = useState("");
  const [smokingHabits, setSmokingHabits] = useState("");
  const [drinkingHabits, setDrinkingHabits] = useState("");

  const diets = ["Vegetarian", "Non-Vegetarian", "Vegan", "Halal", "Kosher"];
  
  const habitsOptions = [
    { label: "No", icon: Ban, color: "text-green-500" },
    { label: "Occasionally", icon: Wine, color: "text-orange-500" },
    { label: "Yes", icon: Cigarette, color: "text-red-500" },
  ];

  const handleNext = () => {
    if (!diet || !smokingHabits || !drinkingHabits) return;
    onNext({ diet, smokingHabits, drinkingHabits });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Lifestyle</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">Your daily habits and dietary preferences.</p>
      
      <div className="space-y-10">
        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
            <Utensils className="w-4 h-4 mr-2 text-[#7a303f]" /> Dietary Preference
          </label>
          <div className="flex flex-wrap gap-3" data-reveal-group>
            {diets.map((d) => (
              <button
                key={d}
                onClick={() => setDiet(d)}
                className={`px-5 py-3 rounded-full border-2 transition-all font-medium ${
                  diet === d 
                  ? "border-[#7a303f] bg-[#7a303f] text-white shadow-md shadow-[#7a303f]/20" 
                  : "border-gray-200 hover:border-[#7a303f]/50 hover:bg-[#7a303f]/5 text-gray-700 bg-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4" data-reveal="up">
              Smoking
            </label>
            <div className="flex flex-col gap-3" data-reveal-group>
              {habitsOptions.map((opt) => (
                <button
                  key={`smoke-${opt.label}`}
                  onClick={() => setSmokingHabits(opt.label)}
                  className={`flex items-center p-3 rounded-2xl border-2 transition-all group ${
                    smokingHabits === opt.label 
                    ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f] font-semibold shadow-sm" 
                    : "border-gray-100 hover:border-gray-300 text-gray-600 bg-white"
                  }`}
                >
                  <opt.icon className={`w-4 h-4 mr-3 ${smokingHabits === opt.label ? "text-[#7a303f]" : "text-gray-400 group-hover:text-gray-600"}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4" data-reveal="up">
              Drinking
            </label>
            <div className="flex flex-col gap-3" data-reveal-group>
              {habitsOptions.map((opt) => (
                <button
                  key={`drink-${opt.label}`}
                  onClick={() => setDrinkingHabits(opt.label)}
                  className={`flex items-center p-3 rounded-2xl border-2 transition-all group ${
                    drinkingHabits === opt.label 
                    ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f] font-semibold shadow-sm" 
                    : "border-gray-100 hover:border-gray-300 text-gray-600 bg-white"
                  }`}
                >
                  <opt.icon className={`w-4 h-4 mr-3 ${drinkingHabits === opt.label ? "text-[#7a303f]" : "text-gray-400 group-hover:text-gray-600"}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!diet || !smokingHabits || !drinkingHabits}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
