/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { calculateEnergyAvailability } from '../data/physiology';
import { Shield, HardHat, Info, Activity, Flame } from 'lucide-react';

interface EnergyAvailabilityCardProps {
  calorieIntake: number;
  exerciseExpenditure: number;
  weightKg: number;
  bodyFatPercent: number;
  id?: string;
}

export default function EnergyAvailabilityCard({
  calorieIntake,
  exerciseExpenditure,
  weightKg,
  bodyFatPercent,
  id
}: EnergyAvailabilityCardProps) {
  // Show pending state if food intake is very low relative to exercise
  // Avoids false danger readings mid-day before meals are logged
  const noDataYet = calorieIntake < exerciseExpenditure || calorieIntake < 200;
  const { ffm, ea, status, explanation } = calculateEnergyAvailability(
    noDataYet ? exerciseExpenditure + 500 : calorieIntake,
    exerciseExpenditure,
    weightKg,
    bodyFatPercent
  );

  // Status mapping
  const statusStyles = {
    danger: {
      bg: "bg-coconut/80 border-cinnamon/30",
      text: "text-kale",
      pill: "bg-cinnamon text-coconut",
      border: "border-cinnamon",
      progressBg: "bg-cinnamon",
      title: "REDs Danger Zone (<30)",
      icon: <Flame className="h-4 w-4 text-cinnamon" />
    },
    caution: {
      bg: "bg-coconut/55 border-daydream",
      text: "text-kale",
      pill: "bg-sage text-coconut",
      border: "border-daydream",
      progressBg: "bg-sage",
      title: "Low Energy Availability (30-45)",
      icon: <Info className="h-4 w-4 text-sage" />
    },
    optimal: {
      bg: "bg-coconut/80 border-daydream",
      text: "text-kale",
      pill: "bg-kale text-coconut",
      border: "border-kale",
      progressBg: "bg-kale",
      title: "Optimal Energy Window (45-60)",
      icon: <Shield className="h-4 w-4 text-kale" />
    },
    surplus: {
      bg: "bg-coconut/40 border-daydream",
      text: "text-kale",
      pill: "bg-kale/70 text-coconut",
      border: "border-daydream",
      progressBg: "bg-kale/70",
      title: "Anabolic / Surplus Window (>60)",
      icon: <Activity className="h-4 w-4 text-kale/70" />
    }
  };

  const currentStyle = statusStyles[status];

  // Helper to map current EA position representing percentage on progress line
  // 0 to 75 range represent standard range
  const widthPercentage = Math.min((ea / 75) * 100, 100);

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-[0_4px_30px_rgba(26,26,26,0.01)] flex flex-col justify-between h-full min-h-[380px]">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">
              Critical Screen
            </span>
            <h3 className="text-xl font-serif italic text-kale tracking-tight leading-tight mt-1 flex items-center gap-2">
              Energy Status (EA)
            </h3>
          </div>
          <div className="text-right">
            <span className="text-4xl font-serif font-bold tracking-tight text-kale block leading-none">
              {noDataYet ? "—" : ea}
            </span>
            <span className="text-sm text-cinnamon font-serif italic uppercase tracking-wider block mt-1 font-bold">
              kcal/kg FFM/day
            </span>
          </div>
        </div>
        
        <p className="text-sm text-kale/75 mt-2 leading-relaxed">
          Dynamic energy screening safeguarding you against systemic fatigue and Relative Energy Deficiency.
        </p>
      </div>

      {/* Progress alignment line */}
      <div className="mt-5">
        <div className="h-1.5 w-full bg-kale/10 rounded-full relative">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${currentStyle.progressBg}`} 
            style={{ width: `${widthPercentage}%` }}
          />
          {/* Tick markers */}
          <div className="absolute left-[40%] top-0 h-2.5 w-0.5 bg-kale/30 -translate-y-0.5" title="Low EA limit (30)" />
          <div className="absolute left-[60%] top-0 h-2.5 w-0.5 bg-kale/30 -translate-y-0.5" title="Optimal Threshold (45)" />
        </div>
        
        <div className="flex justify-between text-sm text-kale/50 font-bold mt-1.5 uppercase tracking-widest font-mono">
          <span>0</span>
          <span className="text-cinnamon">30 (Danger limit)</span>
          <span className="text-kale">45 (Optimal)</span>
          <span>75+</span>
        </div>
      </div>

      {/* Warning / Feedback Box */}
      <div className={`mt-5 p-5 rounded-[24px] border ${currentStyle.bg} flex gap-3 transition-colors duration-300`}>
        <div className="shrink-0 mt-0.5">{currentStyle.icon}</div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-sans font-extrabold text-sm uppercase tracking-wider text-kale">
              {currentStyle.title}
            </h4>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-none ${currentStyle.pill}`}>
              {status}
            </span>
          </div>
          <p className="text-sm leading-relaxed mt-1 font-sans text-kale font-normal">
            {explanation}
          </p>
        </div>
      </div>

      {/* Math Formulation footer */}
      <div className="mt-5 pt-4 border-t border-daydream flex flex-wrap justify-between items-center text-sm text-kale/60 font-mono">
        <div>
          <span>Fat-Free Mass: </span>
          <span className="font-extrabold text-kale">{ffm} kg</span>
        </div>
        <div className="italic text-right text-sm opacity-75">
          ({Math.round(calorieIntake)} - {Math.round(exerciseExpenditure)}) / {ffm}
        </div>
      </div>
    </div>
  );
}
