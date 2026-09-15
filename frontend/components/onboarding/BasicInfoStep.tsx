import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function BasicInfoStep({ onNext }: { onNext: (data: any) => void }) {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  
  const [languages, setLanguages] = useState<string[]>([]);

  const genderOptions = ["Female", "Male", "Other", "Prefer not to say"];
  const maritalOptions = ["Never Married", "Divorced", "Widowed"];
  const languageOptions = ["Malayalam", "English", "Hindi", "Tamil", "Kannada", "Telugu"];

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const isComplete = fullName && dateOfBirth && gender && maritalStatus && country && state && city && languages.length > 0;

  const handleNext = () => {
    if (!isComplete) return;
    onNext({ fullName, dateOfBirth, gender, maritalStatus, location: { country, state, city }, languages });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#7a303f] mb-3" data-reveal="up">Tell us about yourself</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed" data-reveal="up">
          This is important because basic information is used for profile discovery and matching.
        </p>
      </div>
      
      <div className="space-y-10">
        {/* Full Name & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-reveal-group>
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Date of Birth</label>
            <input 
              type="date" 
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-800"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-4" data-reveal="up">Gender</label>
          <div className="grid grid-cols-2 gap-3" data-reveal-group>
            {genderOptions.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`relative py-3.5 px-4 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                  gender === g 
                  ? "border-[#7a303f] bg-[#7a303f] text-white shadow-md shadow-[#7a303f]/20 scale-[1.02]" 
                  : "border-gray-100 hover:border-[#7a303f]/30 hover:bg-gray-50 text-gray-600 bg-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-4" data-reveal="up">Marital Status</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-reveal-group>
            {maritalOptions.map((status) => (
              <button
                key={status}
                onClick={() => setMaritalStatus(status)}
                className={`py-3.5 px-4 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                  maritalStatus === status 
                  ? "border-[#7a303f] bg-[#7a303f] text-white shadow-md shadow-[#7a303f]/20 scale-[1.02]" 
                  : "border-gray-100 hover:border-[#7a303f]/30 hover:bg-gray-50 text-gray-600 bg-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-4" data-reveal="up">Location</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-reveal-group>
            <input 
              type="text" 
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-800 text-sm"
            />
            <input 
              type="text" 
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-800 text-sm"
            />
            <input 
              type="text" 
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-gray-50/50 hover:bg-white text-gray-800 text-sm"
            />
          </div>
        </div>

        {/* Languages */}
        <div>
          <div className="flex justify-between items-end mb-4" data-reveal="up">
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase">Languages</label>
            <span className="text-xs text-gray-400">Select multiple</span>
          </div>
          <div className="flex flex-wrap gap-3" data-reveal-group>
            {languageOptions.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`flex items-center gap-2 py-2.5 px-5 rounded-full border transition-all duration-300 text-sm font-medium ${
                  languages.includes(lang)
                  ? "border-[#7a303f] bg-[#7a303f]/5 text-[#7a303f] ring-2 ring-[#7a303f]/20" 
                  : "border-gray-200 hover:border-[#7a303f]/50 hover:bg-gray-50 text-gray-600 bg-white"
                }`}
              >
                {languages.includes(lang) && <CheckCircle2 className="w-4 h-4" />}
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!isComplete}
          className="w-full sm:w-auto px-12 py-4 bg-[#7a303f] text-white font-bold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
