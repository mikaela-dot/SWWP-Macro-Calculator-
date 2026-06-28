/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MetricRingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string; // Tailwind color classes for stroke
  bgStrokeClass?: string;
  id?: string;
}

export default function MetricRing({
  label,
  current,
  target,
  unit,
  colorClass,
  bgStrokeClass = "stroke-daydream/40",
  id
}: MetricRingProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  // SVG Ring values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Let's refine color mapping to match our organic perimenopause palette
  let editorialStroke = "stroke-kale";
  let editorialTextLabel = "text-kale";
  if (label.toLowerCase() === 'fuel' || label.toLowerCase() === 'calories') {
    editorialStroke = "stroke-kale";
    editorialTextLabel = "text-kale";
  } else if (label.toLowerCase().includes('carb')) {
    editorialStroke = "stroke-cinnamon";
    editorialTextLabel = "text-cinnamon";
  } else if (label.toLowerCase().includes('protein')) {
    editorialStroke = "stroke-sage";
    editorialTextLabel = "text-sage";
  } else if (label.toLowerCase().includes('fat')) {
    editorialStroke = "stroke-kale/70";
    editorialTextLabel = "text-kale/70";
  }

  return (
    <div id={id} className="bg-coconut/50 rounded-[30px] p-6 border border-daydream flex flex-col items-center justify-between text-center min-w-[130px] shadow-sm">
      <span className="text-sm font-serif italic text-kale tracking-wide capitalize">{label.toLowerCase()}</span>
      
      <div className="relative w-24 h-24 my-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${bgStrokeClass}`}
            strokeWidth="5"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`transition-all duration-700 ease-out ${editorialStroke}`}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Text values */}
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-serif font-bold tracking-tight text-kale leading-none">
            {Math.round(current)}
          </span>
          <span className="text-sm text-kale/60 font-serif font-medium tracking-tight mt-0.5">
            /{Math.round(target)}{unit}
          </span>
        </div>
      </div>

      <div className="text-sm uppercase font-serif font-bold italic tracking-wide text-cinnamon bg-coconut/80 px-2.5 py-1 rounded-full border border-daydream">
        {Math.round((current / (target || 1)) * 100)}% Fulfilled
      </div>
    </div>
  );
}
