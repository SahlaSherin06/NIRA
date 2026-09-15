import { useState } from "react";
import { GraduationCap, BookOpen, Award } from "lucide-react";

export default function EducationStep({ onNext }: { onNext: (data: any) => void }) {
  const [educationLevel, setEducationLevel] = useState("");
  const [college, setCollege] = useState("");

  const edOptions = [
    { label: "Bachelors", icon: BookOpen },
    { label: "Masters", icon: GraduationCap },
    { label: "Doctorate", icon: Award },
    { label: "High School / Diploma", icon: BookOpen },
  ];

  const handleNext = () => {
    if (!educationLevel) return;
    onNext({ educationLevel, college });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Education</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">Tell us about your academic background.</p>
      
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4" data-reveal="up">Highest Education Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-reveal-group>
            {edOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setEducationLevel(option.label)}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all group ${
                  educationLevel === option.label 
                  ? "border-[#7a303f] bg-[#7a303f]/5 shadow-md shadow-[#7a303f]/10" 
                  : "border-gray-100 hover:border-[#7a303f]/30 hover:bg-gray-50 bg-white"
                }`}
              >
                <option.icon className={`w-5 h-5 mr-3 ${educationLevel === option.label ? "text-[#7a303f]" : "text-gray-400 group-hover:text-[#7a303f]"}`} />
                <span className={`font-medium ${educationLevel === option.label ? "text-[#7a303f]" : "text-gray-600"}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div data-reveal="up">
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3">College / University (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Oxford University"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
          />
        </div>
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!educationLevel}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
