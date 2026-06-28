/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, FoodLog, WorkoutLog, SymptomLog } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  lifecycle: 'perimenopause',
  weightKg: 68,
  heightCm: 165,
  age: 47,
  bodyFatPercent: 26.5, // Natural healthy distribution for active women in perimenopause
  cycleLength: 32, // Typical fluctuating cycle length
  periodLength: 4,
  lastPeriodDate: '2026-05-13', // Relative to May 30, places them in luteal phase
  activityLevel: 'moderately_active',
  trainingGoal: 'maintenance',
  bmrFormula: 'cunningham'
};

export const INITIAL_FOODS: FoodLog[] = [];

export const INITIAL_WORKOUTS: WorkoutLog[] = [];

export const INITIAL_SYMPTOMS: SymptomLog = {
  id: 's1',
  timestamp: '08:00 AM',
  energyLevel: 4,
  recoveryQuality: 4,
  cravings: ['Salty'],
  symptoms: ['None']
};
