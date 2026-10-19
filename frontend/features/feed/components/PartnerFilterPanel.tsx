"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Check, SlidersHorizontal } from "lucide-react";
import { FeedFilterParams } from "../feed.api";

export interface PartnerFilterPanelProps {
  initialFilters?: FeedFilterParams;
  onApply: (filters: FeedFilterParams) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const RELIGIONS = ["No preference", "Islam", "Hinduism", "Christianity", "Sikhism", "Jainism", "Buddhism"];
const SECTS: Record<string, string[]> = {
  Islam: ["No preference", "Sunni", "Shia", "Mujahid", "Salafi", "Other"],
  Hinduism: ["No preference", "Nair", "Ezhava", "Menon", "Brahmin", "Other"],
  Christianity: ["No preference", "RC - Roman Catholic", "Syrian Catholic", "Jacobite", "Orthodox", "Marthoma", "Knanaya", "Other"],
  Default: ["No preference", "Sunni", "Shia", "RC", "Nair", "Ezhava", "Other"]
};
const LOCATIONS = ["Anywhere", "India", "Same state", "Same city"];
const DIETS = ["No preference", "Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian"];
const ALCOHOL_OPTIONS = ["No preference", "Drinks", "Doesn't drink"];
const SMOKING_OPTIONS = ["No preference", "Smoker", "Non-smoker"];
const MARITAL_STATUSES = ["No preference", "Never Married", "Divorced", "Widowed"];
const EDUCATION_OPTIONS = ["No preference", "Doctorate", "Master's", "Bachelor's", "Diploma", "High School"];
const PROFESSION_OPTIONS = ["No preference", "IT / Software", "Healthcare", "Education", "Business", "Government", "Finance", "Other"];
const HEIGHT_OPTIONS = [
  "No preference",
  "140 - 155 cm (4'7\" - 5'1\")",
  "155 - 165 cm (5'1\" - 5'5\")",
  "165 - 175 cm (5'5\" - 5'9\")",
  "175 - 185 cm (5'9\" - 6'1\")",
  "185 cm+ (6'1\"+)"
];
const NATIONALITY_OPTIONS = [
  "No preference",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Other"
];
const CHILDREN_OPTIONS = [
  "No preference",
  "Doesn't have children",
  "Has children",
  "Open to all"
];
const LANGUAGE_OPTIONS = [
  "No preference",
  "Malayalam",
  "English",
  "Hindi",
  "Tamil",
  "Urdu",
  "Kannada",
  "Telugu",
  "Bengali",
  "Arabic",
  "Other"
];
const MARRIAGE_PLAN_OPTIONS = ["No preference", "Within 6 months", "Within 1 year", "Within 2 years", "2+ years"];
const RELOCATION_OPTIONS = ["No preference", "Yes, definitely", "Open to relocate", "Not interested"];

type FilterSubView = 
  | "main"
  | "location" 
  | "religion" 
  | "caste" 
  | "diet" 
  | "alcohol" 
  | "smoking" 
  | "maritalStatus" 
  | "education" 
  | "profession" 
  | "height"
  | "nationality"
  | "children"
  | "language"
  | "marriagePlans"
  | "relocationPlans";

export function PartnerFilterPanel({
  initialFilters,
  onApply,
  onClose,
  isMobile = false
}: PartnerFilterPanelProps) {
  // Main filter state
  const [minAge, setMinAge] = useState<number>(initialFilters?.minAge || 20);
  const [maxAge, setMaxAge] = useState<number>(initialFilters?.maxAge || 35);
  const [location, setLocation] = useState<string>(initialFilters?.location || "Anywhere");
  const [religion, setReligion] = useState<string>(initialFilters?.religion || "No preference");
  const [caste, setCaste] = useState<string>(initialFilters?.caste || "No preference");
  const [diet, setDiet] = useState<string>(initialFilters?.diet || "No preference");
  const [smoking, setSmoking] = useState<string>(initialFilters?.smoking || "No preference");
  const [alcohol, setAlcohol] = useState<string>(initialFilters?.drinking || "No preference");
  const [maritalStatus, setMaritalStatus] = useState<string>(
    initialFilters?.maritalStatus && initialFilters.maritalStatus.length > 0 
      ? initialFilters.maritalStatus[0] 
      : "No preference"
  );
  const [education, setEducation] = useState<string>(initialFilters?.education || "No preference");
  const [profession, setProfession] = useState<string>(initialFilters?.profession || "No preference");
  const [height, setHeight] = useState<string>(initialFilters?.height || "No preference");
  const [nationality, setNationality] = useState<string>(initialFilters?.nationality || "No preference");
  const [children, setChildren] = useState<string>(initialFilters?.children || "No preference");
  const [language, setLanguage] = useState<string>(initialFilters?.language || "No preference");
  const [marriagePlans, setMarriagePlans] = useState<string>("No preference");
  const [relocationPlans, setRelocationPlans] = useState<string>("No preference");

  // Navigation view state
  const [activeView, setActiveView] = useState<FilterSubView>("main");
  
  // Temporary selection for currently open sub-view
  const [tempValue, setTempValue] = useState<string>("");

  // Refs for scroll and screen view management
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top and align screen view whenever activeView changes
  useEffect(() => {
    // 1. Reset inner scroll body to top
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollTop = 0;
    }

    // 2. If entering a sub-view, ensure screen view is at the top of the filter panel
    if (activeView !== "main" && panelContainerRef.current) {
      const rect = panelContainerRef.current.getBoundingClientRect();
      // If the top of the panel is scrolled off-screen or out of optimal view:
      if (rect.top < 70 || rect.top > 160) {
        window.scrollTo({
          top: Math.max(0, window.scrollY + rect.top - 96),
          behavior: "smooth"
        });
      }
    }
  }, [activeView]);

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.minAge) setMinAge(initialFilters.minAge);
      if (initialFilters.maxAge) setMaxAge(initialFilters.maxAge);
      if (initialFilters.location) setLocation(initialFilters.location);
      if (initialFilters.religion) setReligion(initialFilters.religion);
      if (initialFilters.caste) setCaste(initialFilters.caste);
      if (initialFilters.diet) setDiet(initialFilters.diet);
      if (initialFilters.smoking) setSmoking(initialFilters.smoking);
      if (initialFilters.drinking) setAlcohol(initialFilters.drinking);
      if (initialFilters.education) setEducation(initialFilters.education);
      if (initialFilters.profession) setProfession(initialFilters.profession);
      if (initialFilters.height) setHeight(initialFilters.height);
      if (initialFilters.nationality) setNationality(initialFilters.nationality);
      if (initialFilters.children) setChildren(initialFilters.children);
      if (initialFilters.language) setLanguage(initialFilters.language);
      if (initialFilters.maritalStatus && initialFilters.maritalStatus.length > 0) {
        setMaritalStatus(initialFilters.maritalStatus[0]);
      }
    }
  }, [initialFilters]);

  // Open sub-view and initialize its temp state
  const openSubView = (view: FilterSubView) => {
    switch (view) {
      case "location": setTempValue(location); break;
      case "religion": setTempValue(religion); break;
      case "caste": setTempValue(caste); break;
      case "diet": setTempValue(diet); break;
      case "alcohol": setTempValue(alcohol); break;
      case "smoking": setTempValue(smoking); break;
      case "maritalStatus": setTempValue(maritalStatus); break;
      case "education": setTempValue(education); break;
      case "profession": setTempValue(profession); break;
      case "height": setTempValue(height); break;
      case "nationality": setTempValue(nationality); break;
      case "children": setTempValue(children); break;
      case "language": setTempValue(language); break;
      case "marriagePlans": setTempValue(marriagePlans); break;
      case "relocationPlans": setTempValue(relocationPlans); break;
    }
    setActiveView(view);

    if (typeof window !== "undefined") {
      if (scrollBodyRef.current) {
        scrollBodyRef.current.scrollTop = 0;
      }
      if (panelContainerRef.current) {
        const rect = panelContainerRef.current.getBoundingClientRect();
        if (rect.top < 70 || rect.top > 160) {
          window.scrollTo({
            top: Math.max(0, window.scrollY + rect.top - 96),
            behavior: "smooth"
          });
        }
      }
    }
  };

  // Confirm sub-view selection and return to main
  const handleConfirmSubView = () => {
    switch (activeView) {
      case "location": setLocation(tempValue); break;
      case "religion": 
        setReligion(tempValue); 
        setCaste("No preference");
        break;
      case "caste": setCaste(tempValue); break;
      case "diet": setDiet(tempValue); break;
      case "alcohol": setAlcohol(tempValue); break;
      case "smoking": setSmoking(tempValue); break;
      case "maritalStatus": setMaritalStatus(tempValue); break;
      case "education": setEducation(tempValue); break;
      case "profession": setProfession(tempValue); break;
      case "height": setHeight(tempValue); break;
      case "nationality": setNationality(tempValue); break;
      case "children": setChildren(tempValue); break;
      case "language": setLanguage(tempValue); break;
      case "marriagePlans": setMarriagePlans(tempValue); break;
      case "relocationPlans": setRelocationPlans(tempValue); break;
    }
    setActiveView("main");
  };

  const handleClearCurrentSubView = () => {
    const defaultVal = activeView === "location" ? "Anywhere" : "No preference";
    setTempValue(defaultVal);
  };

  const handleClearAll = () => {
    setMinAge(18);
    setMaxAge(60);
    setLocation("Anywhere");
    setReligion("No preference");
    setCaste("No preference");
    setDiet("No preference");
    setSmoking("No preference");
    setAlcohol("No preference");
    setMaritalStatus("No preference");
    setEducation("No preference");
    setProfession("No preference");
    setHeight("No preference");
    setNationality("No preference");
    setChildren("No preference");
    setLanguage("No preference");
    setMarriagePlans("No preference");
    setRelocationPlans("No preference");
    setActiveView("main");

    onApply({
      minAge: 18,
      maxAge: 60,
      location: "Anywhere",
      religion: "Doesn't matter",
      caste: "Doesn't matter",
      diet: "Doesn't matter",
      smoking: "Doesn't matter",
      drinking: "Doesn't matter",
      maritalStatus: [],
      education: "Doesn't matter",
      profession: "Doesn't matter",
      height: undefined,
      nationality: undefined,
      children: undefined,
      language: undefined
    });
  };

  const handleApply = () => {
    const filters: FeedFilterParams = {
      minAge,
      maxAge,
      location: location === "Anywhere" ? undefined : location,
      religion: religion === "No preference" ? undefined : religion,
      caste: caste === "No preference" ? undefined : caste,
      diet: diet === "No preference" ? undefined : diet,
      smoking: smoking === "No preference" ? undefined : smoking,
      drinking: alcohol === "No preference" ? undefined : (alcohol === "Drinks" ? "Drinks occasionally" : "Non-drinker"),
      maritalStatus: maritalStatus === "No preference" ? undefined : [maritalStatus],
      education: education === "No preference" ? undefined : education,
      profession: profession === "No preference" ? undefined : profession,
      height: height === "No preference" ? undefined : height,
      nationality: nationality === "No preference" ? undefined : nationality,
      children: children === "No preference" ? undefined : children,
      language: language === "No preference" ? undefined : language,
    };

    onApply(filters);
    if (onClose) onClose();
  };

  const currentSects = (SECTS[religion] || SECTS.Default);

  const getViewConfig = () => {
    switch (activeView) {
      case "location":
        return { title: "Location", options: LOCATIONS, type: "list" };
      case "religion":
        return { title: "Religion", options: RELIGIONS, type: "list" };
      case "caste":
        return { title: "Sect / Caste", options: currentSects, type: "list" };
      case "diet":
        return { title: "Diet", options: DIETS, type: "list" };
      case "alcohol":
        return { title: "Alcohol", options: ALCOHOL_OPTIONS, type: "list" };
      case "smoking":
        return { title: "Smoking", options: SMOKING_OPTIONS, type: "list" };
      case "maritalStatus":
        return { title: "Marital status", options: MARITAL_STATUSES, type: "list" };
      case "education":
        return { title: "Education", options: EDUCATION_OPTIONS, type: "list" };
      case "profession":
        return { title: "Profession", options: PROFESSION_OPTIONS, type: "list" };
      case "height":
        return { title: "Height", options: HEIGHT_OPTIONS, type: "list" };
      case "nationality":
        return { title: "Nationality", options: NATIONALITY_OPTIONS, type: "list" };
      case "children":
        return { title: "Children", options: CHILDREN_OPTIONS, type: "list" };
      case "language":
        return { title: "Language", options: LANGUAGE_OPTIONS, type: "list" };
      case "marriagePlans":
        return { title: "Marriage plans", options: MARRIAGE_PLAN_OPTIONS, type: "slider" };
      case "relocationPlans":
        return { title: "Relocation plans", options: RELOCATION_OPTIONS, type: "list" };
      default:
        return { title: "Filters", options: [], type: "none" };
    }
  };

  // -------------------------------------------------------------
  // SUB-VIEW RENDER (Images 3, 4, 5 Style - Full Filled Page to Bottom)
  // -------------------------------------------------------------
  if (activeView !== "main") {
    const config = getViewConfig();

    return (
      <div 
        ref={panelContainerRef}
        className="flex flex-col h-full w-full bg-[#FAF8F7] text-gray-900 rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
      >
        {/* Sub-view Header (Images 3, 4, 5) */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-20 shrink-0">
          <button 
            onClick={() => setActiveView("main")} 
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-700"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-bold font-serif text-gray-900">{config.title}</h3>
          
          <button 
            onClick={handleClearCurrentSubView} 
            className="text-sm font-semibold text-gray-400 hover:text-brand-900 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Sub-view Content Body (Scrollable with hidden scrollbar) */}
        <div 
          ref={scrollBodyRef}
          key={`subview-${activeView}`}
          className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-6"
        >
          {config.type === "slider" ? (
            /* Marriage Plans Slider (Image 4 Style) */
            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">{config.title}</span>
                <span className="text-sm font-semibold text-brand-900 bg-brand-50 px-3 py-1 rounded-full">
                  {tempValue || "No preference"}
                </span>
              </div>

              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max={MARRIAGE_PLAN_OPTIONS.length - 1}
                  step="1"
                  value={Math.max(0, MARRIAGE_PLAN_OPTIONS.indexOf(tempValue))}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setTempValue(MARRIAGE_PLAN_OPTIONS[idx]);
                  }}
                  className="w-full accent-brand-900 cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>No preference</span>
                  <span>2+ years</span>
                </div>
              </div>
            </div>
          ) : (
            /* Option List (Image 5 Style) */
            <div className="space-y-1">
              {config.options.map((opt) => {
                const isSelected = tempValue === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setTempValue(opt)}
                    className="w-full flex items-center justify-between py-3.5 border-b border-gray-100 text-left transition-colors group"
                  >
                    <span className={`text-base font-semibold ${isSelected ? "text-brand-900 font-bold" : "text-gray-900"}`}>
                      {opt}
                    </span>
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-brand-900 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-gray-300" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Confirm Button RIGHT BELOW OPTIONS */}
          <div className="pt-3 pb-2">
            <button
              onClick={handleConfirmSubView}
              className="w-full py-3.5 bg-brand-900 text-white rounded-full font-bold hover:bg-brand-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center text-base"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MASTER FILTER LIST VIEW (Full Height to Bottom)
  // -------------------------------------------------------------
  return (
    <div 
      ref={panelContainerRef}
      className="flex flex-col h-full w-full bg-[#FAF8F7] text-gray-900 rounded-3xl overflow-hidden border border-gray-100 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-20 shrink-0">
        {onClose ? (
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center text-brand-900">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        )}
        
        <h2 className="text-xl font-bold font-serif text-gray-900">Filters</h2>
        
        <button 
          onClick={handleClearAll} 
          className="text-sm font-semibold text-brand-900 hover:text-brand-800 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Filter Body (Scrollable with hidden scrollbar) */}
      <div 
        ref={activeView === "main" ? scrollBodyRef : undefined}
        key="main-view-body"
        className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6"
      >
        
        {/* Age Slider Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-bold text-gray-900">Age</span>
            <span className="text-sm font-semibold text-brand-900 bg-brand-50 px-2.5 py-0.5 rounded-full">
              {minAge} - {maxAge} years
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Min: {minAge}</span>
                <span>Max: {maxAge}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Min Age</label>
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={minAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= maxAge) setMinAge(val);
                    }}
                    className="w-full accent-brand-900 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Max Age</label>
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={maxAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= minAge) setMaxAge(val);
                    }}
                    className="w-full accent-brand-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Location & Identity Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          <FilterRow
            label="Limit location by"
            value={location}
            onClick={() => openSubView("location")}
          />
          <FilterRow
            label="Religion"
            value={religion}
            onClick={() => openSubView("religion")}
            isPriority={religion !== "No preference"}
          />
          <FilterRow
            label="Sect / Caste"
            value={caste}
            onClick={() => openSubView("caste")}
          />
        </div>

        {/* Category: Religiosity & Lifestyle */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A07079] px-2 mb-2 flex items-center gap-1.5">
            <span>Religiosity & Lifestyle</span>
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            <FilterRow
              label="Diet"
              value={diet}
              onClick={() => openSubView("diet")}
              isPriority={diet !== "No preference"}
            />
            <FilterRow
              label="Alcohol"
              value={alcohol}
              onClick={() => openSubView("alcohol")}
            />
            <FilterRow
              label="Smoking"
              value={smoking}
              onClick={() => openSubView("smoking")}
            />
          </div>
        </div>

        {/* Category: Profile & Background */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A07079] px-2 mb-2 flex items-center gap-1.5">
            <span>ABOUT THEM</span>
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            <FilterRow
              label="Height"
              value={height}
              onClick={() => openSubView("height")}
            />
            <FilterRow
              label="Nationality"
              value={nationality}
              onClick={() => openSubView("nationality")}
            />
            <FilterRow
              label="Language"
              value={language}
              onClick={() => openSubView("language")}
            />
            <FilterRow
              label="Children"
              value={children}
              onClick={() => openSubView("children")}
            />
            <FilterRow
              label="Marital status"
              value={maritalStatus}
              onClick={() => openSubView("maritalStatus")}
            />
            <FilterRow
              label="Education"
              value={education}
              onClick={() => openSubView("education")}
            />
            <FilterRow
              label="Profession"
              value={profession}
              onClick={() => openSubView("profession")}
            />
          </div>
        </div>

        {/* Category: Future Plans */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A07079] px-2 mb-2 flex items-center gap-1.5">
            <span>Future Plans</span>
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            <FilterRow
              label="Marriage plans"
              value={marriagePlans}
              onClick={() => openSubView("marriagePlans")}
            />
            <FilterRow
              label="Relocation plans"
              value={relocationPlans}
              onClick={() => openSubView("relocationPlans")}
            />
          </div>
        </div>

      </div>

      {/* Bottom Pinned Apply Button */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <button
          onClick={handleApply}
          className="w-full py-3.5 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center text-base"
        >
          <span>Apply Filters</span>
        </button>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  value,
  onClick,
  isPriority = false
}: {
  label: string;
  value: string;
  onClick: () => void;
  isPriority?: boolean;
}) {
  const isSelected = value && value !== "No preference" && value !== "Anywhere";

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          {label}
          {isPriority && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-900" />
          )}
        </span>
        <span className={`text-xs mt-0.5 font-medium ${isSelected ? "text-brand-900 font-semibold" : "text-gray-400"}`}>
          {value || "No preference"}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );
}
