"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { RegistrationDay } from "../../admin.api";

interface AdminRegistrationChartProps {
  data?: RegistrationDay[];
  isLoading: boolean;
}

export function AdminRegistrationChart({ data = [], isLoading }: AdminRegistrationChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<RegistrationDay & { x: number; y: number } | null>(null);

  const totalWeekly = data.reduce((acc, curr) => acc + curr.count, 0);
  const avgDaily = data.length > 0 ? (totalWeekly / data.length).toFixed(1) : "0";

  // Chart Dimensions
  const height = 180;
  const width = 600;
  const paddingX = 40;
  const paddingY = 25;

  const maxCount = Math.max(...data.map((d) => d.count), 5);

  // Compute SVG Points
  const points = data.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / Math.max(data.length - 1, 1);
    const y = height - paddingY - (d.count / maxCount) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const colWidth = points.length > 1 ? (width - 2 * paddingX) / (points.length - 1) : width;

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-gray-50 text-brand-900 border border-gray-100">
              <UserPlus className="w-4 h-4" />
            </span>
            <h3 className="font-sans font-bold text-base text-gray-900">
              Registration Growth
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Daily newly registered profiles over the last 7 days
          </p>
        </div>

        {/* Weekly Summary Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-brand-50/70 border border-brand-100/60 text-brand-900 font-semibold">
            +{totalWeekly} New Users
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 font-medium">
            ~{avgDaily}/day avg
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div 
        className="relative w-full flex-1 flex flex-col justify-center my-auto min-h-[220px] pt-4"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">
            Loading registration trends...
          </div>
        ) : (
          <div className="relative w-full flex-1 flex flex-col justify-center">
            {/* Floating Tooltip - Absolute overlay prevents layout shifts / flickering */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 ease-out"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100}%`,
                  transform: "translate(-50%, -130%)",
                }}
              >
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-xl border border-gray-800 text-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] text-gray-400 font-medium">
                    {hoveredPoint.day} • {hoveredPoint.date}
                  </div>
                  <div className="text-xs font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
                    <span className="text-amber-300 font-extrabold">{hoveredPoint.count}</span>
                    <span>registrations</span>
                  </div>
                </div>
              </div>
            )}

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-56 sm:h-60 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="niraLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7a303f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7a303f" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio, i) => {
                const y = height - paddingY - ratio * (height - 2 * paddingY);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#F1EAE8"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Fill */}
              {areaD && <path d={areaD} fill="url(#niraLineGradient)" />}

              {/* Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#7a303f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Vertical Guide Lines for Hovered Point */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={paddingY}
                  x2={hoveredPoint.x}
                  y2={height - paddingY}
                  stroke="#7a303f"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Points */}
              {points.map((pt, i) => {
                const isHovered = hoveredPoint?.date === pt.date;
                return (
                  <g key={i}>
                    {/* Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "6" : "4"}
                      fill={isHovered ? "#7a303f" : "#ffffff"}
                      stroke="#7a303f"
                      strokeWidth={isHovered ? "2.5" : "3"}
                      className="transition-all duration-150 pointer-events-none"
                    />

                    {/* Bottom Day Label */}
                    <text
                      x={pt.x}
                      y={height - 5}
                      textAnchor="middle"
                      className={`text-[11px] font-semibold transition-colors ${
                        isHovered ? "fill-brand-900 font-bold" : "fill-gray-400"
                      }`}
                    >
                      {pt.day}
                    </text>

                    {/* Invisible full-height hit area for effortless hovering */}
                    <rect
                      x={pt.x - colWidth / 2}
                      y={paddingY}
                      width={colWidth}
                      height={height - paddingY}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
