"use client";

import { PieChart } from "lucide-react";

interface AdminGenderChartProps {
  genderRatio?: {
    male: number;
    female: number;
    other: number;
  };
  isLoading: boolean;
}

export function AdminGenderChart({ genderRatio, isLoading }: AdminGenderChartProps) {
  const male = genderRatio?.male || 0;
  const female = genderRatio?.female || 0;
  const other = genderRatio?.other || 0;
  const total = male + female + other;

  const malePercent = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((female / total) * 100) : 0;

  // Donut SVG circumference calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeDash = (malePercent / 100) * circumference;
  const femaleStrokeDash = (femalePercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-gray-50 text-brand-900 border border-gray-100">
            <PieChart className="w-4 h-4" />
          </span>
          <h3 className="font-sans font-bold text-base text-gray-900">
            Gender Demographics
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Male vs Female distribution across registered members
        </p>
      </div>

      {/* SVG Donut Chart */}
      <div className="py-6 flex items-center justify-center">
        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">
            Calculating gender ratio...
          </div>
        ) : total === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">
            No member data yet
          </div>
        ) : (
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-gray-100"
                strokeWidth="18"
                fill="transparent"
              />

              {/* Female Segment (Pink/Rose) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#E88B9E] transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={`${femaleStrokeDash} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
              />

              {/* Male Segment (Brand Wine) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#7a303f] transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={`${maleStrokeDash} ${circumference}`}
                strokeDashoffset={`-${femaleStrokeDash}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-sans text-gray-900 tracking-tight">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Members
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7a303f]"></span>
            <span className="font-semibold text-gray-700">Male</span>
          </div>
          <div className="text-base font-bold font-sans text-brand-900">
            {male} <span className="text-xs font-sans text-gray-500 font-normal">({malePercent}%)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-100/60">
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E88B9E]"></span>
            <span className="font-semibold text-gray-700">Female</span>
          </div>
          <div className="text-base font-bold font-sans text-rose-800">
            {female} <span className="text-xs font-sans text-gray-500 font-normal">({femalePercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
