/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { FoodLog, WorkoutLog } from '../types';

interface TrendsChartProps {
  todayIntake: number;
  todayExpenditure: number;
  todayWorkout: number;
  tdee: number;
  allFoods: FoodLog[];
  allWorkouts: WorkoutLog[];
  currentDateStr: string;
  id?: string;
}

function formatDayLabel(dateStr: string, isToday: boolean): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const label = `${dayNames[d.getDay()]} ${month}/${day}`;
  return isToday ? `${label} (Today)` : label;
}

function getDateStrOffset(currentDateStr: string, daysBack: number): string {
  const [year, month, day] = currentDateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day - daysBack);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}

export default function TrendsChart({ 
  todayIntake, 
  todayExpenditure, 
  tdee,
  allFoods,
  allWorkouts,
  currentDateStr,
  id 
}: TrendsChartProps) {

  // Build 7 real days from logged data
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const daysBack = 6 - i; // 0 = today, 6 = 6 days ago
    const dateStr = getDateStrOffset(currentDateStr, daysBack);
    const isToday = daysBack === 0;

    const dayFoods = allFoods.filter(f => (f.date || currentDateStr) === dateStr);
    const dayWorkouts = allWorkouts.filter(w => (w.date || currentDateStr) === dateStr);

    const intake = isToday
      ? todayIntake
      : dayFoods.reduce((s, f) => s + (f.calories || 0), 0);

    const workoutBurn = dayWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const expenditure = tdee + workoutBurn;

    const hasData = isToday ? true : dayFoods.length > 0;

    return {
      name: formatDayLabel(dateStr, isToday),
      intake: hasData ? Math.round(intake) : null,
      expenditure: Math.round(expenditure),
      workoutBurn,
      isToday,
      hasData,
      dateStr
    };
  });

  // Averages — only past completed days with actual logged data (not today)
  const completedDays = trendData.filter(d => !d.isToday && d.hasData && d.intake !== null && d.intake > 0);
  const avgIntake = completedDays.length > 0
    ? Math.round(completedDays.reduce((s, d) => s + (d.intake || 0), 0) / completedDays.length)
    : 0;
  const avgExpenditure = Math.round(trendData.reduce((s, d) => s + d.expenditure, 0) / trendData.length);
  const netBalance = avgIntake - avgExpenditure;

  const daysLogged = completedDays.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = trendData.find(d => d.name === label);
      return (
        <div className="bg-coconut border border-daydream p-4 rounded-2xl shadow-md font-sans text-sm max-w-xs text-kale">
          <p className="font-bold font-serif italic text-sm text-kale mb-2">{label}</p>
          {point?.intake !== null && point?.intake !== undefined && point.intake > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between gap-6">
                <span className="flex items-center gap-1.5 font-medium text-cinnamon">
                  <span className="w-2 h-2 rounded-full bg-cinnamon" />
                  Intake:
                </span>
                <span className="font-mono font-bold">{point.intake} kcal</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="flex items-center gap-1.5 font-medium text-kale">
                  <span className="w-2 h-2 rounded-full bg-kale" />
                  Expenditure:
                </span>
                <span className="font-mono font-bold">{point.expenditure} kcal</span>
              </div>
              {point.workoutBurn > 0 && (
                <div className="text-xs text-kale/60 font-mono mt-1">
                  ✦ Workout: {point.workoutBurn} kcal
                </div>
              )}
              {point.isToday && (
                <p className="text-xs text-sage italic mt-2 border-t border-daydream pt-2">
                  Today's intake updates as you log meals — check back at end of day for your full picture.
                </p>
              )}
            </div>
          ) : (
            <p className="text-kale/50 italic text-xs">No food logged this day.</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-daydream pb-5">
        <div>
          <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">7-Day Energy Trend</span>
          <h2 className="text-xl font-serif italic text-kale mt-1 tracking-tight">
            Intake vs. Expenditure
          </h2>
          <p className="text-sm text-kale/70 mt-1 max-w-xl">
            Real data from your food and workout logs. Days with no logged food show expenditure only.
            {daysLogged < 3 && (
              <span className="text-cinnamon"> Log consistently for 3+ days to see meaningful trends.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-coconut/40 border border-daydream px-4 py-2 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cinnamon block" />
            <span className="text-sm font-mono uppercase tracking-wider font-bold text-kale/70">Intake</span>
          </div>
          <div className="h-4 w-px bg-daydream" />
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-kale block" />
            <span className="text-sm font-mono uppercase tracking-wider font-bold text-kale/70">Expenditure</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(59,74,63,0.08)" strokeDasharray="4 4" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(59,74,63,0.2)" 
              tick={{ fill: '#3B4A3F', fontSize: 9, fontFamily: 'Nunito, sans-serif' }}
              dy={10}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(59,74,63,0.2)"
              tick={{ fill: '#3B4A3F', fontSize: 10, fontFamily: 'Nunito, sans-serif' }}
              dx={-5}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="intake"
              name="Intake"
              stroke="#C57D5D"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: '#FAF7F2' }}
              activeDot={{ r: 7, strokeWidth: 0, fill: '#C57D5D' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="expenditure"
              name="Expenditure"
              stroke="#3B4A3F"
              strokeWidth={3}
              strokeDasharray="0"
              dot={{ r: 4, strokeWidth: 1, fill: '#FAF7F2' }}
              activeDot={{ r: 7, strokeWidth: 0, fill: '#3B4A3F' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-daydream pt-6">
        
        <div className="bg-coconut/50 p-4 rounded-3xl border border-daydream flex flex-col justify-between">
          <div>
            <span className="text-sm uppercase tracking-wider font-mono text-kale/60 block">
              {daysLogged > 0 ? `${daysLogged}-Day Average` : 'No History Yet'}
            </span>
            {daysLogged > 0 ? (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-serif italic text-kale font-semibold">{avgIntake}</span>
                <span className="text-sm text-kale/60 font-sans">in</span>
                <span className="text-xl font-serif italic text-kale font-semibold">/ {avgExpenditure}</span>
                <span className="text-sm text-kale/60 font-sans">out</span>
              </div>
            ) : (
              <p className="text-sm font-serif italic text-kale/50 mt-1">Log food for 2+ days to see averages.</p>
            )}
          </div>
          <p className="text-sm text-kale/75 leading-relaxed mt-3 font-sans">
            Based on days where food has been logged. Today's partial intake is excluded from the average.
          </p>
        </div>

        <div className="bg-coconut/50 p-4 rounded-3xl border border-daydream flex flex-col justify-between">
          <div>
            <span className="text-sm uppercase tracking-wider font-mono text-kale/60 block">Energy Balance</span>
            {daysLogged > 0 ? (
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-xl font-serif italic font-semibold ${netBalance >= 0 ? 'text-kale' : 'text-cinnamon'}`}>
                  {netBalance >= 0 ? `+${netBalance}` : netBalance} kcal
                </span>
                <span className="text-sm text-kale/60 font-sans">avg daily</span>
              </div>
            ) : (
              <p className="text-sm font-serif italic text-kale/50 mt-1">No data yet.</p>
            )}
          </div>
          <p className="text-sm text-kale/75 leading-relaxed mt-3 font-sans">
            {daysLogged === 0
              ? "Start logging food to track your energy balance over time."
              : netBalance < -300
              ? "Average intake is notably below expenditure — check this isn't creating an energy availability deficit."
              : netBalance > 300
              ? "Average intake is above expenditure — appropriate for muscle building, worth reviewing if fat loss is the goal."
              : "Energy balance is in a healthy range across logged days."}
          </p>
        </div>

        <div className="bg-coconut/50 p-4 rounded-3xl border border-daydream flex flex-col justify-between">
          <div>
            <span className="text-sm uppercase tracking-wider font-mono text-kale/60 block">Logging Consistency</span>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-kale font-bold">
              <TrendingUp className="h-4 w-4 text-cinnamon" />
              <span>{daysLogged} of 6 past days logged</span>
            </div>
          </div>
          <p className="text-sm text-kale/75 leading-relaxed mt-3 font-sans">
            {daysLogged === 0
              ? "No past days logged yet — start today and build your trend."
              : daysLogged < 3
              ? "Logging a few more days will give you a more accurate picture of your patterns."
              : "Good consistency. The more days you log the more accurate your trend becomes."}
          </p>
        </div>

      </div>

    </div>
  );
}
