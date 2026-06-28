/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, FoodLog, WorkoutLog, SymptomLog } from './types';
import { 
  DEFAULT_USER_PROFILE, 
  INITIAL_FOODS, 
  INITIAL_WORKOUTS, 
  INITIAL_SYMPTOMS 
} from './data/defaults';
import { 
  calculatePhase, 
  getPhaseInfo, 
  calculateTDEE, 
  calculateEnergyAvailability
} from './data/physiology';

// Components
import MetricRing from './components/MetricRing';
import EnergyAvailabilityCard from './components/EnergyAvailabilityCard';
import CycleTimeline from './components/CycleTimeline';
import FoodLogger from './components/FoodLogger';
import WorkoutLogger from './components/WorkoutLogger';
import SymptomLogger from './components/SymptomLogger';
import AiCoachPanel from './components/AiCoachPanel';
import ProfileSettings from './components/ProfileSettings';
import TrendsChart from './components/TrendsChart';
import BetaPlaybook from './components/BetaPlaybook';

// Icons
import { 
  Sparkles, 
  User, 
  Calendar, 
  ShieldAlert, 
  Salad, 
  Dumbbell, 
  HeartPulse, 
  Settings, 
  Tv, 
  Layers, 
  HelpCircle,
  Lightbulb,
  Award,
  Heart,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

export default function App() {
  // Global active tracker date state (supports dynamic tracking / daily views)
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    return todayStr;
  });

  // World clock state for real-time temporal feedback
  const [liveTimeStr, setLiveTimeStr] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('physio_user_profile') 
      || sessionStorage.getItem('physio_user_profile_backup');
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch(_) {}
    }
    return DEFAULT_USER_PROFILE;
  });

  const [foods, setFoods] = useState<FoodLog[]>(() => {
    const savedFoods = localStorage.getItem('physio_foods_log')
      || sessionStorage.getItem('physio_foods_log_backup');
    if (savedFoods) {
      try { return JSON.parse(savedFoods); } catch(_) {}
    }
    return INITIAL_FOODS;
  });

  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    const savedWorkouts = localStorage.getItem('physio_workouts_log')
      || sessionStorage.getItem('physio_workouts_log_backup');
    if (savedWorkouts) {
      try { return JSON.parse(savedWorkouts); } catch(_) {}
    }
    return INITIAL_WORKOUTS;
  });

  const [symptoms, setSymptoms] = useState<SymptomLog | undefined>(() => {
    const savedSymptoms = localStorage.getItem('physio_symptoms_log');
    if (savedSymptoms) {
      try { return JSON.parse(savedSymptoms); } catch(_) {}
    }
    return INITIAL_SYMPTOMS;
  });

  const [symptomsHistory, setSymptomsHistory] = useState<SymptomLog[]>(() => {
    const savedSymptomsHistory = localStorage.getItem('physio_symptoms_history');
    if (savedSymptomsHistory) {
      try { return JSON.parse(savedSymptomsHistory); } catch(_) {}
    }
    return [INITIAL_SYMPTOMS];
  });

  const [showResearchDashboard, setShowResearchDashboard] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meals' | 'workouts' | 'symptoms' | 'ai' | 'profile' | 'beta'>('dashboard');

  // Load from LocalStorage has been refactored to use synchronous state initializers for instant page loads without hydration or rendering lag.

  // Resilient storage: writes to both localStorage and a sessionStorage backup
  const persistData = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch(_) {}
    try { sessionStorage.setItem(key + '_backup', value); } catch(_) {}
  };

  // Format a Date object as YYYY-MM-DD using LOCAL date parts (not UTC),
  // avoiding the day-shift bug that toISOString() causes in timezones ahead of UTC.
  const formatDateLocal = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse a YYYY-MM-DD string as a local calendar date, avoiding UTC conversion.
  const parseDateLocal = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const recoverData = (key: string): string | null => {
    return localStorage.getItem(key) || sessionStorage.getItem(key + '_backup');
  };

  // Save actions
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    persistData('physio_user_profile', JSON.stringify(newProfile));
  };

  const handleUpdateOffset = (offset: 0 | 150 | 250) => {
    const newProfile = { ...profile, metabolicOffset: offset };
    setProfile(newProfile);
    persistData('physio_user_profile', JSON.stringify(newProfile));
  };

  const handleAddFood = (f: FoodLog) => {
    const stamped = { ...f, date: f.date || currentDateStr };
    const next = [stamped, ...foods];
    setFoods(next);
    persistData('physio_foods_log', JSON.stringify(next));
  };

  const handleDeleteFood = (id: string) => {
    const next = foods.filter(item => item.id !== id);
    setFoods(next);
    persistData('physio_foods_log', JSON.stringify(next));
  };

  const handleUpdateFood = (updated: FoodLog) => {
    const next = foods.map(item => item.id === updated.id ? updated : item);
    setFoods(next);
    persistData('physio_foods_log', JSON.stringify(next));
  };

  const handleAddWorkout = (w: WorkoutLog) => {
    const stamped = { ...w, date: w.date || currentDateStr };
    const next = [stamped, ...workouts];
    setWorkouts(next);
    persistData('physio_workouts_log', JSON.stringify(next));
  };

  const handleDeleteWorkout = (id: string) => {
    const next = workouts.filter(item => item.id !== id);
    setWorkouts(next);
    persistData('physio_workouts_log', JSON.stringify(next));
  };

  const handleSaveSymptoms = (log: SymptomLog) => {
    const stamped = { ...log, date: log.date || currentDateStr, id: log.id || 's_' + Date.now() };
    setSymptoms(stamped);
    persistData('physio_symptoms_log', JSON.stringify(stamped));

    // Upsert historical logs matching by ID, or find the one logged for this active day to avoid duplicates
    const existingIndex = symptomsHistory.findIndex(
      item => item.id === stamped.id || (item.date && item.date === currentDateStr)
    );
    let nextHistory = [...symptomsHistory];
    if (existingIndex >= 0) {
      nextHistory[existingIndex] = stamped;
    } else {
      nextHistory = [stamped, ...nextHistory];
    }
    setSymptomsHistory(nextHistory);
    persistData('physio_symptoms_history', JSON.stringify(nextHistory));
  };

  const handleDeleteSymptomHistory = (id: string) => {
    const nextHistory = symptomsHistory.filter(item => item.id !== id);
    setSymptomsHistory(nextHistory);
    persistData('physio_symptoms_history', JSON.stringify(nextHistory));
    if (symptoms?.id === id) {
      setSymptoms(undefined);
      localStorage.removeItem('physio_symptoms_log');
    }
  };

  // Date management helpers for global tracks
  const handlePreviousDay = () => {
    const d = parseDateLocal(currentDateStr);
    d.setDate(d.getDate() - 1);
    const prevDateStr = formatDateLocal(d);
    setCurrentDateStr(prevDateStr);
    persistData('physio_current_date', prevDateStr);
  };

  const handleNextDay = () => {
    const d = parseDateLocal(currentDateStr);
    d.setDate(d.getDate() + 1);
    const nextDateStr = formatDateLocal(d);
    setCurrentDateStr(nextDateStr);
    persistData('physio_current_date', nextDateStr);
  };

  const handleSetToToday = () => {
    const todayStr = formatDateLocal(new Date());
    setCurrentDateStr(todayStr);
    persistData('physio_current_date', todayStr);
  };

  const handleDirectDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDateStr(e.target.value);
      persistData('physio_current_date', e.target.value);
    }
  };

  const isCurrentlyToday = () => {
    const todayStr = formatDateLocal(new Date());
    return currentDateStr === todayStr;
  };

  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        // Construct date safely to bypass local timezone offsets shift, since we desire clean UTC/Worldwide date
        const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        return d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          timeZone: 'UTC'
        });
      }
      return dStr;
    } catch (_) {
      return dStr;
    }
  };

  // Physiology Target Calculations
  const cyclePhase = calculatePhase(profile, currentDateStr);
  const phaseDetails = getPhaseInfo(cyclePhase, profile.lifecycle);
  const tdeeCaloriesTarget = calculateTDEE(
    profile.weightKg, 
    profile.heightCm, 
    profile.age, 
    profile.activityLevel, 
    cyclePhase, 
    profile.lifecycle,
    profile.bmrFormula || 'cunningham',
    profile.bodyFatPercent
  );

  // Apply metabolic adaptation offset for perimenopause/menopause
  const metabolicOffset = (profile.lifecycle === 'perimenopause' || profile.lifecycle === 'menopause') ? (profile.metabolicOffset || 0) : 0;
  const adjustedTDEE = Math.max(1200, tdeeCaloriesTarget - metabolicOffset);

  // Derive Macros targets based on scientific ratio or custom profile allocation
  const ratio = phaseDetails.targetMacroRatio;


  // Dynamic protein — uses workouts directly (no dependency on activeWorkouts)
  const _pg = profile.proteinGoal || (profile.lifecycle === 'menopause' ? 'recompose' : 'maintain');
  const _lc = profile.lifecycle || 'regular';
  const _wt = profile.weightKg || 70;
  let _baseGPerKg = 1.8;
  let _proteinAddGrams = 0; // flat addition for pregnancy/lactation, on top of g/kg base
  if (_lc === 'menopause') { _baseGPerKg = _pg === 'recompose' ? 2.2 : 2.0; }
  else if (_lc === 'perimenopause') { _baseGPerKg = _pg === 'recompose' ? 2.0 : 1.8; }
  else if (_lc === 'pregnancy') { _baseGPerKg = 1.6; _proteinAddGrams = 25; } // ACOG/WHO: +25g/day trimester 2/3
  else if (_lc === 'lactation') { _baseGPerKg = 1.6; _proteinAddGrams = 25; } // WHO: +25g/day during lactation
  else if (_pg === 'wellness') { _baseGPerKg = 1.6; }
  else if (_pg === 'recompose') { _baseGPerKg = 2.0; }
  const _baseGrams = Math.round(_wt * _baseGPerKg) + _proteinAddGrams;
  const _todayWkts = workouts.filter(w => (w.date || currentDateStr) === currentDateStr);
  const _todayTypes2 = _todayWkts.map(w => w.type.toLowerCase());
  const _hasStr2 = _todayTypes2.some(t => ['strength','resistance','lift','weights','hiit'].some(k => t.includes(k)));
  const _hasEnd2 = _todayTypes2.some(t => ['run','cardio','cycle','swim','row','endurance'].some(k => t.includes(k)));
  const _hasHI2 = _todayWkts.some(w => w.intensity === 'high');
  const _boost2 = _hasStr2 && _hasEnd2 ? Math.round(_wt*0.4) : _hasStr2 ? Math.round(_wt*0.3) : (_hasEnd2||_hasHI2) ? Math.round(_wt*0.2) : 0;
  const proteinTarget = {
    trainingBoostGrams: _boost2,
    totalGrams: _baseGrams + _boost2,
    perMealMinGrams: (_lc === 'menopause' || _lc === 'perimenopause') ? 35 : 30,
    gPerKg: _baseGPerKg
  };
  let targetProteinGrams = proteinTarget.totalGrams;
  const proteinCalories = targetProteinGrams * 4;
  const remainingCalories = Math.max(0, adjustedTDEE - proteinCalories);
  // Carbs and fat split from remaining calories using phase ratios (renormalised to carb+fat only)
  const carbFatTotal = ratio.carbs + ratio.fat;
  const carbRatio = carbFatTotal > 0 ? ratio.carbs / carbFatTotal : 0.6;
  const fatRatio = carbFatTotal > 0 ? ratio.fat / carbFatTotal : 0.4;
  let targetCarbsGrams = Math.round((remainingCalories * carbRatio) / 4);
  let targetFatGrams = Math.round((remainingCalories * fatRatio) / 9);
  let displayCaloriesTarget = adjustedTDEE;

  if (profile.useCustomMacros) {
    if (profile.customMacroType === 'grams') {
      // Grams mode — user specifies exact grams for protein and fat (held fixed).
      // Carbs absorb the metabolic offset adjustment, since they're the most
      // flexible macro for calorie-level changes — protein and fat targets
      // (often set for clinical/training reasons) remain untouched.
      targetProteinGrams = profile.customProteinVal !== undefined ? profile.customProteinVal : 0;
      targetFatGrams = profile.customFatVal !== undefined ? profile.customFatVal : 0;
      const baseCarbsGrams = profile.customCarbsVal !== undefined ? profile.customCarbsVal : 0;
      if (metabolicOffset > 0) {
        const carbOffsetGrams = Math.round(metabolicOffset / 4);
        targetCarbsGrams = Math.max(0, baseCarbsGrams - carbOffsetGrams);
      } else {
        targetCarbsGrams = baseCarbsGrams;
      }
      displayCaloriesTarget = Math.max(1200, (targetCarbsGrams * 4) + (targetProteinGrams * 4) + (targetFatGrams * 9));
    } else {
      // Percentage mode — split ALL THREE macros from adjustedTDEE using the user's percentages.
      // Protein is NOT fixed at 1.5g/kg here — the percentage split overrides it completely.
      const carbsPct = profile.customCarbsVal !== undefined ? Number(profile.customCarbsVal) : 40;
      const proteinPct = profile.customProteinVal !== undefined ? Number(profile.customProteinVal) : 35;
      const fatPct = profile.customFatVal !== undefined ? Number(profile.customFatVal) : 25;
      // Normalise percentages in case they don't add to 100
      const totalPct = carbsPct + proteinPct + fatPct;
      const normCarbs = totalPct > 0 ? carbsPct / totalPct : 0.4;
      const normProtein = totalPct > 0 ? proteinPct / totalPct : 0.35;
      const normFat = totalPct > 0 ? fatPct / totalPct : 0.25;
      targetCarbsGrams = Math.round((adjustedTDEE * normCarbs) / 4);
      targetProteinGrams = Math.round((adjustedTDEE * normProtein) / 4);
      targetFatGrams = Math.round((adjustedTDEE * normFat) / 9);
      displayCaloriesTarget = adjustedTDEE;
    }
  }

  // Micro-nutrient baseline requirements (IOC guidelines)
  // Menstruating women need huge iron targets (18mg/day)
  // Menopausal athletes need major calcium targets (1200mg/day)
  const targetIronMg = profile.lifecycle === 'regular' && cyclePhase === 'menstrual' ? 18 : 15;
  const targetCalciumMg = profile.lifecycle === 'menopause' ? 1200 : 1000;
  // Luteal pre-workout needs stable sodium margins to preserve plasma drop
  const targetSodiumMg = cyclePhase === 'luteal' ? 2400 : 2000;

  // Active date filters: Group records and preserve clean separate journals by selectedDateStr.
  // Backwards compatibility treats logs without explicit `.date` parameter as matching anchor May 30, 2026.
  const activeFoods = foods.filter(item => {
    const itemDate = item.date || currentDateStr;
    return itemDate === currentDateStr;
  });

  const activeWorkouts = workouts.filter(item => {
    const itemDate = item.date || currentDateStr;
    return itemDate === currentDateStr;
  });

  const activeSymptoms = symptomsHistory.find(item => {
    const itemDate = item.date || currentDateStr;
    return itemDate === currentDateStr;
  }) || (symptoms?.date === currentDateStr ? symptoms : undefined);

  // Logs calculations for Today
  const totalCaloriesIn = activeFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalCarbsIn = activeFoods.reduce((sum, item) => sum + item.carbs, 0);
  const totalProteinIn = activeFoods.reduce((sum, item) => sum + item.protein, 0);
  const totalFatIn = activeFoods.reduce((sum, item) => sum + item.fat, 0);

  const totalIronIn = activeFoods.reduce((sum, item) => sum + (item.ironMg || 0), 0);
  const totalCalciumIn = activeFoods.reduce((sum, item) => sum + (item.calciumMg || 0), 0);
  const totalSodiumIn = activeFoods.reduce((sum, item) => sum + (item.sodiumMg || 0), 0);

  const workoutKcalBurned = activeWorkouts.reduce((sum, item) => sum + item.caloriesBurned, 0);

  // If enabled, today's energy target absorbs logged exercise calories —
  // useful for days with unusually high activity (long hikes, big walks)
  const finalCaloriesTarget = profile.adjustForExercise
    ? displayCaloriesTarget + workoutKcalBurned
    : displayCaloriesTarget;

  const { ffm, ea, status: eaStatus, explanation: eaExplanation } = calculateEnergyAvailability(
    totalCaloriesIn,
    workoutKcalBurned,
    profile.weightKg,
    profile.bodyFatPercent
  );

  // Prepare Summary context payload for AI coach
  const currentSummaryPayload = {
    date: currentDateStr,
    phase: cyclePhase,
    foods: activeFoods,
    workouts: activeWorkouts,
    symptoms: activeSymptoms,
    totalCalories: totalCaloriesIn,
    totalCarbs: totalCarbsIn,
    totalProtein: totalProteinIn,
    totalFat: totalFatIn,
    totalIronMg: totalIronIn,
    totalCalciumMg: totalCalciumIn,
    totalSodiumMg: totalSodiumIn,
    workoutKcalBurned,
    calculatedFatFreeMass: ffm,
    energyAvailability: ea,
    energyAvailabilityStatus: eaStatus,
    // Targets — so the AI coach can compare actual intake against the woman's
    // calculated goals, rather than giving generic advice with no reference point
    targetCalories: finalCaloriesTarget,
    targetProtein: targetProteinGrams,
    targetCarbs: targetCarbsGrams,
    targetFat: targetFatGrams,
    proteinPerMealMin: proteinTarget.perMealMinGrams,
    metabolicOffsetActive: metabolicOffset,
    usingCustomMacros: profile.useCustomMacros || false
  };

  return (
    <div className="min-h-screen bg-coconut font-sans text-kale selection:bg-daydream/50 pb-12">
      
      {/* Upper Navigation Global Header */}
      <header className="bg-coconut/95 backdrop-blur-md border-b border-daydream sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-kale rounded-full flex items-center justify-center text-coconut">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif italic tracking-tight text-kale leading-tight flex items-baseline gap-2">
                Sérénité Active by MDeats
                <span className="text-sm font-mono font-bold text-coconut bg-cinnamon px-2 py-0.5 tracking-wider">
                  BETA
                </span>
              </h1>
              <span className="text-sm text-kale/60 font-mono mt-0.5 block uppercase tracking-wider">Cycle-Aware Nutrition & Wellness</span>
            </div>
          </div>

          {/* Quick status pill tags */}
          <div className="hidden md:flex items-center gap-5">
            <div className="text-right">
              <span className="text-sm font-bold text-kale/50 uppercase tracking-[0.2em] block font-mono">Hormonal Profile</span>
              <span className="text-sm font-serif italic text-kale capitalize leading-none block mt-1">
                {profile.lifecycle === 'regular' ? `${cyclePhase} Phase` : `${profile.lifecycle}`}
              </span>
            </div>
            <div className="h-8 w-px bg-daydream" />
            <div className="text-right">
              <span className="text-sm font-bold text-kale/50 uppercase tracking-[0.2em] block font-mono">System Anchor</span>
              <span className="text-sm font-serif italic text-kale leading-none block mt-1">{formatDisplayDate(currentDateStr)}</span>
            </div>
            <div className="h-8 w-px bg-daydream" />
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cinnamon" />
              <span className="text-sm font-bold text-kale/70 uppercase tracking-widest font-mono">mikaela@mdeatswellness.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Worldwide Interactive Calendar & Clock Hub */}
        <div className="mb-8">
          <div className="bg-[#FAF7F2] border border-daydream rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_2px_12px_rgba(44,53,43,0.03)]">
            {/* Leftside: Real-time World Clock & Active Menstrual Calibrator */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-coconut text-cinnamon rounded-2xl border border-daydream flex items-center justify-center shadow-xs">
                <Clock className="h-6 w-6 stroke-[1.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm uppercase tracking-[0.2em] text-kale/60 font-mono font-bold">WORLDWIDE LOGGING SYNCHRONIZER</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
                </div>
                <h3 className="text-sm font-bold font-serif text-kale flex items-center gap-1.5 mt-0.5 truncate">
                  <span>Current Journal Page:</span>
                  <span className="italic text-cinnamon">{formatDisplayDate(currentDateStr)}</span>
                </h3>
                {/* Ticking live clock displaying real world current time */}
                <span className="text-sm text-kale/50 font-mono mt-0.5 block">
                  Live Clock: <span className="text-kale font-bold">{liveTimeStr}</span> • Timezone: <span className="font-bold text-sage">{typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'GMT'}</span>
                </span>
              </div>
            </div>

            {/* Rightside: Quick Navigation & Custom Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePreviousDay}
                className="px-3.5 py-2 bg-coconut hover:bg-daydream/25 text-kale border border-daydream text-sm font-mono font-bold uppercase rounded-xl transition flex items-center gap-1 select-none cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev Day
              </button>
              
              <button
                onClick={handleSetToToday}
                className={`px-3.5 py-2 text-sm font-mono font-bold uppercase rounded-xl border transition flex items-center gap-1 select-none cursor-pointer ${
                  isCurrentlyToday()
                    ? 'bg-cinnamon text-coconut border-cinnamon'
                    : 'bg-coconut hover:bg-daydream/25 text-kale border-daydream'
                }`}
                title="Sync to Today's Real World Date"
              >
                <CalendarDays className="h-3.5 w-3.5" /> Sync Today
              </button>

              <button
                onClick={handleNextDay}
                className="px-3.5 py-2 bg-coconut hover:bg-daydream/25 text-kale border border-daydream text-sm font-mono font-bold uppercase rounded-xl transition flex items-center gap-1 select-none cursor-pointer"
                title="Next Day"
              >
                Next Day <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <div className="h-8 w-px bg-daydream hidden sm:block mx-1" />

              {/* Direct date picker control with custom aesthetics */}
              <div className="relative">
                <input
                  type="date"
                  value={currentDateStr}
                  onChange={handleDirectDateChange}
                  className="px-3 py-2 bg-coconut hover:bg-daydream/25 text-kale border border-daydream text-sm font-mono font-extrabold uppercase rounded-xl focus:outline-none focus:border-sage transition h-[36px] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto gap-6 border-b border-daydream pb-0.5 mb-8 scrollbar-none shrink-0 select-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-kale text-kale font-extrabold'
                : 'text-kale/50 hover:text-kale'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'meals'
                ? 'border-b-2 border-kale text-kale font-extrabold'
                : 'text-kale/50 hover:text-kale'
            }`}
          >
            Fuel & Foods ({activeFoods.length})
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'workouts'
                ? 'border-b-2 border-kale text-kale font-extrabold'
                : 'text-kale/50 hover:text-kale'
            }`}
          >
            Training Progress ({activeWorkouts.length})
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'symptoms'
                ? 'border-b-2 border-kale text-kale font-extrabold'
                : 'text-kale/50 hover:text-kale'
            }`}
          >
            Symptom Index
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-b-2 border-kale text-kale font-extrabold flex items-center gap-1.5'
                : 'text-kale/50 hover:text-kale flex items-center gap-1.5'
            }`}
          >
            <Sparkles className="h-3 w-3 text-cinnamon" />
            AI PhysioCoach
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-b-2 border-kale text-kale font-extrabold'
                : 'text-kale/50 hover:text-kale'
            }`}
          >
            Somatic Profile
          </button>
          <button
            onClick={() => setActiveTab('beta')}
            className={`pb-3 text-sm font-mono uppercase tracking-[0.2em] outline-none transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'beta'
                ? 'border-b-2 border-cinnamon text-cinnamon font-extrabold font-bold'
                : 'text-cinnamon/80 hover:text-cinnamon font-bold'
            }`}
          >
            <Heart className="h-3 w-3 animate-pulse" />
            Beta Playbook & Feedback
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex flex-col gap-6">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* Beta Program Banner */}
              <div 
                onClick={() => setActiveTab('beta')}
                className="bg-coconut border border-cinnamon/30 hover:border-cinnamon rounded-3xl p-5 shadow-sm transition duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cinnamon text-coconut rounded-full shrink-0">
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif italic text-kale font-bold flex items-center gap-2">
                      Sérénité Active by MDeats • Beta
                      <span className="text-[11px] font-mono font-bold text-coconut bg-cinnamon px-1.5 py-0.5 rounded-sm uppercase tracking-wide">BETA</span>
                    </h4>
                    <p className="text-sm text-kale/85 font-sans leading-relaxed mt-0.5 max-w-4xl">
                      To synchronize hormonal targets properly, you should have a clear goal in mind. Unsure which Basal Metabolic Rate (BMR) formula suits your frame, bone density, or active muscles? Click here to read the <strong className="text-cinnamon">Beta Playbook & Formula Guide</strong> and easily log your feedback.
                    </p>
                  </div>
                </div>
                <div className="text-sm font-mono uppercase tracking-wider font-bold text-cinnamon shrink-0 border border-daydream bg-coconut/50 px-3.5 py-2 rounded-xl hover:bg-coconut transition">
                  Open Playbook →
                </div>
              </div>

              {/* Top Row: Menstrual Timeline Sync and Energy Availability Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CycleTimeline 
                    profile={profile} 
                    currentDateStr={currentDateStr} 
                  />
                </div>
                <div>
                  <EnergyAvailabilityCard 
                    calorieIntake={totalCaloriesIn}
                    exerciseExpenditure={workoutKcalBurned}
                    weightKg={profile.weightKg}
                    bodyFatPercent={profile.bodyFatPercent}
                  />
                </div>
              </div>

              {/* Dynamic Energy rings container */}
              <div className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between border-b border-daydream pb-5 mb-6 gap-3">
                  <div>
                    <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">Automatic Glycogen Synchrony</span>
                    <h3 className="text-xl font-serif italic text-kale mt-1 tracking-tight leading-none">
                      Active Lifestyle Macro Alignment
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {profile.useCustomMacros && (
                      <span className="text-sm font-mono bg-cinnamon text-coconut px-2.5 py-1.5 font-bold uppercase tracking-wider leading-none rounded">
                        Manual Macro Override
                      </span>
                    )}
                    {metabolicOffset > 0 && (
                      <span className="text-sm font-mono bg-sage text-coconut px-2.5 py-1.5 font-bold uppercase tracking-wider leading-none rounded">
                        Metabolic Offset: −{metabolicOffset} kcal
                      </span>
                    )}
                    {profile.adjustForExercise && workoutKcalBurned > 0 && (
                      <span className="text-sm font-mono bg-cinnamon text-coconut px-2.5 py-1.5 font-bold uppercase tracking-wider leading-none rounded">
                        +{workoutKcalBurned} kcal — exercise adjusted
                      </span>
                    )}
                    <div className="text-sm font-mono bg-kale text-coconut px-3.5 py-1.5 font-bold uppercase tracking-widest leading-none rounded">
                       Energy Target: {finalCaloriesTarget} kcal
                    </div>
                    {proteinTarget.trainingBoostGrams > 0 && (
                      <div className="text-sm font-serif italic text-sage mt-1">
                        +{proteinTarget.trainingBoostGrams}g protein — training day boost
                      </div>
                    )}
                    <div className="text-sm font-serif italic text-kale/50 mt-1">
                      Aim for {proteinTarget.perMealMinGrams}g protein minimum per meal
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Calorie Ring */}
                  <MetricRing 
                    label="CALORIES" 
                    current={totalCaloriesIn} 
                    target={finalCaloriesTarget} 
                    unit="kcal" 
                    colorClass="stroke-kale" 
                    bgStrokeClass="stroke-daydream"
                  />
                  {/* Crab Ring */}
                  <MetricRing 
                    label="CARBOHYDRATES" 
                    current={totalCarbsIn} 
                    target={targetCarbsGrams} 
                    unit="g" 
                    colorClass="stroke-cinnamon" 
                    bgStrokeClass="stroke-daydream/50"
                  />
                  {/* Protein Ring */}
                  <MetricRing 
                    label="PROTEIN" 
                    current={totalProteinIn} 
                    target={proteinTarget.totalGrams} 
                    unit="g" 
                    colorClass="stroke-sage" 
                    bgStrokeClass="stroke-daydream/50"
                  />
                  {/* Fat Ring */}
                  <MetricRing 
                    label="FATS" 
                    current={totalFatIn} 
                    target={targetFatGrams} 
                    unit="g" 
                    colorClass="stroke-kale/65" 
                    bgStrokeClass="stroke-daydream/30"
                  />
                </div>
              </div>

              {/* Bio-energetic Trends Section */}
              <TrendsChart 
                todayIntake={totalCaloriesIn}
                todayExpenditure={tdeeCaloriesTarget + workoutKcalBurned}
                todayWorkout={workoutKcalBurned}
                tdee={tdeeCaloriesTarget}
                allFoods={foods}
                allWorkouts={workouts}
                currentDateStr={currentDateStr}
              />

              {/* Micronutrients and Quick-Tips grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Iron, Calcium, Sodium Bars (Left & Mid columns merged, or neat widgets) */}
                <div className="md:col-span-2 bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
                  <div>
                    <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">Physiology Micronutrients</span>
                    <h3 className="text-xl font-serif italic text-kale tracking-tight leading-none mt-1">
                      Active Physiology Co-factors & Minerals
                    </h3>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Iron ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline text-sm font-semibold leading-none">
                        <span className="text-cinnamon font-serif font-bold italic">Iron (Fe): Oxygen & Hemoglobin support</span>
                        <span className="font-mono text-sm text-kale">
                          {totalIronIn.toFixed(1)}mg / <span className="opacity-60">{targetIronMg}mg</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-kale/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cinnamon rounded-full transition-all duration-700" 
                          style={{ width: `${Math.min((totalIronIn / targetIronMg) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-kale/70 leading-relaxed font-sans">
                        {profile.lifecycle === 'regular' && cyclePhase === 'menstrual' 
                          ? "✦ Critical Menstrual Window: High loss. Elevated to replace menses blood loss and fuel cognitive load." 
                          : "Supports vital oxygen carriage and immune resistance under training pressure."}
                      </span>
                    </div>

                    {/* Calcium ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline text-sm font-semibold leading-none">
                        <span className="text-kale font-serif font-bold italic">Calcium (Ca): Musculoskeletal density</span>
                        <span className="font-mono text-sm text-kale">
                          {totalCalciumIn}mg / <span className="opacity-60">{targetCalciumMg}mg</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-kale/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-kale rounded-full transition-all duration-700" 
                          style={{ width: `${Math.min((totalCalciumIn / targetCalciumMg) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-kale/70 leading-relaxed font-sans">
                        {profile.lifecycle === 'menopause' 
                          ? "✦ Bone Remodeling window: Absence of estrogen triggers skeletal calcium extraction. Target elevated to 1200mg." 
                          : "Crucial post-impact signal transductor. Keeps calcium-sensing receptors saturated."}
                      </span>
                    </div>

                    {/* Sodium ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline text-sm font-semibold leading-none font-sans">
                        <span className="text-sage font-serif font-bold italic">Sodium (Na): Plasma expansion reserves</span>
                        <span className="font-mono text-sm text-kale">
                          {totalSodiumIn}mg / <span className="opacity-60">{targetSodiumMg}mg</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-kale/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sage rounded-full transition-all duration-700" 
                          style={{ width: `${Math.min((totalSodiumIn / targetSodiumMg) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-kale/70 leading-relaxed font-sans">
                        {cyclePhase === 'luteal' 
                          ? "✦ High Progesterone Plasma Loss: Blood serum volume drops. Extra sodium maintains physical cardiac stroke margins." 
                          : "Essential for standard action potential transmission and physical sweat replenishment."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Physiology Quick Tip Column */}
                <div className="bg-coconut/55 rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-2.5">
                      <div className="p-2.5 bg-kale text-coconut rounded-full shrink-0">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-kale/50 uppercase tracking-widest block font-mono">advice window</span>
                        <h3 className="text-base font-serif italic text-kale leading-tight">
                          Somatic Cue
                        </h3>
                      </div>
                    </div>

                    {/* Dynamic advice copy */}
                    <div className="my-5 text-sm text-kale leading-relaxed font-serif italic bg-coconut p-5 rounded-[24px] border border-daydream shadow-[0_2px_10px_rgba(59,74,63,0.01)]">
                      {profile.lifecycle === 'perimenopause' ? (
                        <>
                          {cyclePhase === 'menstrual' && (
                            <p>
                              "For active women in perimenopause, period flows can be variable. Prioritize premium <strong>iron paired with Vitamin C</strong> to guard against menses fatigue. Focus on smart resistance loading as low hormones invite metabolic resilience."
                            </p>
                          )}
                          {cyclePhase === 'follicular' && (
                            <p>
                              "As estrogen rises, lean mass synthesis is ideal. Leverage this to perform quality <strong>strength training</strong>. Consistent muscle stimuli are vital to combat progressive anabolic resistance and support joint integrity."
                            </p>
                          )}
                          {cyclePhase === 'ovulatory' && (
                            <p>
                              "Estrogen swings can affect tendon compliance and lead to hot flashes. Ensure quality neuromotor warmups today. Avoid long, exhaustive cardio sessions that elevate resting adrenaline and cortisol."
                            </p>
                          )}
                          {cyclePhase === 'luteal' && (
                            <p>
                              "Fluctuating progesterone alters sleep depth and evening glucose storage. Stabilize blood sugar with slow, <strong>complex carbohydrates</strong> and high-quality protein. Elevate magnesium bisglycinate before bed to calm night temperature spikes."
                            </p>
                          )}
                          {cyclePhase === 'none' && (
                            <p>
                              "Keep track of your physical symptoms and overall fatigue. For optimal metabolic stability, focus on fiber-dense plants, organic phytoestrogens, and adequate protein blocks throughout the day."
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {cyclePhase === 'luteal' && (
                            <p>
                              "Progesterone triggers muscle breakdown (catabolism). You require <strong>1.8–2.2g of protein/kg weight</strong> today to support recovery. Drink <strong>300-500mg sodium in cold water 30 minutes pre-workout</strong> to prevent cardiorespiratory strain!"
                            </p>
                          )}
                          {cyclePhase === 'follicular' && (
                            <p>
                              "Estrogen is rising, and carbohydrate storage efficiency in your muscle fibers is optimized. Go heavy today! Your body excels at anaerobically utilizing carbs. Good timing for personal record attempts!"
                            </p>
                          )}
                          {cyclePhase === 'ovulatory' && (
                            <p>
                              "Peak Estrogen boosts muscular power, but high relaxin levels increase ligament laxity. Ensure thorough neuromotor warm-ups. Watch your knee and ankle positioning closely when performing squats and jumps."
                            </p>
                          )}
                          {cyclePhase === 'menstrual' && (
                            <p>
                              "Low systemic hormones allow you to access glucose similarly to men. Take restorative walks if cramps are present. Pair <strong>iron sources with vitamin C</strong> and limit excessive caffeine, which impairs bio-absorption."
                            </p>
                          )}
                          {cyclePhase === 'none' && profile.lifecycle === 'menopause' && (
                            <p>
                              "Lower stable estrogen limits standard muscle recovery signaling. Time <strong>30g to 40g whey or plant equivalent protein</strong> immediately post lifting. Heavy weights are necessary to stimulate bone restructuring."
                            </p>
                          )}
                          {cyclePhase === 'none' && profile.lifecycle !== 'menopause' && (
                            <p>
                              "Ensure you are logging food regularly and matching workout burns. Prevent hypothalamic energy protection by keeping Energy Availability securely above 45 kcal/kg FFM/day."
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-sm font-mono font-bold text-cinnamon tracking-widest uppercase block text-right">
                    Source: Dr. Stacy Sims & Menopause Society Guidelines
                  </div>
                </div>

              </div>

              {/* Today's Somatic Indicator Status */}
              <div className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-daydream pb-4">
                  <div>
                    <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">Today's Biomarkers</span>
                    <h3 className="text-xl font-serif italic text-kale mt-1 tracking-tight leading-none">
                      Logged Somatic Symptoms & Cues
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('symptoms')}
                    className="text-sm font-mono hover:bg-kale hover:text-coconut text-kale border border-kale bg-transparent px-3 py-1.5 font-bold uppercase tracking-widest leading-none rounded-xl transition duration-150 outline-none"
                  >
                    Manage Symptoms & Notes →
                  </button>
                </div>

                {symptoms ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Energy score */}
                    <div className="flex items-center gap-3 bg-[#FAF7F2]/60 p-4 rounded-2xl border border-daydream">
                      <div className="h-10 w-10 bg-cinnamon/10 text-cinnamon rounded-full flex items-center justify-center font-mono font-bold text-lg">
                        {symptoms.energyLevel}
                      </div>
                      <div>
                        <span className="text-sm font-mono text-kale/50 uppercase tracking-wider block">Subjective Energy</span>
                        <strong className="text-sm font-serif text-kale italic">
                          {symptoms.energyLevel <= 2 ? "Low Availability" : symptoms.energyLevel === 3 ? "Balanced" : "Exceptional Power"}
                        </strong>
                      </div>
                    </div>

                    {/* Recovery score */}
                    <div className="flex items-center gap-3 bg-[#FAF7F2]/60 p-4 rounded-2xl border border-daydream">
                      <div className="h-10 w-10 bg-sage/15 text-sage rounded-full flex items-center justify-center font-mono font-bold text-lg">
                        {symptoms.recoveryQuality}
                      </div>
                      <div>
                        <span className="text-sm font-mono text-kale/50 uppercase tracking-wider block">Muscle Recovery</span>
                        <strong className="text-sm font-serif text-kale italic">
                          {symptoms.recoveryQuality <= 2 ? "Incomplete Repair" : symptoms.recoveryQuality === 3 ? "Fully Recovered" : "Optimal Readiness"}
                        </strong>
                      </div>
                    </div>

                    {/* Cravings */}
                    <div className="bg-[#FAF7F2]/60 p-4 rounded-2xl border border-daydream flex flex-col justify-center gap-1">
                      <span className="text-sm font-mono text-kale/50 uppercase tracking-wider block">Active Cravings</span>
                      <div className="flex flex-wrap gap-1">
                        {symptoms.cravings && symptoms.cravings.length > 0 && !symptoms.cravings.includes('None') ? (
                          symptoms.cravings.map(c => (
                            <span key={c} className="text-sm font-mono font-bold text-cinnamon bg-cinnamon/5 px-2 py-0.5 rounded border border-cinnamon/10">
                              {c.split(' (')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-mono text-kale/40">None registered</span>
                        )}
                      </div>
                    </div>

                    {/* Active Symptoms */}
                    <div className="bg-[#FAF7F2]/60 p-4 rounded-2xl border border-daydream flex flex-col justify-center gap-1">
                      <span className="text-sm font-mono text-kale/50 uppercase tracking-wider block">Physical Symptoms</span>
                      <div className="flex flex-wrap gap-1">
                        {symptoms.symptoms && symptoms.symptoms.length > 0 && !symptoms.symptoms.includes('None') ? (
                          symptoms.symptoms.map(s => (
                            <span key={s} className="text-sm font-mono font-bold text-kale bg-sage/10 px-2 py-0.5 rounded border border-sage/20">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-mono text-kale/40">None registered</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-[#FAF7F2]/30 border border-dashed border-daydream rounded-3xl">
                    <span className="text-sm text-kale/50 font-serif italic block">No somatic biomarkers or symptoms logged for today yet.</span>
                    <button
                      onClick={() => setActiveTab('symptoms')}
                      className="mt-3 bg-kale hover:bg-sage text-coconut hover:text-kale font-mono text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition duration-150 inline-flex items-center gap-1.5 outline-none"
                    >
                      <HeartPulse className="h-3 w-3" /> Log Daily Biomarkers
                    </button>
                  </div>
                )}

                {symptoms?.notes && (
                  <div className="p-4 bg-sage/5 rounded-2xl border border-sage/10 text-sm text-kale flex gap-2 items-start leading-relaxed">
                    <span className="font-mono text-sm text-sage font-bold tracking-widest uppercase mt-0.5 shrink-0 select-none">Daily Note:</span>
                    <span className="font-serif italic font-medium">"{symptoms.notes}"</span>
                  </div>
                )}
              </div>

              {/* Clinical Science & Reference Library */}
              <div className="bg-coconut/50 rounded-[40px] p-8 border border-daydream mt-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">clinical science & evidence</span>
                    <h4 className="font-serif italic text-lg font-bold text-kale mt-1">Active Female Physiology & Reference Library</h4>
                    <p className="text-sm text-kale/70 leading-relaxed font-sans mt-0.5">
                      Review the peer-reviewed clinical studies, physiological math formulas, and endocrine guidelines backing every parameter of Sérénité Active by MDeats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResearchDashboard(!showResearchDashboard)}
                    className="border border-daydream bg-coconut hover:bg-[#FAF7F2] text-kale px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition duration-150 inline-flex items-center gap-1.5 self-start shrink-0"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {showResearchDashboard ? "Hide Reference Library" : "Show Reference Library"}
                  </button>
                </div>

                {showResearchDashboard && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-daydream animate-fade-in">
                    {/* Research Card 1 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">01</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Relative Energy Deficiency in Sport (2023 REDs Update)</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Mountjoy, M. et al. (2023) • 2023 IOC Consensus Statement • BJSM</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        The definitive mid-decade clinical update. Expands the definition of REDs beyond elite performance limits to show how recreationally active women face high risks of thyroid down-regulation, bone mass mineral loss, and severe fatigue if energy availability drops below 30 kcal/kg Fat-Free Mass.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Physiological Mechanics:</span>
                        <p className="text-kale/80 font-sans">
                          The <strong className="text-kale font-bold">Energy Availability Tracker</strong> compares energy intake against active expenditure relative to Fat-Free Mass, allowing women of all activity levels (recreational or athletic) to stay above risk thresholds.
                        </p>
                      </div>
                    </div>

                    {/* Research Card 2 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">02</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Estrogen-Progesterone Biphasic Energy Flux</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Frontiers in Physiology (2026) Systematic Review RMR & Menstrual Cycle. Novelle et al. (2023) Frontiers in Endocrinology. Laesser et al. (2025) Diabetic Medicine.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        A 2026 systematic review confirms that simultaneous peak estrogen and progesterone during the mid-luteal phase increases resting metabolic rate, with progesterone linked to increased appetite, higher resting energy expenditure and a shift toward greater fat and protein utilisation. A 2023 editorial in Frontiers in Endocrinology established estrogen as a key regulator of energy homeostasis — suppressing appetite, increasing energy expenditure and acting as an insulin sensitiser during the follicular phase. A 2025 review in Diabetic Medicine confirmed progesterone demonstrates a predominantly unfavourable metabolic profile with its mid-luteal surge consistently linked to decreased insulin sensitivity. These are not minor fluctuations — they fundamentally alter how a woman's body uses fuel across every week of her cycle.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Why Macro Targets Change By Phase:</span>
                        <p className="text-kale/80 font-sans">
                          This app adjusts carbohydrate, protein and fat targets based on your active cycle phase because the underlying physiology demands it. A single daily macro target applied across all phases ignores measurable hormonal metabolic shifts that current research confirms are clinically significant.
                        </p>
                      </div>
                    </div>

                    {/* Research Card 3 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">03</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">BMR Formula Accuracy in Active Women: Fat-Free Mass vs Total Weight</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Cunningham J.J. (1980), Katch-McArdle (validated). Williamson et al. (2023) Gatorade Sports Science Institute. Mallinson et al. (2023) Scand J Med Sci Sports.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Weight-based equations developed from predominantly male or mixed-sex populations consistently misrepresent resting metabolic needs in active women — which is why this app uses only female-validated equations. Owen was derived from an all-female cohort. De Lorenzo was validated specifically in active women. Cunningham and Katch-McArdle anchor calculation to Fat-Free Mass, the gold standard for women who strength train, because muscle tissue is metabolically active and total weight alone cannot capture that. A 2023 Gatorade Sports Science Institute review recommends female endurance athletes target approximately 1.89g protein per kg bodyweight on training days, reflecting updated understanding of female protein turnover. Protein targets in this app are dynamic — adjusting by lifecycle stage, training goal, and workouts logged today. No cycle-phase manipulation; current evidence supports consistent intake over phase-cycling (Colenso-Semple 2025, Gatorade SSI 2025). On days you log a strength session, your target increases automatically to support the 24–48hr muscle protein synthesis window (Mallinson et al. 2023).
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Why Three Formula Options Exist:</span>
                        <p className="text-kale/80 font-sans">
                          The Somatic Profile allows you to select the formula that best matches your body composition. For active women with known body fat percentage, Katch-McArdle or Cunningham will consistently generate more accurate targets than weight-only equations.
                        </p>
                      </div>
                    </div>

                    {/* Research Card 4 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">04</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Anabolic Resistance, Leucine Threshold and Female Muscle Protein Synthesis</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Mallinson et al. (2023) Scand J Med Sci Sports. Boot et al. (2025) Journal of Nutrition. Deane & Atherton (2024) Frontiers in Nutrition.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        A 2023 study in Scandinavian Journal of Medicine and Science in Sports specifically in trained women confirmed 30g of protein post-exercise maximally stimulated muscle protein synthesis rates over 24 hours, with 15g being insufficient. A 2025 study in Journal of Nutrition confirmed plant-derived proteins can match whey protein for muscle protein synthesis in young women when leucine content is matched — validating the plant-based protein options in this app. A 2024 Frontiers in Nutrition review confirmed leucine content rather than total protein quantity is the primary determinant of anabolic response — a finding with critical implications for women managing protein intake across variable-appetite luteal phases.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Why Protein Targets Are Non-Negotiable:</span>
                        <p className="text-kale/80 font-sans">
                          Anabolic resistance increases with age, estrogen fluctuation and energy deficit. This is why protein targets in this app do not reduce during rest days or low-calorie phases — muscle preservation requires consistent leucine-rich protein stimulus regardless of training load or cycle phase.
                        </p>
                      </div>
                    </div>

                    {/* Research Card 5 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">05</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Perimenopause Metabolic Shifts & FSH Fluctuations</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Lobo, R. A. (2008) & Menopause Society Guidelines (2023 Consensus)</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Declining estradiol and soaring Follicle-Stimulating Hormone (FSH) direct fat distribution away from safety depots toward visceral fat cells, slowing down basal thyroid hormone conversion and depressing overall output, regardless of workout frequency.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Perimenopause Balance:</span>
                        <p className="text-kale/80 font-sans">
                          With the <strong className="text-kale font-bold">Health & Vitality</strong> profile option, metabolic offset parameters dynamically calibrate relative carbohydrate-to-fat ratios to help manage insulin sensitivity swings.
                        </p>
                      </div>
                    </div>

                    {/* Research Card 6 */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">06</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Skeletal Calcium Depletion & Remodeling Kinetics</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Eastell, R. et al. (2020) • Journal of Bone and Mineral Research</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Severe bone mineral depletion starts up to 3 years before menopause. Supplying synergistic calcium, Vitamin D3, and Magnesium alongside stable caloric baseline availability suppresses excessive bone resorptive pathways, preserving lasting mineral integrity.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Physiological Mechanics:</span>
                        <p className="text-kale/80 font-sans">
                          The system triggers elevated micronutrient alerts if perimenopause indicators are profile-active, reminding users of trace minerals critical to structural longevity.
                        </p>
                      </div>
                    </div>


                    {/* Research Card 7 - Creatine */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">07</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Creatine Monohydrate in Female Physiology</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Smith-Ryan, A.E. et al. (2021) • Nutrients • Female-Specific Creatine Meta-Analysis</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Creatine is not just for male athletes. In women, creatine supplementation at 3 to 5g daily improves muscular strength, lean mass retention, cognitive function and mood — particularly during the luteal phase when brain creatine demand increases with progesterone. Post-menopausal women show the greatest benefit for bone mineral density and muscle preservation.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Female-Specific Benefit:</span>
                        <p className="text-kale/80 font-sans">Women have 70-80% lower endogenous creatine stores than men yet face equal demands. Supplementation is particularly impactful during menstrual and luteal phases when energy availability naturally dips. Included in the Raw Grams Calculator as a trackable daily supplement.</p>
                      </div>
                    </div>

                    {/* Research Card 8 - Phase Nutrition */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">08</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Cycle-Phase Specific Nutritional Prioritisation</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Gaskins et al. (2019), Chavarro et al. (2018), Lynch and Stoltzfus (2003)</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Each phase of the menstrual cycle creates distinct micronutrient demands regardless of age. Menstrual phase requires iron and B12 to replace haemoglobin losses. Follicular benefits from zinc and complete proteins for follicle maturation. Ovulatory requires anti-inflammatory omega-3 and selenium for LH surge quality. Luteal demands magnesium, B6 and tryptophan for progesterone synthesis and mood stabilisation.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">How This App Applies It:</span>
                        <p className="text-kale/80 font-sans">The Raw Grams Calculator automatically surfaces phase-appropriate proteins and vegetables at the top of each dropdown based on your active cycle phase — marked with a small star indicator. Backed by peer-reviewed micronutrient research.</p>
                      </div>
                    </div>

                    {/* Research Card 7 - Creatine */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">07</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Creatine Monohydrate in Female Physiology</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Smith-Ryan, A.E. et al. (2021) Nutrients. Twycross-Lewis et al. (2016) Amino Acids.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Creatine is not just for male athletes. Women have 70-80% lower endogenous creatine stores than men yet face equal physiological demands. In women, 3-5g daily creatine supplementation improves muscular strength, lean mass retention, cognitive function and mood regulation — particularly during the luteal phase when brain creatine demand increases alongside progesterone rise. Post-menopausal women show the greatest benefit for bone mineral density and muscle preservation, areas of critical clinical concern.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Why It Is In This App:</span>
                        <p className="text-kale/80 font-sans">Creatine is included as a trackable daily supplement in the Raw Grams Calculator. Women are chronically under-supplementing creatine due to outdated male-centric sports nutrition guidance. This app corrects that bias with female-specific dosing context and phase rationale.</p>
                      </div>
                    </div>

                    {/* Research Card 8 - Phase Nutrition */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">08</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Cycle-Phase Micronutrient Variability and Nutritional Prioritisation</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Aguree et al. (2023) J Am Nutr Assoc. Gorczyca et al. (2016) Eur J Nutr. Frontiers in Nutrition (2024) DOI: 10.3389/fnut.2024.1337328</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        A 2023 prospective cohort study measured micronutrient biomarkers across all cycle phases in healthy women, finding zinc declined by 6.6% and magnesium by 4.6% from early follicular to mid-luteal phase — with 29% of women meeting criteria for magnesium deficiency in the luteal phase alone. A 2024 systematic review of 28 experimental studies confirmed targeted nutritional interventions including vitamin D, calcium, magnesium, zinc and curcumin were associated with measurable reductions in menstrual-related symptoms. These findings confirm that nutrition needs are not static across the cycle — they are dynamic, phase-specific and clinically meaningful.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">How This App Applies It:</span>
                        <p className="text-kale/80 font-sans">The Raw Grams Calculator dynamically surfaces phase-appropriate proteins and vegetables at the top of each dropdown based on your active cycle phase, marked with a star indicator. This is not aesthetic personalisation — it is research-driven nutritional prioritisation.</p>
                      </div>
                    </div>

                    {/* Research Card 9 - Estrobolome */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">09</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">The Estrobolome: Gut Microbiome and Estrogen Metabolism</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Hu et al. (2023) Gut Microbes. Cross et al. (2024) Gut Microbes. Kumari et al. (2024) Mol Nutr Food Res.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        The estrobolome is the collection of gut microbial genes that encode enzymes capable of metabolising estrogen. Gut bacteria produce beta-glucuronidase enzymes that deconjugate estrogen from its inactive form back to its active free form, which is then reabsorbed into systemic circulation via enterohepatic cycling. A 2023 review confirmed gut microbial beta-glucuronidase is a vital regulator of circulating estrogen in women. A 2024 study found the gut microbiome directly responds to changes in female sex hormone status, with dysbiosis amplifying metabolic dysfunction. Disruption of the estrobolome has been linked to PCOS, endometriosis, oestrogen-dependent cancers and perimenopausal symptom severity.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Why Fermented Foods Are Prioritised:</span>
                        <p className="text-kale/80 font-sans">Kimchi, tempeh, kefir, miso, sauerkraut and natto appear throughout this app because a diverse gut microbiome directly governs how effectively your body metabolises and clears estrogen. This is not a wellness trend — it is estrogen homeostasis managed through food.</p>
                      </div>
                    </div>

                    {/* Research Card 10 - Clinical Reasoning */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">10</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Why This App Was Built This Way: The Clinical Reasoning</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">MDeats Wellness Clinical Framework. Built by Mikaela Nell, Nutritional Scientist.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        Every existing macro tracking app was built on the same flawed assumption — that a woman's nutritional needs are static and equivalent to a smaller version of a man's. They are not. The female body operates on an infradian rhythm, a 21-35 day hormonal cycle that governs metabolism, energy availability, substrate utilisation, micronutrient handling, immune tone, mood, sleep and recovery. Tracking macros without accounting for this cycle is like navigating with an incomplete map.
                      </p>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed mt-2">
                        This app was built to correct that. Every target, every food suggestion, every micronutrient flag, every energy availability warning exists because the underlying physiology demands it — not because it looks good. The phase-aware macro targets are derived from peer-reviewed energy flux research. The food prioritisation is grounded in micronutrient biomarker studies. The REDs monitoring is built on IOC consensus guidelines. The creatine inclusion is supported by female-specific meta-analyses.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">The Core Principle:</span>
                        <p className="text-kale/80 font-sans">Every woman deserves access to clinical-grade nutritional guidance without a clinical price tag. Sérenité Active exists so that the science that was previously only available in a one-on-one consultation is accessible, beautiful, and in your pocket — every day of your cycle, at every phase of your hormonal life.</p>
                      </div>
                    </div>
                    {/* Research Card 11 - Metabolic Adaptation */}
                    <div className="bg-[#FAF7F2]/55 border border-daydream rounded-3xl p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">11</span>
                        <div>
                          <h5 className="font-serif italic font-bold text-sm text-kale">Metabolic Adaptation in Perimenopause: Why Standard Equations Overshoot</h5>
                          <span className="text-sm font-mono font-semibold text-kale/50">Karppinen et al. (2023) J Clin Endocrinol Metab 108(11). Oelmann et al. (2025) J Int Soc Sports Nutr. Baker et al. (2025) Clin Physiol Funct Imaging.</span>
                        </div>
                      </div>
                      <p className="text-sm text-kale/80 font-sans leading-relaxed">
                        A 2023 study in the Journal of Clinical Endocrinology and Metabolism confirmed that resting energy expenditure declines with age in middle-aged women, independent of fat-free mass — meaning standard BMR equations built on population averages consistently overestimate actual energy needs during hormonal transition. A 2025 study of resistance-trained women across the menopause transition found that weight loss resistance peaks in postmenopause and is significantly elevated in perimenopause even in women adhering to calculated caloric targets — suggesting a clinically meaningful disconnect between equation outputs and actual metabolic reality. A 2025 longitudinal study in Clinical Physiology confirmed significant physiological adaptations across the menopause transition that alter body composition and metabolic flexibility.
                      </p>
                      <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                        <span className="font-mono text-sm font-bold text-cinnamon block uppercase">How This App Applies It:</span>
                        <p className="text-kale/80 font-sans">The Metabolic Adaptation Offset in Somatic Profile allows perimenopausal and postmenopausal women to reduce their calculated calorie target by 150 or 250 kcal — reflecting current evidence that standard equations overshoot energy needs during hormonal transition. This is a clinician-informed adjustment, not a restriction. The minimum floor of 1,200 kcal is maintained regardless of offset selection to protect against dangerous energy deficiency.</p>
                      </div>
                    </div>

                    {/* Added Section for Clinicians */}
                    <div className="md:col-span-2 bg-[#FAF7F2] border border-daydream rounded-3xl p-5 text-sm text-kale/85 font-sans leading-relaxed flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-serif italic text-sm font-bold block text-cinnamon">✦ Professional & Clinical Validation Matrix</span>
                        <p className="text-sm text-kale/70">
                          Are you a clinical nutritionist, physical therapist, or endocrine dietitian? Every target estimation—Owen, De Lorenzo, Cunningham, and Katch-McArdle equations—and our luteal-follicular phase modifiers are natively calculated to match peer-reviewed energy availability studies.
                        </p>
                      </div>
                      <div className="font-mono text-sm bg-coconut border border-daydream/80 rounded-xl px-3 py-1.5 font-bold text-kale text-right shrink-0 uppercase tracking-wider">
                        Clinical Math Core Integration
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: MEALS / FOOD LOGGER */}
          {activeTab === 'meals' && (
            <FoodLogger 
              foods={activeFoods} 
              onAddFood={handleAddFood} 
              onDeleteFood={handleDeleteFood} 
              onUpdateFood={handleUpdateFood}
              cyclePhase={cyclePhase} 
              lifecycle={profile.lifecycle} 
              targetCalories={finalCaloriesTarget}
              targetProtein={targetProteinGrams}
              targetCarbs={targetCarbsGrams}
              targetFat={targetFatGrams}
              targetFibre={(profile.lifecycle === 'menopause' || profile.lifecycle === 'perimenopause') ? 35 : 30}
            />
          )}

          {/* TAB 3: TRAINING WORKOUT LOGGER */}
          {activeTab === 'workouts' && (
            <WorkoutLogger 
              workouts={activeWorkouts} 
              onAddWorkout={handleAddWorkout} 
              onDeleteWorkout={handleDeleteWorkout} 
              userWeightKg={profile.weightKg} 
            />
          )}

          {/* TAB 4: SOMATIC INDICATOR LOGGER */}
          {activeTab === 'symptoms' && (
            <SymptomLogger 
              currentSymptomLog={activeSymptoms} 
              onSaveSymptoms={handleSaveSymptoms} 
              history={symptomsHistory}
              onDeleteHistoryLog={handleDeleteSymptomHistory}
            />
          )}

          {/* TAB 5: AI COACH PANEL */}
          {activeTab === 'ai' && (
            <AiCoachPanel 
              userProfile={profile} 
              currentSummary={currentSummaryPayload} 
            />
          )}

          {/* TAB 6: PROFILE PARAMETERS SETTING */}
          {activeTab === 'profile' && (
            <ProfileSettings 
              profile={profile} 
              onSaveProfile={handleSaveProfile}
              onUpdateOffset={handleUpdateOffset}
              currentDateStr={currentDateStr}
            />
          )}

          {/* TAB 7: BETA PLAYBOOK & TESTER SUITE */}
          {activeTab === 'beta' && (
            <BetaPlaybook 
              currentFormula={profile.bmrFormula || 'cunningham'}
              userEmail="mikaela@mdeatswellness.com"
            />
          )}

        </div>
      </main>
 
      {/* Aesthetic Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-daydream flex flex-wrap justify-between items-center text-kale/50 text-sm font-mono tracking-widest uppercase gap-4">
        <div>
          <span>Sérénité Active by MDeats • Anchor 2026</span>
        </div>
        <div className="italic font-serif text-sm leading-tight text-kale/60 lowercase tracking-normal text-right">
          "educating active women on hormonal synchronization, lifestyle balance, and somatic perimenopause support."
        </div>
      </footer>

    </div>
  );
}
