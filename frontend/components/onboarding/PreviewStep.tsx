import { CheckCircle } from "lucide-react";

export default function PreviewStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center flex flex-col items-center">
      <div 
        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"
        data-reveal="scale"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      
      <h2 className="text-4xl font-bold text-[#7a303f] mb-4" data-reveal="up">You're All Set!</h2>
      
      <p className="text-gray-600 mb-10 leading-relaxed max-w-lg text-lg" data-reveal="up">
        Thank you for sharing your details. Your profile is looking great! 
        Based on your preferences, we will now curate the best possible matches for you.
      </p>
      
      <div className="bg-[#fcfaf8] border border-gray-100 rounded-3xl p-6 w-full text-left shadow-sm mb-10" data-reveal="fade">
        <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Profile Checklist</h3>
        <ul className="space-y-3">
          <li className="flex items-center text-green-700 font-medium">
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" /> Basic Info Completed
          </li>
          <li className="flex items-center text-green-700 font-medium">
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" /> Background Verified
          </li>
          <li className="flex items-center text-green-700 font-medium">
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" /> Preferences Saved
          </li>
        </ul>
      </div>
      
      <div data-reveal="up" className="w-full sm:w-auto">
        <button 
          onClick={onNext}
          className="w-full sm:w-auto px-12 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Submit Profile
        </button>
      </div>
    </div>
  );
}
