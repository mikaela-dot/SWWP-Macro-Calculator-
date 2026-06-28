/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, LifecycleType, ActivityLevel, BmrFormula } from '../types';
import { Save, UserCog, CalendarClock, Dna } from 'lucide-react';
import { calculateCycleDay } from '../data/physiology';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onUpdateOffset: (offset: 0 | 150 | 250) => void;
  id?: string;
  currentDateStr?: string;
}

export default function ProfileSettings({
  profile,
  onSaveProfile,
  onUpdateOffset,
  id,
  currentDateStr
}: ProfileSettingsProps) {
  const getTodayLocal = (): string => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  const activeAnchor = currentDateStr || getTodayLocal();

  const [lifecycle, setLifecycle] = useState<LifecycleType>(profile.lifecycle);
  const [weightKg, setWeightKg] = useState<number | ''>(profile.weightKg);
  const [heightCm, setHeightCm] = useState<number | ''>(profile.heightCm);
  const [age, setAge] = useState<number | ''>(profile.age);
  const [bodyFatPercent, setBodyFatPercent] = useState<number | ''>(profile.bodyFatPercent);
  const [cycleLength, setCycleLength] = useState<number | ''>(profile.cycleLength);
  const [periodLength, setPeriodLength] = useState<number | ''>(profile.periodLength);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(profile.lastPeriodDate);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [trainingGoal, setTrainingGoal] = useState<UserProfile['trainingGoal']>(profile.trainingGoal);
  const [adjustForExercise, setAdjustForExercise] = useState<boolean>(profile.adjustForExercise || false);
  const [proteinGoal, setProteinGoal] = useState<'wellness' | 'maintain' | 'recompose' | 'custom'>(
    profile?.proteinGoal || (
      profile?.lifecycle === 'menopause' ? 'recompose' : 'maintain'
    )
  );
  const [bmrFormula, setBmrFormula] = useState<BmrFormula>(profile.bmrFormula || 'cunningham');

  // Custom Macro parameters (Grams / Percentages split override)
  const [metabolicOffset, setMetabolicOffset] = useState<0 | 150 | 250>(profile.metabolicOffset || 0);
  const offsetUserSet = useRef(false); // tracks if user has manually selected an offset
  const [useCustomMacros, setUseCustomMacros] = useState<boolean>(profile.useCustomMacros || false);
  const [customMacroType, setCustomMacroType] = useState<'percentage' | 'grams'>(profile.customMacroType || 'percentage');
  const [customCarbsVal, setCustomCarbsVal] = useState<number | ''>(profile.customCarbsVal !== undefined ? profile.customCarbsVal : '');
  const [customProteinVal, setCustomProteinVal] = useState<number | ''>(profile.customProteinVal !== undefined ? profile.customProteinVal : '');
  const [customFatVal, setCustomFatVal] = useState<number | ''>(profile.customFatVal !== undefined ? profile.customFatVal : '');

  // Interactive state tracking actual cycle day input for calibration
  const [cycleDayInput, setCycleDayInput] = useState<number | ''>(
    (profile.lastPeriodDate && profile.cycleLength)
      ? calculateCycleDay(profile.lastPeriodDate, Number(profile.cycleLength || 28), activeAnchor)
      : 1
  );

  // Sync from profile on MOUNT only — not on every profile change.
  // The auto-save writes local state TO profile; re-reading profile back
  // would create a reset loop that undoes user selections like metabolicOffset.
  useEffect(() => {
    setLifecycle(profile.lifecycle);
    setWeightKg(profile.weightKg);
    setHeightCm(profile.heightCm);
    setAge(profile.age);
    setBodyFatPercent(profile.bodyFatPercent);
    setCycleLength(profile.cycleLength);
    setPeriodLength(profile.periodLength);
    setLastPeriodDate(profile.lastPeriodDate);
    setActivityLevel(profile.activityLevel);
    setTrainingGoal(profile.trainingGoal);
    if (!offsetUserSet.current) setProteinGoal(profile?.proteinGoal || (
      profile?.lifecycle === 'menopause' ? 'recompose' : 'maintain'
    ));
    setBmrFormula(profile.bmrFormula || 'cunningham');
    if (!offsetUserSet.current) setMetabolicOffset((profile.metabolicOffset as 0 | 150 | 250) || 0);
    setAdjustForExercise(profile.adjustForExercise || false);
    setUseCustomMacros(profile.useCustomMacros || false);
    setCustomMacroType(profile.customMacroType || 'percentage');
    setCustomCarbsVal(profile.customCarbsVal !== undefined ? profile.customCarbsVal : '');
    setCustomProteinVal(profile.customProteinVal !== undefined ? profile.customProteinVal : '');
    setCustomFatVal(profile.customFatVal !== undefined ? profile.customFatVal : '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save whenever any field changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextProfile: UserProfile = {
        ...profile,
        lifecycle,
        weightKg: weightKg === '' ? profile.weightKg : Number(weightKg),
        heightCm: heightCm === '' ? profile.heightCm : Number(heightCm),
        age: age === '' ? profile.age : Number(age),
        bodyFatPercent: bodyFatPercent === '' ? profile.bodyFatPercent : Number(bodyFatPercent),
        cycleLength: cycleLength === '' ? profile.cycleLength : Number(cycleLength),
        periodLength: periodLength === '' ? profile.periodLength : Number(periodLength),
        lastPeriodDate,
        activityLevel,
        trainingGoal,
        proteinGoal,
        adjustForExercise,
        bmrFormula,
        metabolicOffset,
        useCustomMacros,
        customMacroType,
        customCarbsVal: customCarbsVal === '' ? undefined : Number(customCarbsVal),
        customProteinVal: customProteinVal === '' ? undefined : Number(customProteinVal),
        customFatVal: customFatVal === '' ? undefined : Number(customFatVal),
      };
      onSaveProfile(nextProfile);
    }, 800);
    return () => clearTimeout(timer);
  }, [lifecycle, weightKg, heightCm, age, bodyFatPercent, cycleLength, periodLength, lastPeriodDate, activityLevel, trainingGoal, bmrFormula, metabolicOffset, proteinGoal, adjustForExercise, useCustomMacros, customMacroType, customCarbsVal, customProteinVal, customFatVal]);

  // Recalculate cycle day when profile or date changes
  useEffect(() => {
    const currentAnchor = currentDateStr || getTodayLocal();
    const calculatedDay = (profile.lastPeriodDate && profile.cycleLength)
      ? calculateCycleDay(profile.lastPeriodDate, Number(profile.cycleLength || 28), currentAnchor)
      : 1;
    setCycleDayInput(calculatedDay);
  }, [profile, currentDateStr]);

  const [savingStatus, setSavingStatus] = useState(false);

  const handleLastPeriodDateChange = (dateVal: string) => {
    setLastPeriodDate(dateVal);
    const lengthVal = cycleLength || 28;
    const currentAnchor = currentDateStr || getTodayLocal();
    const calculatedDay = calculateCycleDay(dateVal, Number(lengthVal), currentAnchor);
    setCycleDayInput(calculatedDay);
  };

  const handleCycleLengthChange = (lengthVal: number | '') => {
    setCycleLength(lengthVal);
    const activeLength = lengthVal || 28;
    
    // Auto update cycle day based on current lastPeriodDate and the new length
    if (lastPeriodDate) {
      const currentAnchor = currentDateStr || getTodayLocal();
      const calculatedDay = calculateCycleDay(lastPeriodDate, Number(activeLength), currentAnchor);
      setCycleDayInput(calculatedDay);
    } else if (cycleDayInput !== '') {
      // Capped if current setting exceeds the new length limit
      if (cycleDayInput > activeLength) {
        setCycleDayInput(activeLength);
        recalibrateLastPeriodFromDay(activeLength);
      }
    }
  };

  const recalibrateLastPeriodFromDay = (dayVal: number) => {
    // Auto calibrate lastPeriodDate based on: CURRENT_DATE_STR - (dayVal - 1) days
    const currentAnchor = currentDateStr || getTodayLocal();
    const parts = currentAnchor.split('-');
    let target = new Date();
    if (parts.length === 3) {
      // Avoid time zone drift
      target = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0));
    } else {
      target = new Date(currentAnchor + "T12:00:00");
    }
    target.setUTCDate(target.getUTCDate() - (dayVal - 1));
    
    const yyyy = target.getUTCFullYear();
    const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(target.getUTCDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    setLastPeriodDate(dateString);
  };

  const handleCycleDayCalibration = (dayVal: number | '') => {
    setCycleDayInput(dayVal);
    if (dayVal !== '' && dayVal >= 1) {
      recalibrateLastPeriodFromDay(dayVal);
    }
  };

  const getLivePhaseName = (day: number) => {
    const pLen = periodLength === '' ? 5 : Number(periodLength);
    if (day <= pLen) return { name: 'Menstrual Phase (The Active Reset)', color: 'text-cinnamon bg-cinnamon/10 border-cinnamon/20' };
    if (day <= 12) return { name: 'Follicular Phase (Energy & Power Surge)', color: 'text-sage bg-[#3B4A3F]/5 border-sage/20' };
    if (day <= 15) return { name: 'Ovulatory Phase (Estrogen Peak)', color: 'text-kale bg-sage/10 border-sage/20' };
    return { name: 'Luteal Phase (Aerobic & Thermic Shift)', color: 'text-[#9A3B26] bg-[#9A3B26]/5 border-[#9A3B26]/10' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus(true);
    
    const nextProfile: UserProfile = {
      lifecycle,
      weightKg: weightKg === '' ? profile.weightKg : Number(weightKg),
      heightCm: heightCm === '' ? profile.heightCm : Number(heightCm),
      age: age === '' ? profile.age : Number(age),
      bodyFatPercent: bodyFatPercent === '' ? profile.bodyFatPercent : Number(bodyFatPercent),
      cycleLength: cycleLength === '' ? profile.cycleLength : Number(cycleLength),
      periodLength: periodLength === '' ? profile.periodLength : Number(periodLength),
      lastPeriodDate,
      activityLevel,
      trainingGoal,
      proteinGoal,
      adjustForExercise,
      bmrFormula,
      useCustomMacros,
      customMacroType,
      customCarbsVal: customCarbsVal === '' ? undefined : Number(customCarbsVal),
      customProteinVal: customProteinVal === '' ? undefined : Number(customProteinVal),
      customFatVal: customFatVal === '' ? undefined : Number(customFatVal),
    };

    onSaveProfile(nextProfile);
    
    // Simple visual saving signal
    setTimeout(() => {
      setSavingStatus(false);
    }, 600);
  };

  const lifecycles: { id: LifecycleType; title: string; desc: string }[] = [
    { id: 'regular', title: 'Regular Cycling', desc: 'Active menstrual cycle syncing based on dynamic estrogen/progesterone fluctuations.' },
    { id: 'pill', title: 'Contraceptive Pill', desc: 'Blunted cyclical peaks; maintains constant hormone profiles.' },
    { id: 'perimenopause', title: 'Perimenopause', desc: 'Fluctuating cycle lengths with progressive thermic and sleep adjustments.' },
    { id: 'menopause', title: 'Post-Menopause', desc: 'Lower flat hormones; focus on anabolic resistance and muscular sarcopenia triggers.' },
    { id: 'pregnancy', title: 'Pregnancy', desc: 'Increases structural support needs accompanied by a constant calorie surplus.' },
    { id: 'lactation', title: 'Lactation / Postpartum', desc: 'High fluid/electrolytes volume alongside nursing demand surplus (+500kcal).' }
  ];

  const goals: { id: UserProfile['trainingGoal']; label: string }[] = [
    { id: 'strength', label: 'Heavy Strength progression' },
    { id: 'performance', label: 'Peak Athletic power' },
    { id: 'endurance', label: 'Aerobic & Cardio conditioning' },
    { id: 'maintenance', label: 'Hormonal & physical balance' },
    { id: 'recovery', label: 'Deliberate nervous system healing' }
  ];

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-kale rounded-full flex items-center justify-center text-coconut">
          <UserCog className="h-4 w-4" />
        </div>
        <div>
          <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">SOMATIC ARCHITECTURE</span>
          <h2 className="text-xl font-serif italic text-kale mt-1 tracking-tight">
            Physiological Analytics Customizer
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Somatic Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FFFFFF]/30 p-5 rounded-[24px] border border-daydream">
          <div className="flex flex-col gap-1.55">
            <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
              max="500"
              step="0.1"
              required
            />
          </div>

          <div className="flex flex-col gap-1.55">
            <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
              onChange={(e) => setHeightCm(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
              max="300"
              required
            />
          </div>

          <div className="flex flex-col gap-1.55">
            <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Age</label>
            <input
              type="number"
              value={age}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
              max="150"
              required
            />
          </div>

          <div className="flex flex-col gap-1.55">
            <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Body Fat %</label>
            <input
              type="number"
              value={bodyFatPercent}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
              onChange={(e) => setBodyFatPercent(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
              max="90"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* BMR Equation Selection */}
        <div className="border-t border-daydream pt-6">
          <span className="text-sm font-serif font-bold italic text-kale block mb-2 px-1">
            ✦ Basal Metabolic Rate (BMR) Equation
          </span>
          <p className="text-sm text-kale/70 mb-4 px-1 leading-relaxed">
            Choose the metabolic calculation engine that best respects your physical constitution. For active females with athletic builds or larger bone structures, equations based on Fat-Free Mass (LBM) like Katch-McArdle or Cunningham provide superior clinical accuracy by referencing metabolically active lean tissues.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: 'owen',
                title: 'Owen (Female)',
                desc: "Female-specific RMR equation developed from an all-female study cohort. Best starting point if you don't have body composition data.",
                details: 'Formula: 795 + 7.18 × Weight — female cohort validated'
              },
              {
                id: 'de_lorenzo',
                title: 'De Lorenzo',
                desc: 'Validated specifically in active women. More accurate than Owen for women who train regularly — uses weight, height and age.',
                details: 'Formula: 9 × Weight + 11.7 × Height − 857 × ln(Age+1) + 302'
              },
              {
                id: 'cunningham',
                title: 'Cunningham',
                desc: 'Gold standard for trained women with known body composition. Anchors to Fat-Free Mass — accounts for your muscle directly.',
                details: 'Formula: 370 + 22 × FFM (requires accurate Body Fat %)'
              },
              {
                id: 'katch_mcardle',
                title: 'Katch-McArdle',
                desc: 'Also FFM-based. Most accurate for athletic women with high muscle-to-fat ratios when body fat % is reliably measured.',
                details: 'Formula: 370 + 21.6 × FFM (requires accurate Body Fat %)'
              }
            ].map((eqn) => {
              const active = bmrFormula === eqn.id;
              return (
                <button
                  key={eqn.id}
                  type="button"
                  onClick={() => setBmrFormula(eqn.id as BmrFormula)}
                  className={`text-left p-4 rounded-2xl border text-sm transition duration-150 flex flex-col justify-between outline-none gap-2 min-h-[120px] ${
                    active
                      ? 'bg-[#FAF7F2] border-kale shadow-inner text-kale'
                      : 'bg-coconut/40 border-daydream hover:bg-[#FAF7F2]/80 text-kale'
                  }`}
                >
                  <div>
                    <span className={`font-serif font-bold italic text-sm ${active ? 'text-cinnamon font-bold' : 'text-kale'}`}>
                      {eqn.title}
                    </span>
                    <p className="text-sm text-kale/75 leading-relaxed font-sans mt-1">
                      {eqn.desc}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-kale/50 block font-semibold mt-1">
                    {eqn.details}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Choice */}
        <div>
          <span className="text-sm font-serif font-bold italic text-kale block mb-3 px-1">
            ✦ Hormonal Lifecycle Matrix Stage
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lifecycles.map((stage) => {
              const active = lifecycle === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setLifecycle(stage.id)}
                  className={`text-left p-4 rounded-2xl border text-sm transition duration-150 flex flex-col outline-none gap-1 ${
                    active
                      ? 'bg-coconut border-kale shadow-xs text-kale'
                      : 'bg-coconut/40 border-daydream hover:bg-coconut/80 text-kale'
                  }`}
                >
                  <span className={`font-serif font-bold italic text-sm ${active ? 'text-cinnamon' : 'text-kale'}`}>
                    {stage.title}
                  </span>
                  <p className="text-sm text-kale/70 leading-relaxed font-sans mt-0.5">
                    {stage.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cycle variables */}
        {(lifecycle === 'regular' || lifecycle === 'perimenopause') && (
          <div className="border-t border-daydream pt-6 flex flex-col gap-4">
            <span className="text-sm font-serif font-bold italic text-kale block px-1">
              ✦ Menstrual Cycle Periodicity Parameters
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FFFFFF]/30 p-5 rounded-2xl border border-daydream">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Avg Cycle Length (Days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => handleCycleLengthChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
                  className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max="365"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Bleeding Menses Duration (Days)</label>
                <input
                  type="number"
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max="60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Start of Last Period</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => handleLastPeriodDateChange(e.target.value)}
                  className="text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale tracking-wider"
                  required
                />
              </div>
            </div>

            {/* LIVE AUTO CALIBRATION & PHASE DIAGNOSTICS */}
            <div className="bg-[#FAF7F2]/60 border border-daydream p-6 rounded-[24px] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sage text-coconut rounded-lg">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-serif font-bold italic text-kale">
                    Cycle Day Calibration Engine
                  </h4>
                </div>
                <p className="text-sm text-kale/70 font-sans leading-relaxed">
                  Avoid tracing logs manually. Choose what day of your cycle you are on <strong>today</strong> (as of May 25, 2026) to automatically calculate and fill the correct last period date above.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative w-44">
                    <select
                      value={cycleDayInput}
                      onChange={(e) => handleCycleDayCalibration(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="w-full text-sm font-bold font-mono border border-daydream rounded-xl p-2.5 pr-10 focus:border-sage focus:outline-none bg-coconut text-kale cursor-pointer appearance-none"
                    >
                      <option value="">-- Select Cycle Day --</option>
                      {Array.from({ length: Number(cycleLength || 28) }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Cycle Day {day}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-kale/40 text-sm">
                      ▼
                    </div>
                  </div>
                  <span className="text-sm text-kale/60 font-mono uppercase tracking-wide">
                    Live Calibration Dropdown
                  </span>
                </div>
              </div>

              {/* CALCULATED RESULTS */}
              <div className="p-4 rounded-2xl border border-daydream bg-[#FFFFFF]/50 flex flex-col justify-center gap-1">
                <span className="text-[11px] font-mono font-bold text-kale/50 uppercase tracking-widest block">Live Form Diagnostics</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-xl font-serif italic text-kale">Cycle Day {cycleDayInput || '?'}</strong>
                  <span className="text-sm text-kale/60 font-mono">of {cycleLength || '?'} days</span>
                </div>
                {cycleDayInput && (
                  <div className={`mt-2 p-2.5 rounded-xl text-center text-sm font-sans font-bold border transition ${getLivePhaseName(Number(cycleDayInput)).color}`}>
                    {getLivePhaseName(Number(cycleDayInput)).name}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-daydream pt-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-serif font-bold italic text-kale block mb-2 px-1">
              ✦ Physical Activity Category
            </span>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="text-sm border border-daydream rounded-xl p-3 focus:outline-none focus:border-sage bg-coconut text-kale"
            >
              <option value="sedentary">Sedentary (No scheduled workouts, desk lifestyle)</option>
              <option value="lightly_active">Lightly Active (1-3 sessions low-intensity cardio / yoga)</option>
              <option value="moderately_active">Moderately Active (3-5 sessions weight training / hikes / pilates)</option>
              <option value="very_active">Very Active (5-7 sessions intense performance sports/week)</option>
              <option value="athlete">Elite Athlete / Multi-session (Extremely high requirements)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-serif font-bold italic text-kale block mb-2 px-1">
              ✦ Current Training Objective
            </span>
            <div className="flex flex-wrap gap-1.5">
              {goals.map((goal) => {
                const active = trainingGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setTrainingGoal(goal.id)}
                    className={`text-sm font-sans font-semibold px-3.5 py-2.5 rounded-xl border transition leading-none outline-none ${
                      active
                        ? 'bg-kale border-kale text-coconut'
                        : 'bg-coconut/40 border-daydream text-kale/75 hover:bg-coconut/80'
                    }`}
                  >
                    {goal.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* EXERCISE CALORIE ADJUSTMENT TOGGLE */}
        <div className="border-t border-daydream pt-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-kale font-serif italic">Adjust Target for Logged Exercise</span>
              <p className="text-sm text-kale/50 font-sans leading-relaxed">
                When on, today's energy target increases by the calories you log from workouts — useful on days with unusually high activity (a big hike, a long walk). When off, your target reflects your typical activity level only, avoiding double-counting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdjustForExercise(!adjustForExercise)}
              className={`shrink-0 px-4 py-2 text-sm font-mono font-bold uppercase tracking-wider rounded-xl transition ${
                adjustForExercise
                  ? 'bg-sage text-coconut'
                  : 'bg-coconut text-kale/60 border border-daydream hover:bg-coconut/80'
              }`}
            >
              {adjustForExercise ? 'On' : 'Off'}
            </button>
          </div>
          {adjustForExercise && (
            <div className="bg-[#EEF4EC] border border-sage/30 rounded-xl p-3">
              <p className="text-sm font-serif italic text-sage leading-relaxed">
                Logged workout calories will be added to today's energy target. Tag workouts as "from a wearable" for the most accurate adjustment.
              </p>
            </div>
          )}
        </div>

        {/* PROTEIN GOAL SELECTOR */}
        <div className="border-t border-daydream pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#EEF4EC] text-sage rounded-lg border border-sage/20">
              <span className="text-sm">🥩</span>
            </div>
            <div>
              <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">Protein Target</span>
              <h4 className="text-sm font-serif font-bold italic text-kale mt-0.5">
                What's your primary goal right now?
              </h4>
            </div>
          </div>
          <p className="text-sm font-sans text-kale/60 leading-relaxed">
            Your protein target adjusts automatically based on your goal, lifecycle stage, and workouts logged today. No cycle-phase manipulation — current evidence supports consistent daily intake over phase-cycling (Gatorade SSI 2025, Colenso-Semple 2025).
          </p>
          <div className="flex flex-col gap-2">
            {([
              {
                id: 'wellness' as const,
                title: 'Stay Healthy',
                desc: 'Active but not training hard — keeping well and feeling good.',
                gPerKg: lifecycle === 'menopause' ? '2.0' : lifecycle === 'perimenopause' ? '1.8' : '1.6'
              },
              {
                id: 'maintain' as const,
                title: 'Maintain Muscle',
                desc: "Training regularly and protecting the lean mass you've built.",
                gPerKg: lifecycle === 'menopause' ? '2.0' : lifecycle === 'perimenopause' ? '1.8' : '1.8'
              },
              {
                id: 'recompose' as const,
                title: 'Build or Recompose',
                desc: 'Serious training, building strength, or changing body composition.',
                gPerKg: lifecycle === 'menopause' ? '2.2' : lifecycle === 'perimenopause' ? '2.0' : '2.0'
              }
            ] as const).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setProteinGoal(option.id)}
                className={`w-full p-4 rounded-xl border text-left transition ${
                  proteinGoal === option.id
                    ? 'bg-sage/20 border-sage text-kale'
                    : 'bg-coconut border-daydream text-kale hover:border-sage'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-sm font-bold uppercase tracking-wider">{option.title}</div>
                    <div className="font-serif italic text-sm mt-1 text-kale/70">{option.desc}</div>
                  </div>
                  <div className={`text-right shrink-0 ml-3 ${proteinGoal === option.id ? 'text-sage' : 'text-kale/40'}`}>
                    <div className="font-serif font-bold text-lg">{option.gPerKg}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider">g/kg</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {(lifecycle === 'perimenopause' || lifecycle === 'menopause') && (
            <div className="bg-[#EEF4EC] border border-sage/30 rounded-xl p-3">
              <p className="text-sm font-serif italic text-sage leading-relaxed">
                Your lifecycle stage increases anabolic resistance — your minimum protein target has been elevated above standard guidelines to protect lean mass during hormonal transition.
              </p>
            </div>
          )}
        </div>

        {/* SOMATIC MANUAL MACRO OVERRIDE */}
        <div className="border-t border-daydream pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FAF7F2] text-cinnamon rounded-lg border border-cinnamon/20">
              <Dna className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">SOMATIC CONFIGURATION MODULE</span>
              <h4 className="text-sm font-serif font-bold italic text-kale mt-0.5">
                Manual Macro Override Settings
              </h4>
            </div>
          </div>

          <p className="text-sm text-kale/70 font-sans leading-relaxed max-w-2xl">
            Enable this manual override to completely bypass cycle-calculated macronutrient balances and set your own absolute daily weight targets in grams (protein, carbs, and fats).
          </p>

          <div className="bg-[#FAF7F2]/50 p-6 rounded-[24px] border border-daydream space-y-4">
            {/* Metabolic Adaptation Offset - perimenopause/menopause only */}
            {(lifecycle === 'perimenopause' || lifecycle === 'menopause') && (
              <div className="bg-[#FDF5F0] border border-cinnamon/20 rounded-2xl p-5 space-y-4">
                <div>
                  <span className="text-sm font-mono font-bold text-cinnamon uppercase tracking-widest block">Metabolic Adaptation Offset</span>
                  <h4 className="font-serif italic text-kale text-sm mt-1">Perimenopause Calorie Adjustment</h4>
                  <p className="text-sm text-kale font-sans mt-2 mb-1">
                    In plain terms: if you've noticed your weight isn't responding the way it used to despite eating the same way, this gently lowers your calorie target to reflect that. Most women leave this off until they notice that pattern.
                  </p>
                  <p className="text-sm text-kale/60 leading-relaxed mt-1 font-sans">Research confirms standard BMR equations overestimate energy needs by 100-300 kcal/day during hormonal transition. Karppinen et al. (2023), Oelmann et al. (2025), Baker et al. (2025).</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      offsetUserSet.current = true;
                      setMetabolicOffset(0);
                      onUpdateOffset(0);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition ${metabolicOffset === 0 ? 'bg-kale text-coconut border-kale' : 'bg-coconut border-daydream text-kale hover:border-sage'}`}
                  >
                    <div className="font-mono text-sm font-bold uppercase tracking-wider">Off</div>
                    <div className="font-serif italic text-sm mt-1">Full equation — no adjustment</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      offsetUserSet.current = true;
                      setMetabolicOffset(150);
                      onUpdateOffset(150);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition ${metabolicOffset === 150 ? 'bg-cinnamon text-coconut border-cinnamon' : 'bg-coconut border-daydream text-kale hover:border-cinnamon'}`}
                  >
                    <div className="font-mono text-sm font-bold uppercase tracking-wider">Mild — reduce by 150 kcal/day</div>
                    <div className="font-serif italic text-sm mt-1">Moderate hormonal shift, some weight resistance</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      offsetUserSet.current = true;
                      setMetabolicOffset(250);
                      onUpdateOffset(250);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition ${metabolicOffset === 250 ? 'bg-cinnamon text-coconut border-cinnamon' : 'bg-coconut border-daydream text-kale hover:border-cinnamon'}`}
                  >
                    <div className="font-mono text-sm font-bold uppercase tracking-wider">Moderate — reduce by 250 kcal/day</div>
                    <div className="font-serif italic text-sm mt-1">Significant metabolic adaptation, strong weight resistance</div>
                  </button>
                </div>
                {metabolicOffset > 0 && (
                  <div className="bg-coconut border border-daydream rounded-xl p-3 text-sm text-kale/70 font-sans leading-relaxed">
                    Your calorie target will be reduced by <strong className="text-cinnamon">{metabolicOffset} kcal</strong> to account for hormonal metabolic adaptation. Trust how you feel — adjust if needed. Minimum 1,200 kcal floor maintained.
                  </div>
                )}
              </div>
            )}

            {/* Enable Override Toggle */}
            <div className="flex items-center justify-between gap-4 border-b border-daydream pb-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-kale font-serif italic">Manual Macro Override</span>
                <p className="text-sm text-kale/50 font-sans">Completely override cycle-calculated macros with custom gram targets</p>
                <p className="text-sm text-sage/80 font-sans italic mt-1">
                  Most women don't need this — your targets are already calculated for you. Only turn this on if you have specific numbers from a coach, dietitian, or lab test you want to follow instead.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const val = !useCustomMacros;
                  setUseCustomMacros(val);
                  if (val) {
                    // Default to percentage mode on first activation — more intuitive
                    setCustomMacroType('percentage');
                    setCustomCarbsVal(40);
                    setCustomProteinVal(35);
                    setCustomFatVal(25);
                  }
                  onSaveProfile({ ...profile, useCustomMacros: val });
                }}
                className={`px-4 py-2 text-sm font-mono font-bold uppercase tracking-wider rounded-xl transition ${
                  useCustomMacros 
                    ? 'bg-cinnamon text-coconut' 
                    : 'bg-coconut text-kale/60 border border-daydream hover:bg-coconut/80'
                }`}
              >
                {useCustomMacros ? 'Status: MANUAL OVERRIDE ACTIVE' : 'Status: CYCLE-CALCULATED SYNC'}
              </button>
            </div>

            {useCustomMacros && (
              <div className="space-y-4 animate-fade-in">
                {/* Selection Option: Percentages vs Grams */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-coconut p-3 rounded-xl border border-daydream">
                  <div className="soft-label space-y-0.5">
                    <span className="text-sm font-mono font-bold text-kale uppercase">Calculation Calibration Mode</span>
                    <p className="text-sm text-kale/60 leading-none">Distribute goals using absolute weight in grams or percentage targets</p>
                  </div>
                  <div className="flex gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMacroType('grams');
                        setCustomCarbsVal(200);
                        setCustomProteinVal(150);
                        setCustomFatVal(65);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold uppercase transition ${
                        customMacroType === 'grams'
                          ? 'bg-kale text-coconut font-extrabold'
                          : 'bg-[#FAF7F2] text-kale/60 border border-daydream hover:bg-[#FAF7F2]/80'
                      }`}
                    >
                      Direct Grams
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMacroType('percentage');
                        setCustomCarbsVal(40);
                        setCustomProteinVal(35);
                        setCustomFatVal(25);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold uppercase transition ${
                        customMacroType === 'percentage'
                          ? 'bg-kale text-coconut font-extrabold'
                          : 'bg-[#FAF7F2] text-kale/60 border border-daydream hover:bg-[#FAF7F2]/80'
                      }`}
                    >
                      Percentages
                    </button>
                  </div>
                </div>

                {(lifecycle === 'perimenopause' || lifecycle === 'menopause') && metabolicOffset > 0 && (
                  <div className="bg-[#EEF4EC] border border-sage/30 rounded-xl p-3 -mt-2">
                    <p className="text-sm font-serif italic text-sage leading-relaxed">
                      {customMacroType === 'grams'
                        ? `Your metabolic adaptation offset (−${metabolicOffset} kcal) is applied by reducing carbohydrate grams — protein and fat stay at the values you set.`
                        : `Your metabolic adaptation offset (−${metabolicOffset} kcal) is applied to your total energy target before this percentage split is calculated.`}
                    </p>
                  </div>
                )}

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Carbs */}
                  <div className="flex flex-col gap-1.5 bg-coconut p-4 rounded-xl border border-daydream">
                    <label className="text-sm font-mono font-semibold text-cinnamon uppercase tracking-wider">
                      Carbohydrates {customMacroType === 'percentage' ? '(%)' : '(g)'}
                    </label>
                    <input
                      type="number"
                      value={customCarbsVal}
                      onChange={(e) => setCustomCarbsVal(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={customMacroType === 'percentage' ? '40' : '200'}
                      className="text-sm font-mono font-bold border border-daydream rounded-lg p-2 focus:border-cinnamon focus:outline-none bg-[#FAF7F2]/30 text-kale"
                      min="0"
                      required
                    />
                    <span className="text-sm text-kale/50 font-sans">
                      {customMacroType === 'percentage' ? 'Percent of total daily calories' : 'Target absolute carbs weight'}
                    </span>
                  </div>

                  {/* Protein */}
                  <div className="flex flex-col gap-1.5 bg-coconut p-4 rounded-xl border border-daydream">
                    <label className="text-sm font-mono font-semibold text-sage uppercase tracking-wider">
                      Protein {customMacroType === 'percentage' ? '(%)' : '(g)'}
                    </label>
                    <input
                      type="number"
                      value={customProteinVal}
                      onChange={(e) => setCustomProteinVal(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={customMacroType === 'percentage' ? '30' : '150'}
                      className="text-sm font-mono font-bold border border-daydream rounded-lg p-2 focus:border-sage focus:outline-none bg-[#FAF7F2]/30 text-kale"
                      min="0"
                      required
                    />
                    <span className="text-sm text-kale/50 font-sans">
                      {customMacroType === 'percentage' ? 'Percent of total daily calories' : 'Target absolute protein weight'}
                    </span>
                  </div>

                  {/* Fat */}
                  <div className="flex flex-col gap-1.5 bg-coconut p-4 rounded-xl border border-daydream">
                    <label className="text-sm font-mono font-semibold text-[#9A3B26] uppercase tracking-wider">
                      Fats {customMacroType === 'percentage' ? '(%)' : '(g)'}
                    </label>
                    <input
                      type="number"
                      value={customFatVal}
                      onChange={(e) => setCustomFatVal(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={customMacroType === 'percentage' ? '30' : '65'}
                      className="text-sm font-mono font-bold border border-daydream rounded-lg p-2 focus:border-[#9A3B26] focus:outline-none bg-[#FAF7F2]/30 text-kale"
                      min="0"
                      required
                    />
                    <span className="text-sm text-kale/50 font-sans">
                      {customMacroType === 'percentage' ? 'Percent of total daily calories' : 'Target absolute fat weight'}
                    </span>
                  </div>
                </div>

                {/* Validation Diagnostics Feedback */}
                <div className="p-3.5 rounded-xl border bg-coconut text-center">
                  {customMacroType === 'percentage' ? (
                    (() => {
                      const sum = Number(customCarbsVal || 0) + Number(customProteinVal || 0) + Number(customFatVal || 0);
                      const isValid = sum === 100;
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-serif font-semibold italic text-kale">
                            Percentage Summation Diagnostic:
                          </span>
                          <strong className={`text-sm font-mono ${isValid ? 'text-sage font-black' : 'text-rose-500 font-bold'}`}>
                            {sum}% / 100%
                          </strong>
                          {!isValid && (
                            <span className="text-sm font-mono bg-rose-50 border border-rose-200 text-rose-500 px-2 py-0.5 rounded ml-2 font-bold animate-pulse">
                              Sum must equal 100%
                            </span>
                          )}
                          {isValid && (
                            <span className="text-sm font-mono bg-sage/10 text-sage border border-sage/20 px-2 py-0.5 rounded ml-2 font-bold">
                              Valid Ratio Target Achieved
                            </span>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const totalKcal = (Number(customCarbsVal || 0) * 4) + (Number(customProteinVal || 0) * 4) + (Number(customFatVal || 0) * 9);
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-serif font-semibold italic text-kale">
                            Derived Absolute Caloric Ceiling:
                          </span>
                          <strong className="text-sm font-mono text-kale font-bold">
                            {totalKcal} kcal / day
                          </strong>
                          <span className="text-sm font-mono text-kale bg-sage/10 border border-sage/20 px-2 py-1 rounded ml-1.5 font-semibold">
                            Based on carbs (4kcal/g), protein (4kcal/g), fat (9kcal/g)
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-5 border-t border-daydream">
          <button
            type="submit"
            disabled={savingStatus}
            className="px-6 py-3 bg-kale hover:bg-sage hover:text-kale text-coconut font-mono font-bold text-sm leading-none uppercase tracking-widest rounded-xl transition shadow-xs flex items-center gap-2 outline-none select-none min-h-[44px]"
          >
            {savingStatus ? (
              <span>Committing changes...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Apply Somatic Profile
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
