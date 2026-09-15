import { useState } from "react";
import { Heart, Search, Users, Calendar, CalendarClock, HelpCircle, CheckCircle2 } from "lucide-react";

export default function IntentionsStep({ onNext }: { onNext: (data: any) => void }) {
  const [intentions, setIntentions] = useState("");
  const [marriageTimeline, setMarriageTimeline] = useState("");

  const intentionOptions = [
    { 
      label: "Ready to marry soon", 
      desc: "Looking to find a partner and settle down in the near future.",
      icon: Heart 
    },
    { 
      label: "Serious relationship first", 
      desc: "Want to build a strong, meaningful foundation before marriage.",
      icon: Search 
    },
    { 
      label: "Searching for my child", 
      desc: "Setting up and managing a profile on behalf of a family member.",
      icon: Users 
    },
  ];

  const timelineOptions = [
    { label: "Within 6 months", icon: Calendar },
    { label: "Within 1 year", icon: CalendarClock },
    { label: "1 to 2 years", icon: CalendarClock },
    { label: "Not sure yet", icon: HelpCircle },
  ];

  const handleNext = () => {
    if (!intentions || !marriageTimeline) return;
    onNext({ intentions, marriageTimeline });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#7a303f] mb-3" data-reveal="up">Your Intentions</h2>
        <p className="text-gray-500 text-lg" data-reveal="up">What brings you to NIRA today?</p>
      </div>
      
      <div className="space-y-12">
        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-5 text-center" data-reveal="up">Primary Goal</label>
          <div className="grid grid-cols-1 gap-4" data-reveal-group>
            {intentionOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setIntentions(option.label)}
                className={`relative flex items-center p-5 rounded-2xl border-2 transition-all duration-300 group text-left overflow-hidden ${
                  intentions === option.label 
                  ? "border-[#7a303f] bg-[#7a303f]/5 ring-4 ring-[#7a303f]/10" 
                  : "border-gray-100 hover:border-[#7a303f]/30 hover:bg-gray-50 bg-white"
                }`}
              >
                {/* Checkmark Indicator */}
                <div className={`absolute top-4 right-4 transition-opacity duration-300 ${intentions === option.label ? 'opacity-100' : 'opacity-0'}`}>
                  <CheckCircle2 className="w-6 h-6 text-[#7a303f]" />
                </div>

                <div className={`p-4 rounded-full mr-5 transition-colors duration-300 ${
                  intentions === option.label ? "bg-[#7a303f] text-white shadow-md shadow-[#7a303f]/20" : "bg-cream text-gray-400 group-hover:text-[#7a303f] group-hover:bg-[#7a303f]/10"
                }`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="pr-8">
                  <h3 className={`font-bold text-lg mb-1 transition-colors ${intentions === option.label ? "text-[#7a303f]" : "text-gray-800"}`}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {option.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-5 text-center" data-reveal="up">Timeline to Marry</label>
          <div className="grid grid-cols-2 gap-3" data-reveal-group>
            {timelineOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setMarriageTimeline(option.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group ${
                  marriageTimeline === option.label 
                  ? "border-[#7a303f] bg-[#7a303f] text-white shadow-lg shadow-[#7a303f]/20 scale-[1.02]" 
                  : "border-gray-200 hover:border-[#7a303f]/50 hover:bg-gray-50 bg-white text-gray-600"
                }`}
              >
                <option.icon className={`w-6 h-6 mb-2 transition-colors ${
                  marriageTimeline === option.label ? "text-white" : "text-gray-400 group-hover:text-[#7a303f]"
                }`} />
                <span className="font-medium text-sm text-center">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!intentions || !marriageTimeline}
          className="w-full sm:w-auto px-12 py-4 bg-[#7a303f] text-white font-bold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
