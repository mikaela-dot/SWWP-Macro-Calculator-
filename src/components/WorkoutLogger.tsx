/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutLog } from '../types';
import { Dumbbell, Plus, Trash2, Clock, Zap, Activity } from 'lucide-react';

interface WorkoutLoggerProps {
  workouts: WorkoutLog[];
  onAddWorkout: (workout: WorkoutLog) => void;
  onDeleteWorkout: (id: string) => void;
  userWeightKg: number;
  id?: string;
}

interface WorkoutPreset {
  name: string;
  intensity: 'low' | 'moderate' | 'high';
  kcalPerMin: number; // base estimation multiplier
}

export default function WorkoutLogger({
  workouts,
  onAddWorkout,
  onDeleteWorkout,
  userWeightKg,
  id
}: WorkoutLoggerProps) {
  const [type, setType] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [calories, setCalories] = useState<number | ''>('');
  const [fromWearable, setFromWearable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets: WorkoutPreset[] = [
    { name: 'Heavy Strength Training / Lifting', intensity: 'moderate', kcalPerMin: 6 },
    { name: 'HIIT / Plyometrics Challenge', intensity: 'high', kcalPerMin: 11 },
    { name: 'Endurance / Zone 2 Road Run', intensity: 'moderate', kcalPerMin: 9 },
    { name: 'Mat Pilates, Barre & Joint Mobility', intensity: 'low', kcalPerMin: 4.5 },
    { name: 'Track Sprint / Athletic Interval drills', intensity: 'high', kcalPerMin: 12.5 }
  ];

  // Auto-estimate calorie burn based on duration, intensity and typical female metabolic curves
  const handleEstimateCal = () => {
    if (!duration || Number(duration) <= 0) return;
    
    let burnMultiplier = 6;
    if (intensity === 'low') burnMultiplier = 4.5;
    if (intensity === 'high') burnMultiplier = 11;

    const burn = Math.round(Number(duration) * burnMultiplier);
    setCalories(burn);
  }

  const handleApplyPreset = (preset: WorkoutPreset) => {
    setType(preset.name);
    setIntensity(preset.intensity);
    
    const minutes = duration || 45; // default estimation time
    setDuration(minutes);
    
    const estimate = Math.round(Number(minutes) * preset.kcalPerMin);
    setCalories(estimate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // guards against rapid double-taps submitting twice
    if (!type || !duration || !calories) return;
    setIsSubmitting(true);

    const newWorkout: WorkoutLog = {
      id: 'w_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      durationMinutes: Number(duration),
      intensity,
      caloriesBurned: Number(calories),
      source: fromWearable ? 'wearable' : 'estimated'
    };

    onAddWorkout(newWorkout);

    // reset forms
    setType('');
    setDuration('');
    setIntensity('moderate');
    setCalories('');
    setFromWearable(false);
    setTimeout(() => setIsSubmitting(false), 400); // brief lock to absorb double-taps
  };

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">EXERCISE & STRAIN JOURNAL</span>
        <h2 className="text-xl font-serif italic text-kale mt-1 tracking-tight flex items-center gap-2">
          Training Load & Cardiac Activity
        </h2>
        <p className="text-sm text-kale/70 mt-1 max-w-xl">
          Log exercise events to map metabolic expenditures against real energy availability equations.
        </p>
      </div>

      {/* Quick Presets Builder */}
      <div>
        <span className="text-sm font-bold text-kale/60 uppercase tracking-widest block mb-3 font-mono">
          ✦ Somatic Calibration Presets
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-sm font-semibold bg-coconut/50 hover:bg-kale hover:text-coconut border border-daydream px-3.5 py-2 rounded-xl transition duration-150 text-kale/80 outline-none flex items-center gap-1.5"
            >
              <Activity className="h-3 w-3 text-sage" />
              {p.name.split(' / ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Adding Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-daydream pt-6">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Activity Description *</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. Strength Training & Plyometrics"
            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Duration (minutes) *</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => {
              const val = e.target.value !== '' ? Number(e.target.value) : '';
              setDuration(val);
            }}
            onBlur={handleEstimateCal}
            placeholder="e.g. 60"
            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
            min="1"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Intensity</label>
          <select
            value={intensity}
            onChange={(e) => {
              setIntensity(e.target.value as any);
              // Recalculating estimation directly on change if duration was typed
              if (duration && Number(duration) > 0) {
                let burnMultiplier = 6;
                if (e.target.value === 'low') burnMultiplier = 4.5;
                if (e.target.value === 'high') burnMultiplier = 11;
                setCalories(Math.round(Number(duration) * burnMultiplier));
              }
            }}
            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
          >
            <option value="low">Low (Yoga / Recovery)</option>
            <option value="moderate">Moderate (Lifting / Mid Run)</option>
            <option value="high">High (HIIT / Sprints)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">
            {fromWearable ? 'Wearable Burn (kcal)' : 'Est. Burn (kcal)'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value !== '' ? Number(e.target.value) : '')}
              placeholder="Estimate"
              className="text-sm border border-daydream rounded-xl p-2.5 w-full focus:border-sage focus:outline-none bg-coconut text-kale pr-7"
              required
            />
            {!fromWearable && (
              <button
                 type="button"
                 onClick={handleEstimateCal}
                 className="absolute right-2 top-2.5 text-sm font-bold text-cinnamon hover:text-kale"
                 title="Estimate calories based on factors"
              >
                Calc
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fromWearable}
              onChange={(e) => setFromWearable(e.target.checked)}
              className="w-4 h-4 accent-sage"
            />
            <span className="text-sm font-serif italic text-kale/60">
              Logged from a wearable (Garmin, Apple Watch, Fitbit, Whoop, Oura...)
            </span>
          </label>
        </div>

        <div className="col-span-2 md:col-span-5 flex justify-end pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-mono font-bold leading-none uppercase tracking-widest bg-kale hover:bg-sage hover:text-kale text-coconut rounded-xl transition shadow-xs outline-none flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Workout Event
          </button>
        </div>
      </form>

      {/* Workouts History list */}
      <div className="border-t border-daydream pt-6">
        <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block mb-4 font-mono font-bold">
          Training History today ({workouts.length})
        </span>

        {workouts.length === 0 ? (
          <div className="text-center py-8 text-kale/40 border border-dashed border-daydream rounded-2xl bg-coconut/40">
            <Dumbbell className="h-6 w-6 mx-auto mb-2 opacity-60 stroke-[1.5]" />
            <span className="text-sm font-serif italic">No exercise recorded for today. Calculate burn to check REDs index.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {workouts.map((work) => (
              <div 
                key={work.id} 
                className="flex items-center justify-between p-4 bg-coconut/50 rounded-2xl border border-daydream transition-colors group"
              >
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="bg-kale p-2.5 rounded-full text-coconut">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-serif font-bold italic text-kale truncate">{work.type}</span>
                      <span className="text-sm font-mono bg-kale/5 text-kale/80 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {work.intensity} Load
                      </span>
                    </div>
                    {/* Metrics bottom */}
                    <div className="flex items-center gap-3.5 mt-1 font-mono text-sm text-kale/60">
                      <span className="flex items-center gap-1 font-sans">
                        <Clock className="h-3 w-3" />
                        {work.durationMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="text-cinnamon font-bold font-sans text-sm">
                        -{work.caloriesBurned} kcal
                      </span>
                      <span className="text-sm font-mono opacity-50">({work.timestamp})</span>
                      {work.source === 'wearable' && (
                        <span className="text-sm font-mono bg-sage/20 text-sage px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                          Wearable
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteWorkout(work.id)}
                  className="p-2 opacity-40 hover:bg-rose-50 rounded-xl hover:text-rose-600 transition group-hover:opacity-100 duration-150 outline-none"
                  title="Remove segment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
