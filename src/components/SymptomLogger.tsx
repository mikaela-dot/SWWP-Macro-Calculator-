/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SymptomLog } from '../types';
import { HeartPulse, Check, Moon, Coffee, Trash2, Calendar, History } from 'lucide-react';

interface SymptomLoggerProps {
  currentSymptomLog?: SymptomLog;
  onSaveSymptoms: (log: SymptomLog) => void;
  history?: SymptomLog[];
  onDeleteHistoryLog?: (id: string) => void;
  id?: string;
}

export default function SymptomLogger({
  currentSymptomLog,
  onSaveSymptoms,
  history = [],
  onDeleteHistoryLog,
  id
}: SymptomLoggerProps) {
  const [energyLevel, setEnergyLevel] = useState<number>(currentSymptomLog?.energyLevel || 3);
  const [recoveryQuality, setRecoveryQuality] = useState<number>(currentSymptomLog?.recoveryQuality || 3);
  
  const [selectedCravings, setSelectedCravings] = useState<string[]>(
    currentSymptomLog?.cravings || []
  );
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    currentSymptomLog?.symptoms || ['None']
  );

  const [notes, setNotes] = useState(currentSymptomLog?.notes || '');

  const cravingsList = ['Sweet (Estrogen Dip)', 'Salty (Plasma expansion)', 'Carbohydrate Focus', 'Low Appetite / Fullness'];
  
  const physiologySymptomsList = [
    'Bleeding / Cramps',
    'Joint Laxity (Knee looseness)',
    'Overheating (Thermal elevation)',
    'Muscle Soreness / Fatigue',
    'Bloating / Water Retention',
    'Brain Fog / Moody Shifts',
    'None'
  ];

  const handleCravingToggle = (craving: string) => {
    if (selectedCravings.includes(craving)) {
      setSelectedCravings(selectedCravings.filter(c => c !== craving));
    } else {
      setSelectedCravings([...selectedCravings, craving]);
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    if (symptom === 'None') {
      setSelectedSymptoms(['None']);
      return;
    }

    let updated = selectedSymptoms.filter(s => s !== 'None');
    if (updated.includes(symptom)) {
      updated = updated.filter(s => s !== symptom);
      if (updated.length === 0) updated = ['None'];
    } else {
      updated.push(symptom);
    }
    setSelectedSymptoms(updated);
  };

  const handleSave = () => {
    const sLog: SymptomLog = {
      id: currentSymptomLog?.id || 's_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      energyLevel,
      recoveryQuality,
      cravings: selectedCravings,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined
    };
    onSaveSymptoms(sLog);
  };

  return (
    <div id={id} className="flex flex-col gap-6">
      
      {/* Logger Card */}
      <div className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
        {/* Title */}
        <div>
          <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">BIOLOGICAL INDICES</span>
          <h2 className="text-xl font-serif italic text-kale mt-1 tracking-tight flex items-center gap-2">
            Somatic Biomarkers & Symptoms
          </h2>
          <p className="text-sm text-kale/70 mt-1 max-w-xl">
            Record physical cycle variables like tissue soreness, thermal thresholds, and autonomic endocrine cues.
          </p>
        </div>

        {/* Slider Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-daydream pb-6">
          
          {/* Energy slider */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-serif font-bold italic text-kale flex items-center gap-1.5">
              <Coffee className="h-4 w-4 text-cinnamon" />
              Subjective Energy Availability Feeling
            </span>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl border font-mono font-bold text-sm transition duration-150 outline-none ${
                    energyLevel === lvl
                      ? 'bg-kale border-kale text-coconut font-black'
                      : 'border-daydream text-kale/55 hover:bg-kale/5 hover:text-kale bg-coconut'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-sm text-kale/60 font-mono leading-relaxed mt-1 block">
              {energyLevel <= 2 && "Feeling lethargic / low baseline glycogen storage reserve today."}
              {energyLevel === 3 && "Standard normal, standard physical output capacity."}
              {energyLevel >= 4 && "Exceptional aerobic performance reserves and nervous system drive!"}
            </span>
          </div>

          {/* Recovery level slider */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-serif font-bold italic text-kale flex items-center gap-1.5">
              <Moon className="h-4 w-4 text-sage" />
              Overnight Muscle Recovery
            </span>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setRecoveryQuality(lvl)}
                  className={`flex-1 py-2 rounded-xl border font-mono font-bold text-sm transition duration-150 outline-none ${
                    recoveryQuality === lvl
                      ? 'bg-kale border-kale text-coconut font-black'
                      : 'border-daydream text-kale/55 hover:bg-kale/5 hover:text-kale bg-coconut'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-sm text-kale/60 font-mono leading-relaxed mt-1 block">
              {recoveryQuality <= 2 && "Incomplete recovery / muscle fibers retaining soreness."}
              {recoveryQuality === 3 && "Standard baseline homeostasis, ready for medium load loads."}
              {recoveryQuality >= 4 && "Strong cellular repair, high physical readiness registered."}
            </span>
          </div>

        </div>

        {/* Cravings Grid toggles */}
        <div>
          <span className="text-sm font-serif font-bold italic text-kale block mb-2 px-1">
            Nutritional Tendencies & Cravings
          </span>
          <div className="flex flex-wrap gap-2">
            {cravingsList.map((craving) => {
              const active = selectedCravings.includes(craving);
              return (
                <button
                  key={craving}
                  type="button"
                  onClick={() => handleCravingToggle(craving)}
                  className={`text-sm py-2 px-3.5 rounded-2xl border font-medium flex items-center gap-1 transition-all outline-none leading-none ${
                    active
                      ? 'bg-kale border-kale text-coconut font-semibold italic'
                      : 'bg-coconut/50 border-daydream text-kale/70 hover:bg-kale/5'
                  }`}
                >
                  {craving}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cycle physical symptom toggles */}
        <div>
          <span className="text-sm font-serif font-bold italic text-kale block mb-2 px-1">
            Autonomic Bio-markers & Symptoms
          </span>
          <div className="flex flex-wrap gap-2">
            {physiologySymptomsList.map((sym) => {
              const active = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSymptomToggle(sym)}
                  className={`text-sm py-2 px-3.5 rounded-2xl border font-medium flex items-center gap-1 transition-all outline-none leading-none ${
                    active
                      ? 'bg-kale border-kale text-coconut font-semibold italic'
                      : 'bg-coconut/50 border-daydream text-kale/70 hover:bg-kale/5'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Symptom notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Daily Physiology Journal Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Mild joint soreness. Guided light resistance and steady walking safely."
            className="text-sm border border-daydream rounded-xl p-3 focus:outline-none focus:border-sage bg-coconut/50 text-kale"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-daydream">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-kale text-coconut font-mono font-bold text-sm leading-none uppercase tracking-widest rounded-xl hover:bg-sage hover:text-kale transition flex items-center gap-2 outline-none"
          >
            <Check className="h-4 w-4" />
            Commit Somatic Log
          </button>
        </div>
      </div>

      {/* History Log Feed */}
      {history.length > 0 && (
        <div className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-daydream pb-4">
            <div className="p-2 bg-[#FAF7F2] text-kale rounded-full">
              <History className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">log archive</span>
              <h3 className="font-serif italic text-lg font-bold text-kale">Somatic Biomarkers History Feed</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div key={item.id} className="p-5 rounded-3xl border border-daydream bg-[#FAF7F2]/40 hover:bg-[#FAF7F2]/70 transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  {/* Date & Time Header */}
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-kale/40" />
                    <span className="text-sm font-mono font-bold text-kale/80">{item.timestamp ? `Today at ${item.timestamp}` : 'Historical Log Entry'}</span>
                    <span className="text-[11px] font-mono bg-sage/10 text-kale px-2 py-0.5 rounded border border-sage/15 uppercase tracking-wider font-semibold">Active Biomarkers Saved</span>
                  </div>

                  {/* Level Metrics */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono text-kale/50 uppercase tracking-wider">Energy availability index:</span>
                      <strong className="text-sm font-mono text-cinnamon font-bold">{item.energyLevel}/5</strong>
                    </div>
                    <div className="h-4 w-px bg-daydream hidden md:block" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono text-kale/50 uppercase tracking-wider">Overnight muscle repair:</span>
                      <strong className="text-sm font-mono text-sage font-bold">{item.recoveryQuality}/5</strong>
                    </div>
                  </div>

                  {/* Cravings and Symptoms displays */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-sm font-mono text-kale/40 uppercase tracking-widest block">Logged cravings</span>
                      <div className="flex flex-wrap gap-1">
                        {item.cravings && item.cravings.length > 0 && !item.cravings.includes('None') ? (
                          item.cravings.map(c => (
                            <span key={c} className="text-sm font-mono font-bold text-cinnamon bg-cinnamon/5 px-2 py-0.5 rounded border border-cinnamon/10">
                              {c.split(' (')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-mono text-kale/35">No cravings noted</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm font-mono text-kale/40 uppercase tracking-widest block">Autonomic patterns</span>
                      <div className="flex flex-wrap gap-1">
                        {item.symptoms && item.symptoms.length > 0 && !item.symptoms.includes('None') ? (
                          item.symptoms.map(s => (
                            <span key={s} className="text-sm font-mono font-bold text-kale bg-sage/10 px-2 py-0.5 rounded border border-sage/20">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-mono text-kale/35">No physical symptoms logged</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Note block */}
                  {item.notes && (
                    <div className="p-3 bg-coconut rounded-xl border border-daydream text-sm text-kale leading-relaxed flex gap-1.5">
                      <span className="font-mono text-sm text-[#3B4A3F]/55 uppercase font-bold tracking-widest select-none mt-0.5">Note:</span>
                      <span className="font-serif italic font-medium">"{item.notes}"</span>
                    </div>
                  )}
                </div>

                {onDeleteHistoryLog && (
                  <button
                    onClick={() => onDeleteHistoryLog(item.id)}
                    className="p-2 md:p-2.5 text-rose-450 hover:text-coconut hover:bg-rose-500 rounded-xl transition-all self-start md:self-center border border-daydream hover:border-rose-500 outline-none select-none shrink-0"
                    title="Delete custom log entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
