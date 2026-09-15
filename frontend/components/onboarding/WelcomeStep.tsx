import { HeartHandshake } from "lucide-react";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center flex flex-col items-center">
      <div 
        className="w-20 h-20 bg-[#7a303f]/5 rounded-full flex items-center justify-center mb-6"
        data-reveal="scale"
      >
        <HeartHandshake className="w-10 h-10 text-[#7a303f]" />
      </div>
      
      <h2 className="text-4xl font-bold text-[#7a303f] mb-4" data-reveal="up">Welcome to NIRA</h2>
      
      <p className="text-gray-600 mb-10 leading-relaxed max-w-lg text-lg" data-reveal="up">
        Finding a life partner is a beautiful journey, and NIRA is designed to help you make meaningful, serious connections.
        <br /><br />
        To give you the best matches, we need to get to know you better. This will only take a few minutes.
      </p>
      
      <div data-reveal="up" className="w-full sm:w-auto">
        <button 
          onClick={onNext}
          className="w-full sm:w-auto px-10 py-4 bg-[#7a303f] text-white font-semibold rounded-full hover:bg-[#602531] hover:shadow-lg hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          Let's Begin
        </button>
      </div>
    </div>
  );
}
