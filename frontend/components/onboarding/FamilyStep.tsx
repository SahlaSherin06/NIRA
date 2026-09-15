import { useState } from "react";
import { Home, HeartHandshake } from "lucide-react";

export default function FamilyStep({ onNext }: { onNext: (data: any) => void }) {
  const [familyType, setFamilyType] = useState("");
  const [familyValues, setFamilyValues] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [siblings, setSiblings] = useState("");

  const familyTypeOptions = ["Joint Family", "Nuclear Family", "Other"];
  const familyValuesOptions = ["Traditional", "Moderate", "Liberal"];

  const handleNext = () => {
    onNext({ familyType, familyValues, fatherOccupation, motherOccupation, siblings: Number(siblings) || 0 });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">Family Background</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">Marriage is often a union of two families. Tell us a bit about yours.</p>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
              <Home className="w-4 h-4 mr-2 text-[#7a303f]" /> Family Type
            </label>
            <div className="flex flex-col gap-3" data-reveal-group>
              {familyTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => setFamilyType(type)}
                  className={`p-3 rounded-2xl border-2 transition-all font-medium ${
                    familyType === type 
                    ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f]" 
                    : "border-gray-100 hover:border-gray-300 text-gray-600 bg-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4 flex items-center" data-reveal="up">
              <HeartHandshake className="w-4 h-4 mr-2 text-[#7a303f]" /> Family Values
            </label>
            <div className="flex flex-col gap-3" data-reveal-group>
              {familyValuesOptions.map((val) => (
                <button
                  key={val}
                  onClick={() => setFamilyValues(val)}
                  className={`p-3 rounded-2xl border-2 transition-all font-medium ${
                    familyValues === val 
                    ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f]" 
                    : "border-gray-100 hover:border-gray-300 text-gray-600 bg-white"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-reveal-group>
          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3">Father's Occupation</label>
            <input 
              type="text" 
              placeholder="e.g. Retired, Business, etc."
              value={fatherOccupation}
              onChange={(e) => setFatherOccupation(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3">Mother's Occupation</label>
            <input 
              type="text" 
              placeholder="e.g. Homemaker, Teacher, etc."
              value={motherOccupation}
              onChange={(e) => setMotherOccupation(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
            />
          </div>
        </div>

        <div data-reveal="up">
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-3">Number of Siblings</label>
          <input 
            type="number" 
            min="0"
            value={siblings}
            onChange={(e) => setSiblings(e.target.value)}
            className="w-full sm:w-1/2 p-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200"
          />
        </div>
      </div>

      <div className="mt-12 flex justify-end" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!familyType || !familyValues}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
