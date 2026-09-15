import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Plus } from "lucide-react";

export default function PhotosStep({ onNext }: { onNext: (data: any) => void }) {
  // Store Base64 strings for preview (4 slots)
  const [photos, setPhotos] = useState<string[]>(Array(4).fill(""));
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[index] = reader.result as string;
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPhotos = [...photos];
    newPhotos[index] = "";
    setPhotos(newPhotos);
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = ""; // Reset the input
    }
  };

  const triggerFileSelect = (index: number) => {
    fileInputRefs[index].current?.click();
  };

  // At least 1 photo must be uploaded (compulsory)
  const uploadedCount = photos.filter((p) => p !== "").length;
  const isComplete = uploadedCount >= 1;

  const handleNext = () => {
    if (!isComplete) return;
    // We only pass non-empty strings. (In a real app, you'd upload the File objects to S3/Cloudinary here)
    onNext({ photos: photos.filter((p) => p !== "") });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#7a303f] mb-3" data-reveal="up">First Impressions</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed" data-reveal="up">
          Add up to 4 photos. A minimum of 1 photo is required to continue.
        </p>
      </div>
      
      <div className="space-y-6">
        
        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4" data-reveal-group>
          {photos.map((photo, index) => {
            const isMain = index === 0;
            return (
              <div 
                key={index}
                className={`${isMain ? "col-span-3 aspect-[4/3] sm:aspect-video" : "col-span-1 aspect-square"} relative rounded-2xl md:rounded-3xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  photo 
                  ? "border-[#7a303f] shadow-[0_0_20px_rgba(122,48,63,0.15)] bg-black" 
                  : "border-gray-300 hover:border-[#7a303f]/50 hover:bg-[#7a303f]/5 bg-gray-50"
                }`}
                onClick={() => triggerFileSelect(index)}
              >
                <input 
                  type="file"
                  accept="image/*"
                  ref={fileInputRefs[index]}
                  className="hidden"
                  onChange={(e) => handleFileChange(index, e)}
                />

                {photo ? (
                  <>
                    <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity" />
                    <button
                      onClick={(e) => removePhoto(index, e)}
                      className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    {isMain && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium">
                        Main Profile Photo
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center opacity-70 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-2 md:mb-3">
                      {isMain ? <UploadCloud className="w-5 h-5 md:w-6 md:h-6 text-[#7a303f]" /> : <Plus className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />}
                    </div>
                    {isMain ? (
                      <>
                        <p className="text-[#7a303f] font-semibold text-sm md:text-base">Upload Main Photo *</p>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">JPEG, PNG up to 5MB</p>
                      </>
                    ) : (
                      <p className="text-gray-600 font-medium text-xs md:text-sm">Add Photo</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Pro Tip */}
        <div className="bg-orange-50/80 border border-orange-100 text-orange-800 p-5 md:p-6 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm flex items-start gap-4" data-reveal="up">
          <div className="p-2 bg-orange-100 rounded-full shrink-0">
            <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          </div>
          <div>
            <strong className="block text-sm md:text-base mb-1">Pro Tip for Matrimony:</strong> 
            Profiles with clear, well-lit headshots get up to 5x more responses. Avoid group photos, sunglasses, or heavy filters for the best results.
          </div>
        </div>

      </div>

      <div className="mt-14 flex justify-center" data-reveal="fade">
        <button 
          onClick={handleNext}
          disabled={!isComplete}
          className="w-full sm:w-auto px-12 py-4 bg-[#7a303f] text-white font-bold rounded-full hover:bg-[#602531] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-[#7a303f]/30 transition-all transform hover:-translate-y-1"
        >
          {isComplete ? "Continue" : "Upload at least 1 photo"}
        </button>
      </div>
    </div>
  );
}
