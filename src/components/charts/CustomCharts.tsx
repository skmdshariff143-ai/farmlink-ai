"use client";

import React, { useState } from "react";
import { TrendingUp, DollarSign, Sprout, BarChart3, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

// Interface for Chart Data
interface ChartPoint {
  label: string;
  value: number;
  value2?: number;
}

// 1. Price Trend Chart (Line Chart)
export function PriceTrendChart() {
  const [selectedCrop, setSelectedCrop] = useState<"rice" | "wheat" | "potato">("rice");
  
  const cropData: Record<"rice" | "wheat" | "potato", ChartPoint[]> = {
    rice: [
      { label: "Jan", value: 58 },
      { label: "Feb", value: 60 },
      { label: "Mar", value: 59 },
      { label: "Apr", value: 63 },
      { label: "May", value: 62 },
      { label: "Jun", value: 65 },
    ],
    wheat: [
      { label: "Jan", value: 28 },
      { label: "Feb", value: 29 },
      { label: "Mar", value: 32 },
      { label: "Apr", value: 31 },
      { label: "May", value: 30 },
      { label: "Jun", value: 32 },
    ],
    potato: [
      { label: "Jan", value: 18 },
      { label: "Feb", value: 16 },
      { label: "Mar", value: 17 },
      { label: "Apr", value: 22 },
      { label: "May", value: 24 },
      { label: "Jun", value: 24 },
    ]
  };

  const data = cropData[selectedCrop];
  const maxVal = Math.max(...data.map(d => d.value)) * 1.2;
  const minVal = 0;
  
  // Chart dimensions
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, label: d.label, val: d.value };
  });

  // Construct path string
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area path string (close shape to bottom)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-text-charcoal flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            AI Mandi Price Prediction Trends
          </h4>
          <p className="text-[10px] text-gray-500">6-Month historical price index (₹/kg)</p>
        </div>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value as any)}
          className="text-[10px] font-bold border border-border-nature rounded-xl px-2.5 py-1.5 bg-bg-nature/40 dark:bg-card-bg text-text-charcoal outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="rice">Rice (Basmati)</option>
          <option value="wheat">Wheat (Sharbati)</option>
          <option value="potato">Potato (Red Desi)</option>
        </select>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const gridVal = Math.round(maxVal - ratio * (maxVal - minVal));
            return (
              <g key={idx} className="opacity-30 dark:opacity-10">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1b5e20" strokeWidth="1" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fontWeight="600" className="fill-gray-400">{gridVal}</text>
              </g>
            );
          })}

          {/* Area under curve with gradient */}
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#chart-area-grad)" />

          {/* Line Curve */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#8BC34A"
                stroke="#2E7D32"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:r-7"
              />
              {/* Tooltip text on top */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 fill-primary transition-opacity duration-200"
              >
                ₹{p.val}
              </text>
              {/* X Axis Labels */}
              <text x={p.x} y={paddingTop + chartHeight + 16} textAnchor="middle" fontSize="10" fontWeight="600" className="fill-gray-400">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// 2. Revenue & Orders Analytics (Bar Chart)
export function RevenueChart() {
  const data: ChartPoint[] = [
    { label: "Mon", value: 4200, value2: 12 },
    { label: "Tue", value: 3800, value2: 8 },
    { label: "Wed", value: 6500, value2: 18 },
    { label: "Thu", value: 8900, value2: 24 },
    { label: "Fri", value: 7400, value2: 15 },
    { label: "Sat", value: 9200, value2: 28 },
    { label: "Sun", value: 5500, value2: 14 },
  ];

  const maxVal = 10000;
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const barWidth = 32;
  const gap = (chartWidth - barWidth * data.length) / (data.length - 1);

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-text-charcoal flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" />
            Weekly Transaction Volume
          </h4>
          <p className="text-[10px] text-gray-500">Gross revenue and completed sales payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
            <span className="text-[9px] font-bold text-gray-500">Sales (₹)</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const gridVal = Math.round(maxVal - ratio * maxVal);
            return (
              <g key={idx} className="opacity-30 dark:opacity-10">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1b5e20" strokeWidth="1" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fontWeight="600" className="fill-gray-400">
                  {gridVal >= 1000 ? `${gridVal/1000}k` : gridVal}
                </text>
              </g>
            );
          })}

          {/* Bar rendering */}
          {data.map((d, idx) => {
            const x = paddingLeft + idx * (barWidth + gap);
            const barHeight = (d.value / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;

            return (
              <g key={idx} className="group cursor-pointer">
                {/* Background full height column for better hover target */}
                <rect x={x} y={paddingTop} width={barWidth} height={chartHeight} fill="transparent" />

                {/* Actual animated bar */}
                <motion.rect
                  initial={{ height: 0, y: paddingTop + chartHeight }}
                  animate={{ height: barHeight, y }}
                  transition={{ duration: 1, delay: idx * 0.05, ease: "easeOut" }}
                  x={x}
                  width={barWidth}
                  rx="6"
                  className="fill-primary group-hover:fill-secondary transition-all"
                />

                {/* Tooltip value */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  className="opacity-0 group-hover:opacity-100 fill-primary transition-opacity"
                >
                  ₹{d.value}
                </text>

                {/* X Axis Label */}
                <text x={x + barWidth / 2} y={paddingTop + chartHeight + 16} textAnchor="middle" fontSize="10" fontWeight="600" className="fill-gray-400">{d.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// 3. Supply vs Demand Forecast Area Chart
export function DemandForecastChart() {
  const data: ChartPoint[] = [
    { label: "Week 1", value: 300, value2: 450 },
    { label: "Week 2", value: 400, value2: 430 },
    { label: "Week 3", value: 550, value2: 480 },
    { label: "Week 4", value: 680, value2: 520 },
    { label: "Week 5", value: 720, value2: 600 },
    { label: "Week 6", value: 850, value2: 780 },
  ];

  const maxVal = 1000;
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinate math
  const line1Points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y };
  });

  const line2Points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value2! / maxVal) * chartHeight;
    return { x, y };
  });

  const path1 = line1Points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
  const path2 = line2Points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-text-charcoal flex items-center gap-1.5">
            <Sprout className="h-4 w-4 text-primary" />
            AI Demand & Supply Modeler
          </h4>
          <p className="text-[10px] text-gray-500">Comparing market availability (Tons) vs buyer order requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-1.5 bg-primary rounded-full" />
            <span className="text-[9px] font-bold text-gray-500">Supply</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[9px] font-bold text-gray-500">Demand</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            return (
              <line key={idx} x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1b5e20" strokeWidth="1" className="opacity-10" />
            );
          })}

          {/* Line 1 (Supply) */}
          <path d={path1} fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />

          {/* Line 2 (Demand) */}
          <path d={path2} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

          {/* X axis labels */}
          {data.map((d, index) => {
            const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
            return (
              <text key={index} x={x} y={paddingTop + chartHeight + 16} textAnchor="middle" fontSize="10" fontWeight="600" className="fill-gray-400">
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
