import { useState } from "react";

export default function AboutYouStep({ onNext }: { onNext: (data: any) => void }) {
  const [bio, setBio] = useState("");

  const handleNext = () => {
    onNext({ bio });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#7a303f] mb-2" data-reveal="up">About You</h2>
      <p className="text-gray-500 mb-10 text-lg" data-reveal="up">Write a little bit about yourself, your personality, and what you enjoy.</p>
      
      <div className="space-y-8" data-reveal="up">
        <div>
          <label className="block text-sm font-semibold tracking-wide text-gray-700 uppercase mb-4">Your Bio</label>
          <textarea 
            rows={6}
            placeholder="e.g. I am a software engineer who loves traveling, trying new cafes, and spending time with family..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-5 rounded-3xl border-2 border-gray-100 focus:outline-none focus:border-[#7a303f] focus:ring-4 focus:ring-[#7a303f]/10 transition-all bg-white text-lg shadow-sm hover:border-gray-200 resize-none"
          ></textarea>
          <div className="flex justify-end mt-2">
            <span className={`text-sm ${bio.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
              {bio.length} characters (aim for at least 50)
            </span>
          </div>
        </div>

        <div className="bg-orange-50/80 border border-orange-100 text-orange-800 p-6 rounded-2xl text-sm leading-relaxed shadow-sm">
          <strong className="block text-base mb-1">Writing Tip:</strong> Be genuine and positive. Mention your hobbies, values, and what kind of partner you are looking for.
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center" data-reveal="fade">
        <button onClick={() => onNext({})} className="text-gray-400 hover:text-gray-800 font-medium transition-colors px-4 py-2">
          Skip for now
        </button>
        <button 
          onClick={handleNext}
          disabled={bio.length < 10}
          className="px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
