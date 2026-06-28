/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, MenstrualPhase } from '../types';
import { calculateCycleDay, calculatePhase, getPhaseInfo } from '../data/physiology';
import { Calendar, Play, Snowflake, Award, Sparkles, Moon } from 'lucide-react';

interface CycleTimelineProps {
  profile: UserProfile;
  currentDateStr: string;
  onPreviewPhase?: (phase: MenstrualPhase) => void;
  id?: string;
}

export default function CycleTimeline({
  profile,
  currentDateStr,
  onPreviewPhase,
  id
}: CycleTimelineProps) {
  const isCycling = profile.lifecycle === 'regular' || profile.lifecycle === 'perimenopause';
  const cycleDay = calculateCycleDay(profile.lastPeriodDate, profile.cycleLength, currentDateStr);
  const currentPhase = calculatePhase(profile, currentDateStr);

  // Selected phase to preview on the dashboard
  const [activeTab, setActiveTab] = useState<MenstrualPhase>(
    isCycling ? currentPhase : 'none'
  );

  const phaseDetails = getPhaseInfo(activeTab, profile.lifecycle);

  // Phases of regular menstrual cycle for tabs
  const cyclingPhases: { id: MenstrualPhase; label: string; days: string; icon: any }[] = [
    { 
      id: 'menstrual', 
      label: 'Menstrual', 
      days: `Days 1-${profile.periodLength}`, 
      icon: <Snowflake className="h-3.5 w-3.5" /> 
    },
    { 
      id: 'follicular', 
      label: 'Follicular', 
      days: `Days ${profile.periodLength + 1}-12`, 
      icon: <Sparkles className="h-3.5 w-3.5" /> 
    },
    { 
      id: 'ovulatory', 
      label: 'Ovulatory', 
      days: 'Days 13-15', 
      icon: <Award className="h-3.5 w-3.5" /> 
    },
    { 
      id: 'luteal', 
      label: 'Luteal', 
      days: `Days 16-${profile.cycleLength}`, 
      icon: <Moon className="h-3.5 w-3.5" /> 
    }
  ];

  // Hormone Level Estimation Spark-bar generator
  const getHormoneLevels = (p: MenstrualPhase) => {
    switch (p) {
      case 'menstrual':
        return { estrogen: 15, progesterone: 10 };
      case 'follicular':
        return { estrogen: 65, progesterone: 12 };
      case 'ovulatory':
        return { estrogen: 95, progesterone: 18 };
      case 'luteal':
        return { estrogen: 50, progesterone: 85 };
      default:
        return { estrogen: 15, progesterone: 15 };
    }
  };

  const selectedHormones = getHormoneLevels(activeTab);

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-[0_4px_30px_rgba(26,26,26,0.01)] flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="flex items-baseline justify-between border-b border-daydream pb-5">
        <div>
          <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">
            Dynamic Lifecycle Sync
          </span>
          <h2 className="text-2xl font-serif italic tracking-tight text-kale mt-1 capitalize">
            {profile.lifecycle === 'regular' ? 'Natural Menstrual Cycle Syncing' : `${profile.lifecycle} Physiology Window`}
          </h2>
        </div>
        {isCycling && (
          <div className="text-sm uppercase tracking-widest font-semibold text-cinnamon font-mono flex items-center gap-2">
            <span>Cycle Day {cycleDay}</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60">{profile.cycleLength} Days Total</span>
          </div>
        )}
      </div>

      {/* Cycle Timeline Ruler (For regular cyclers) */}
      {isCycling && (
        <div className="flex flex-col gap-3">
          <span className="text-sm uppercase tracking-widest font-bold text-kale/60 font-mono">menstrual timeline ruler</span>
          <div className="relative pt-6 pb-2 px-1">
            {/* Horizontal Continuous Line */}
            <div className="h-2 w-full bg-kale/10 rounded-full flex overflow-hidden">
              <div className="h-full bg-cinnamon/50" style={{ width: `${(profile.periodLength / profile.cycleLength) * 100}%` }} />
              <div className="h-full bg-sage/40" style={{ width: `${((12 - profile.periodLength) / profile.cycleLength) * 100}%` }} />
              <div className="h-full bg-cinnamon" style={{ width: `${(3 / profile.cycleLength) * 100}%` }} />
              <div className="h-full bg-kale/40" style={{ width: `${((profile.cycleLength - 15) / profile.cycleLength) * 100}%` }} />
            </div>

            {/* Float Label showing Day cursor */}
            <div 
              className="absolute -top-1.5 transform -translate-x-1/2 flex flex-col items-center gap-0.5 duration-500 ease-out"
              style={{ left: `${((cycleDay - 1) / profile.cycleLength) * 100}%` }}
            >
              <span className="bg-kale text-coconut font-mono text-sm font-bold px-2 py-0.5 rounded-none tracking-widest uppercase">
                Day {cycleDay}
              </span>
              <Play className="h-2 w-2 fill-kale text-kale transform rotate-90" />
            </div>

            {/* Labels and Days under timeline */}
            <div className="flex justify-between text-xs font-bold text-kale/55 font-mono mt-2 uppercase tracking-wider">
              <span className="text-cinnamon">Day 1</span>
              <span className="text-kale/70">Day 14</span>
              <span className="text-kale/55">Day {profile.cycleLength}</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase selection tabs */}
      {isCycling && (
        <div className="flex flex-wrap gap-1.5 bg-coconut/60 p-1 rounded-2xl border border-daydream">
          {cyclingPhases.map((tab) => {
            const isSelected = activeTab === tab.id;
            const isToday = currentPhase === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onPreviewPhase) onPreviewPhase(tab.id);
                }}
                className={`flex-1 min-w-[100px] text-sm py-2.5 px-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all outline-none ${
                  isSelected 
                    ? 'bg-kale text-coconut font-serif italic' 
                    : 'text-kale/60 hover:text-kale hover:bg-kale/5'
                }`}
              >
                {tab.icon}
                <div className="text-left flex flex-col">
                  <span className="leading-tight flex items-center gap-1 font-bold">
                    {tab.label}
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cinnamon animate-pulse" title="Active Phase Today" />
                    )}
                  </span>
                  <span className="text-sm opacity-60 leading-none mt-0.5 font-mono">{tab.days}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Hormone Level Indicator for regular cyclers */}
      {isCycling && (
        <div className="bg-coconut/60 rounded-[24px] p-5 border border-daydream flex gap-6 items-center">
          <div className="shrink-0 text-left">
            <span className="text-sm font-bold uppercase text-kale/50 font-mono block tracking-wider">Estimated</span>
            <span className="text-sm font-serif italic text-kale font-bold">Hormone Waves</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {/* Estrogen */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-kale/60 w-20 shrink-0 tracking-wider">Estrogen:</span>
              <div className="flex-1 h-2 bg-kale/10 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-cinnamon rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${selectedHormones.estrogen}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-kale w-14 shrink-0 text-right capitalize">
                {phaseDetails.hormoneLevels.estrogen}
              </span>
            </div>

            {/* Progesterone */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-kale/60 w-20 shrink-0 tracking-wider">Progest.:</span>
              <div className="flex-1 h-2 bg-kale/10 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-kale rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${selectedHormones.progesterone}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-kale w-14 shrink-0 text-right capitalize">
                {phaseDetails.hormoneLevels.progesterone}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Physiological Strategy output (Card description) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-daydream pt-6">
        <div className="bg-coconut border border-daydream p-5 rounded-[24px] shadow-sm">
          <span className="text-sm font-bold text-cinnamon uppercase tracking-widest block font-sans">
            Physiology Focus
          </span>
          <h4 className="font-serif italic text-sm text-kale mt-1.5 font-bold">
            {phaseDetails.displayName}
          </h4>
          <p className="text-sm text-kale leading-relaxed mt-2.5 font-sans font-normal">
            {phaseDetails.physiologySummary}
          </p>
        </div>

        <div className="bg-coconut border border-daydream p-5 rounded-[24px] shadow-sm">
          <span className="text-sm font-bold text-cinnamon uppercase tracking-widest block font-sans">
            Nutritional Protocols
          </span>
          <h4 className="font-serif italic text-sm text-kale mt-1.5 font-bold">
            Macro-Somatic Guidance
          </h4>
          <p className="text-sm text-kale leading-relaxed mt-2.5 font-sans font-normal">
            {phaseDetails.nutritionStrategy}
          </p>
        </div>

        <div className="bg-coconut border border-daydream p-5 rounded-[24px] shadow-sm">
          <span className="text-sm font-bold text-cinnamon uppercase tracking-widest block font-sans">
            Neuromuscular Loading
          </span>
          <h4 className="font-serif italic text-sm text-kale mt-1.5 font-bold">
            Training Adaptation
          </h4>
          <p className="text-sm text-kale leading-relaxed mt-2.5 font-sans font-normal">
            {phaseDetails.trainingStrategy}
          </p>
        </div>
      </div>

      {/* Target Macros breakdown of this phase */}
      <div className="border-t border-daydream pt-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm uppercase font-bold tracking-widest text-kale/60">Research Guidelines:</span>
          <span className="text-sm bg-kale font-mono text-coconut px-3 py-1 uppercase tracking-widest">
            Carb {phaseDetails.targetMacroRatio.carbs}% / Pro {phaseDetails.targetMacroRatio.protein}% / Fat {phaseDetails.targetMacroRatio.fat}%
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 w-full">
          {phaseDetails.keyNutrients.map((n, i) => (
            <span key={i} className="text-xs font-mono font-bold border border-daydream text-kale px-2.5 py-1 uppercase tracking-wider bg-coconut rounded-lg">
              {n}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
