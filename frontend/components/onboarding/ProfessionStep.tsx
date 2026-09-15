import { useState } from "react";
import { Briefcase, Building2, Banknote } from "lucide-react";

export default function ProfessionStep({ onNext }: { onNext: (data: any) => void }) {
  const [profession, setProfession] = useState("");
  const [industry, setIndustry] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");

  const incomeOptions = [
    "Under $50,000",
    "$50,000 - $100,000",
    "$100,000 - $200,000",
    "Over $200,000",
    "Prefer not to say"
  ];

  const handleNext = () => {
    if (!profession || !industry) return;
    onNext({ profession, industry, annualIncome });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Profession</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">What do you do for a living?</p>
      
      <div className="space-y-8">
        <div data-reveal="up">
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3 flex items-center">
            <Briefcase className="w-4 h-4 mr-2" /> Job Title
          </label>
          <input 
            type="text" 
            placeholder="e.g. Software Engineer, Doctor, Teacher"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
          />
        </div>

        <div data-reveal="up">
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3 flex items-center">
            <Building2 className="w-4 h-4 mr-2" /> Industry
          </label>
          <input 
            type="text" 
            placeholder="e.g. Technology, Healthcare, Education"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
            <Banknote className="w-4 h-4 mr-2" /> Annual Income (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-reveal-group>
            {incomeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setAnnualIncome(option)}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  annualIncome === option 
                  ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f] font-semibold shadow-sm" 
                  : "border-gray-100 hover:border-[#7a303f]/30 hover:bg-gray-50 text-gray-600 bg-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!profession || !industry}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
