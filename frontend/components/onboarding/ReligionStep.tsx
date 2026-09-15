import { useState } from "react";
import { Book } from "lucide-react";

export default function ReligionStep({ onNext }: { onNext: (data: any) => void }) {
  const [religion, setReligion] = useState("");
  const [sect, setSect] = useState("");

  const religions = ["Islam", "Hinduism", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other", "No Religion"];

  const handleNext = () => {
    if (!religion) return;
    onNext({ religion, sect });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Religion & Beliefs</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">Shared values are the foundation of a strong relationship.</p>
      
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
            <Book className="w-4 h-4 mr-2 text-[#7a303f]" /> Religion
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-reveal-group>
            {religions.map((r) => (
              <button
                key={r}
                onClick={() => { setReligion(r); setSect(""); }}
                className={`p-4 rounded-2xl border-2 transition-all font-medium ${
                  religion === r 
                  ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f]" 
                  : "border-gray-100 hover:border-gray-300 text-gray-600 bg-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {religion && religion !== "No Religion" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3">Community / Sect (Optional)</label>
            <input 
              type="text" 
              placeholder={`e.g. Sunni, Catholic, Brahmin...`}
              value={sect}
              onChange={(e) => setSect(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
            />
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!religion}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
