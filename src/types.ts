/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LifecycleType = 
  | 'regular'         // Regular cycling
  | 'pill'            // Hormonal contraceptive (retains constant hormone profile)
  | 'perimenopause'   // Transitional phase, fluctuating hormones
  | 'menopause'       // Post-menopause, lower stable hormones
  | 'pregnancy'       // Gestational phases with unique calorie surpluses
  | 'lactation';      // Dynamic lactation demand, high hydration and energy requirements

export type MenstrualPhase = 
  | 'menstrual'       // Day 1-5 (Bleeding, reset point, low energy/iron support)
  | 'follicular'      // Day 6-12 (Rising estrogen, high carb-tolerance, strength)
  | 'ovulatory'       // Day 13-15 (Peak estrogen & LH, ligament laxity caution, power peak)
  | 'luteal'          // Day 16-28 (High progesterone, high fat oxidation, BMR elevation, cravings)
  | 'none';           // For menopause, pregnancy, oral contraceptives, etc.

export type ActivityLevel = 
  | 'sedentary'       // 1.2
  | 'lightly_active'   // 1.375
  | 'moderately_active' // 1.55
  | 'very_active'     // 1.725
  | 'athlete';        // 1.9

export type BmrFormula = 
  | 'owen'             // Owen (Female-specific, total body weight — all-female study cohort)
  | 'de_lorenzo'       // De Lorenzo (Validated specifically in active women)
  | 'cunningham'       // Cunningham (Lean Body Mass focused for highly trained female athletes)
  | 'katch_mcardle';   // Katch-McArdle (Lean Body Mass - Excellent for muscular & larger bone athletic builds)

export type ProteinGoal = 
  | 'wellness'        // General health, staying active — 1.6 g/kg
  | 'maintain'        // Maintain muscle, train regularly — 1.8 g/kg
  | 'recompose'       // Build/recompose, serious training — 2.0 g/kg
  | 'custom';         // User sets their own target

export interface ProteinTarget {
  baseGrams: number;
  trainingBoostGrams: number;
  totalGrams: number;
  perMealMinGrams: number;
  rationale: string;
  gPerKg: number;
}

export interface UserProfile {
  lifecycle: LifecycleType;
  weightKg: number;
  heightCm: number;
  age: number;
  bodyFatPercent: number; // Used to calculate Fat-Free Mass (FFM)
  cycleLength: number;    // Usually 28 days
  periodLength: number;   // Usually 5 days
  lastPeriodDate: string; // YYYY-MM-DD
  activityLevel: ActivityLevel;
  trainingGoal: 'performance' | 'strength' | 'endurance' | 'maintenance' | 'recovery';
  bmrFormula?: BmrFormula; // Selected formula equation
  metabolicOffset?: 0 | 150 | 250; // Perimenopause metabolic adaptation offset (kcal reduction)
  proteinGoal?: ProteinGoal; // Dynamic protein target goal
  adjustForExercise?: boolean; // If true, today's energy target increases by logged workout calories
  useCustomMacros?: boolean;
  customMacroType?: 'percentage' | 'grams';
  customCarbsVal?: number;
  customProteinVal?: number;
  customFatVal?: number;
}

export interface FoodLog {
  id: string;
  name: string;
  timestamp: string;
  calories: number;
  carbs: number;      // in grams
  protein: number;    // in grams
  fat: number;        // in grams
  ironMg?: number;    // Essential in Menstrual
  calciumMg?: number; // Essential in Menopause / General
  sodiumMg?: number;  // Essential pre-workout in Luteal
  fibreG?: number;    // Dietary fibre — gut/hormone health
  date?: string;      // YYYY-MM-DD
}

export interface WorkoutLog {
  id: string;
  timestamp: string;
  type: string;       // e.g., Strength, HIIT, Run, Yoga
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number; // Workout Energy Expenditure (WEE)
  source?: 'estimated' | 'wearable'; // How calories were determined
  date?: string;      // YYYY-MM-DD
}

export interface SymptomLog {
  id: string;
  timestamp: string;
  energyLevel: number; // 1-5
  recoveryQuality: number; // 1-5
  cravings: string[];   // Sweet, Salty, Carb, Low Appetite
  symptoms: string[];   // Bloating, Cramps, Brain Fog, Muscle Soreness, None
  notes?: string;
  date?: string;      // YYYY-MM-DD
}

export interface DailySummary {
  date: string;
  foods: FoodLog[];
  workouts: WorkoutLog[];
  symptoms?: SymptomLog;
}

export interface PhaseInfo {
  phase: MenstrualPhase;
  displayName: string;
  durationLabel: string;
  hormoneLevels: {
    estrogen: 'low' | 'rising' | 'peak' | 'dropping';
    progesterone: 'low' | 'minimal' | 'high' | 'dropping';
  };
  physiologySummary: string;
  nutritionStrategy: string;
  trainingStrategy: string;
  targetMacroRatio: {
    carbs: number;   // % of calories
    protein: number; // % of calories
    fat: number;     // % of calories
  };
  keyNutrients: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
