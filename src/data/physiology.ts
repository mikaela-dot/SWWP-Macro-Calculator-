/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, MenstrualPhase, LifecycleType, PhaseInfo, ActivityLevel, BmrFormula } from '../types';

// Parses a YYYY-MM-DD string as a calendar date with no timezone conversion,
// avoiding the bug where `new Date('2026-05-13')` parses as UTC midnight,
// then shifts to the previous local day in timezones ahead of UTC (e.g. NZT).
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // constructed directly in local time, no UTC shift
}

export function calculateCycleDay(lastPeriodDateStr: string, cycleLength: number, targetDateStr: string): number {
  if (!lastPeriodDateStr) return 1;
  const lastPeriod = parseDateOnly(lastPeriodDateStr);
  const targetDate = parseDateOnly(targetDateStr);

  const diffTime = targetDate.getTime() - lastPeriod.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 1; // target date is before last period
  
  const currentDay = (diffDays % cycleLength) + 1;
  return currentDay;
}

export function calculatePhase(profile: UserProfile, targetDateStr: string): MenstrualPhase {
  if (profile.lifecycle !== 'regular' && profile.lifecycle !== 'perimenopause') {
    return 'none';
  }
  
  const currentDay = calculateCycleDay(profile.lastPeriodDate, profile.cycleLength, targetDateStr);
  
  if (currentDay <= profile.periodLength) {
    return 'menstrual';
  } else if (currentDay <= 12) {
    return 'follicular';
  } else if (currentDay <= 15) {
    return 'ovulatory';
  } else {
    return 'luteal';
  }
}

export function getPhaseInfo(phase: MenstrualPhase, lifecycle: LifecycleType): PhaseInfo {
  if (lifecycle === 'menopause') {
    return {
      phase: 'none',
      displayName: 'Post-Menopause Stage',
      durationLabel: 'Consistent Homeostasis',
      hormoneLevels: { estrogen: 'low', progesterone: 'low' },
      physiologySummary: "Estrogen deficiency reduces natural anabolic signaling and insulin sensitivity. Muscle maintenance (sarcopenia prevention) and bone density require elevated leucine threshold (protein trigger) and strong strength stimulation. Metabolism shifts slightly lower, but the body reacts excellently to structured protein windows.",
      nutritionStrategy: "Prioritize protein density (30-40g high-quality protein per meal to trigger muscle protein synthesis via leucine). Focus on calcium-rich foods alongside Vitamin D3 and K2. Mindful complex carbohydrate intake timed around resistance workouts.",
      trainingStrategy: "Focus on heavy resistance training and power lifting to build bone mineral density and sustain lean mass, supplemented by low-intensity steady-state zone 2 cardio for metabolic health.",
      targetMacroRatio: { carbs: 35, protein: 35, fat: 30 },
      keyNutrients: ['Calcium', 'Protein (Leucine)', 'Vitamin D3 + K2', 'Magnesium']
    };
  }
  
  if (lifecycle === 'pregnancy') {
    return {
      phase: 'none',
      displayName: 'Gestational Support Phase',
      durationLabel: 'Trimester Specific Growth',
      hormoneLevels: { estrogen: 'peak', progesterone: 'high' },
      physiologySummary: "Unprecedented hormone elevation supports fetal growth. Blood volume increases up to 50%, placing immense demand on fluid capacity and cardiac outputs. Energy conservation rises, and basal metadata shifts.",
      nutritionStrategy: "Require +300 to +450 kcal depending on trimester. Do not restrict carbohydrates, as they are crucial for fetal brain development. Prioritize critical structural nutrients like folate, choline, and bioavailable iron.",
      trainingStrategy: "Maintain strength routines, focusing on pelvic floor integrity, core stability, and avoiding high impacts or overheating. Prioritize recovery and perceived exertion (RPE 6-7).",
      targetMacroRatio: { carbs: 45, protein: 25, fat: 30 },
      keyNutrients: ['Folic Acid / Folate', 'Choline', 'Iron', 'DHA (Omega-3)']
    };
  }

  if (lifecycle === 'lactation') {
    return {
      phase: 'none',
      displayName: 'Lactation & Postpartum Phase',
      durationLabel: 'Nursing Demands',
      hormoneLevels: { estrogen: 'low', progesterone: 'low' },
      physiologySummary: "Milk production demands huge metabolic energy (~500 extra calories per day) and hydration draw. Elevated levels of prolactin may suppress regular ovulation and joint stiffness might occur due to lingering relaxin.",
      nutritionStrategy: "Maintain a +450 to +500 kcal surplus of clean, whole foods to avoid compromising milk-production or maternal bone density. Ensure exceptional hydration and matching electrolyte profiles (especially sodium).",
      trainingStrategy: "Slowly rebuild core connection (diastasis recti safe exercises), focus on mobility, posterior chain strength for posture, and walking. Limit extreme lactic-acid accumulation exercises immediately before feeding.",
      targetMacroRatio: { carbs: 45, protein: 25, fat: 30 },
      keyNutrients: ['Iodine', 'Choline', 'Calcium', 'Electrolytes']
    };
  }

  if (lifecycle === 'pill') {
    return {
      phase: 'none',
      displayName: 'Monophasic Hormonal State',
      durationLabel: 'Consistent Synced Profile',
      hormoneLevels: { estrogen: 'dropping', progesterone: 'minimal' },
      physiologySummary: "Oral contraceptives suppress the dynamic LH/FSH peaks, preventing ovulation. Estrogen and progesterone remain at steady, moderate levels during active pills and drop during placebo days. Natural cyclical peaks are blunted, keeping metabolism and insulin sensitivity highly stable.",
      nutritionStrategy: "Focus on anti-inflammatory micronutrients, as oral contraceptives can slightly increase oxidative stress. Standard balanced athlete macronutrients are perfect, with steady carb availability to fuel training.",
      trainingStrategy: "Perfect for focusing on linear strength progression. You do not have to worry about cyclical ligament weakness, allowing you to train heavy and with high intensity year-round.",
      targetMacroRatio: { carbs: 45, protein: 25, fat: 30 },
      keyNutrients: ['B-Complex Vitamins', 'Magnesium', 'Zinc', 'Vitamin C']
    };
  }

  // Regular Cycling Phases
  let info: PhaseInfo;
  switch (phase) {
    case 'menstrual':
      info = {
        phase: 'menstrual',
        displayName: 'Menstrual Phase (Day 1-5)',
        durationLabel: 'The Active Reset',
        hormoneLevels: { estrogen: 'low', progesterone: 'low' },
        physiologySummary: "Menses starts. Estrogen and progesterone drop to their lowest levels, resetting the uterine cycle. Systemic inflammation is slightly elevated naturally as prostaglandins work, but recovery potential is high due to low progesterone. Sleep metrics might improve.",
        nutritionStrategy: "Replenish iron levels lost via bleeding (paired with Vitamin C for absorption). Focus on dietary omega-3 fats and warming anti-inflammatory spices (ginger, turmeric) to relieve discomfort.",
        trainingStrategy: "This is a great phase to lift comfortably if you feel up to it, as the body's energy-use pathways resemble those of men. If cramps are severe, transition to restorative yoga, steady walks, or deliberate active recovery.",
        targetMacroRatio: { carbs: 45, protein: 25, fat: 30 },
        keyNutrients: ['Iron', 'Vitamin C', 'Magnesium', 'Omega-3 Fats']
      };
      break;

    case 'follicular':
      info = {
        phase: 'follicular',
        displayName: 'Follicular Phase (Day 6-12)',
        durationLabel: 'Energy & Power Surge',
        hormoneLevels: { estrogen: 'rising', progesterone: 'low' },
        physiologySummary: "Estrogen is steadily climbing, raising systemic energy, mood, and insulin sensitivity. Fuel storage (muscle glycogen availability) is highly efficient, allowing active women to easily access carbohydrates to fuel workouts.",
        nutritionStrategy: "Carbohydrate tolerance is at its peak. Support your daily movement and training with clean carbohydrate choices of varying complexity. Keep protein consistent to build and maintain muscle tissue.",
        trainingStrategy: "Go for it! This is your peak strength phase. Hit steady resistance training, bodyweight challenges, hikes, or energetic movement. Muscle recovery is at its fastest.",
        targetMacroRatio: { carbs: 50, protein: 25, fat: 25 },
        keyNutrients: ['Complex Carbs', 'Protein Builders', 'B6', 'Zinc']
      };
      break;

    case 'ovulatory':
      info = {
        phase: 'ovulatory',
        displayName: 'Ovulatory Phase (Day 13-15)',
        durationLabel: 'Estrogen Peak / Ovulation',
        hormoneLevels: { estrogen: 'peak', progesterone: 'minimal' },
        physiologySummary: "Estrogen spikes to its maximum, and luteinizing hormone (LH) triggers egg release. High estrogen boosts confidence and strength capacity, but also increases ligament laxity (relaxin surges slightly), making joints marginally more sensitive to loading.",
        nutritionStrategy: "Support strength/power capacity with a solid balance of clean energy. Include fiber-rich vegetables (broccoli, cauliflower) to assist the liver in healthy estrogen clearance.",
        trainingStrategy: "Perform strength workouts and active sessions, but ensure a thorough warm-up! Estrogen peaks can lessen neuromuscular control, so focus on pristine posture and controlled joint movements.",
        targetMacroRatio: { carbs: 45, protein: 25, fat: 30 },
        keyNutrients: ['Cruciferous Veggies (DIM)', 'Fiber', 'Calcium', 'Omega-3']
      };
      break;

    case 'luteal':
    default:
      info = {
        phase: 'luteal',
        displayName: 'Luteal Phase (Day 16-28)',
        durationLabel: 'Aerobic & Thermic Shift',
        hormoneLevels: { estrogen: 'dropping', progesterone: 'high' },
        physiologySummary: "Progesterone dominates. Basal body temperature jumps (~0.5°C), expanding your resting metabolic rate (you burn 100-250 kcal more per day). Progesterone increases muscle protein breakdown and reduces glycogen storage efficiency slightly.",
        nutritionStrategy: "Increase daily calorie baseline by 150-250 kcal (or listen to your body) to support the elevated metabolic rate. Prioritize high-quality protein to support recovery, and slow, low-GI complex carbs to steady blood sugar and mood.",
        trainingStrategy: "Your cardiovascular stamina is solid, but look out for heat sensitivities as core temperature is elevated. Focus on moderate resistance lifting, steady long walks or cardio, and extra rest. Keep your pre-workout hydration high.",
        targetMacroRatio: { carbs: 38, protein: 28, fat: 34 },
        keyNutrients: ['Magnesium', 'High Quality Protein', 'Pre-workout Sodium', 'Vitamin B6']
      };
      break;
  }

  // Adjustments specifically for Perimenopause
  if (lifecycle === 'perimenopause') {
    if (phase === 'menstrual') {
      info.displayName = 'Menstrual Phase (Perimenopause Focus)';
      info.physiologySummary = "Period flows can start heavy, light, or erratic due to variable estrogen heights and low progesterone. Systemic inflammation can fluctuate, but low-estrogen windows offer great opportunities for muscular adaptions.";
      info.nutritionStrategy = "Prioritize bioavailable iron (red meat, spinach paired with citrus or vitamin C) to combat heavy flows. Rely on magnesium to relax smooth uterine muscles and alleviate cramps.";
      info.trainingStrategy = "Capitalize on low-baseline hormones to stimulate strength. Go at your own pace; if fatigue is high, substitute power workouts with dynamic stretching, joint mobility work, and restorative hikes.";
      info.keyNutrients = ['Bioavailable Iron', 'Vitamin C', 'Magnesium Bisglycinate', 'Anti-inflammatory Fats'];
    } else if (phase === 'follicular') {
      info.displayName = 'Follicular Phase (Perimenopause Focus)';
      info.physiologySummary = "Estrogen can experience sudden spikes ('estrogen surges') or rise sluggishly, leading to variable energy patterns and unexpected night sweats. Bone remodeling and lean mass signaling depend heavily on high-resistance muscle contractions.";
      info.nutritionStrategy = "Support high insulin sensitivity with complex carbohydrates and smart protein targets. Include cruciferous vegetables like broccoli or Brussels sprouts to naturally assist in healthy liver clearance of estrogen fluctuations.";
      info.trainingStrategy = "Prioritize progressive resistance training! Building and preserving muscle density is paramount to offset age-related protein breakdown. Keep warmups thorough and focused on joint alignment.";
      info.keyNutrients = ['DIM (Cruciferous Veg)', 'Bone-supporting Minerals', 'High-Quality Protein', 'Vitamin D3'];
    } else if (phase === 'ovulatory') {
      info.displayName = 'Ovulatory Phase (Perimenopause Focus)';
      info.physiologySummary = "Ovulation may become skipped entirely (anovulatory cycles) or delayed. When ovulation occurs with high estrogen, joint tendons may experience softening or laxity. Prioritize physical structure.";
      info.nutritionStrategy = "Nourish cellular repair with ample amino acids. Focus on minerals and cooling antioxidant-rich foods to help lower temperature surges and support stable autonomic control.";
      info.trainingStrategy = "Engage in controlled strength training with strict form to safe-guard knee, ankle, and wrist joints from ligament laxity. Avoid exhaustive, chronic-stress workouts that drive cortisol too high.";
      info.keyNutrients = ['Fiber for Estrogen Clearance', 'Zinc', 'Calcium', 'Complete Amino Acids'];
    } else if (phase === 'luteal' || phase === 'none') {
      info.displayName = 'Luteal Phase (Perimenopause Focus)';
      info.physiologySummary = "Due to irregular ovulation, progesterone levels may be low (leading to estrogen dominance). This can exacerbate sleep disruptions, nighttime body heating, low evening serotonin, and carbohydrate cravings.";
      info.nutritionStrategy = "Slightly elevate clean proteins and healthy fats to counter higher progesterone-spurred muscle breakdown. Slow-releasing oats, sweet potatoes, and high-fiber foods will stave off sugar cravings and support blood sugar.";
      info.trainingStrategy = "Prioritize recovery and sleep hygiene. Choose moderate strength exercises, slow resistance lifts, outdoor walks, or restorative yoga over exhaustive high-stress sweat sessions. Manage cortisol carefully.";
      info.keyNutrients = ['Magnesium (for sleep and cortisol)', 'Slow Complex Carbs', 'Ashwagandha/Adaptogens', 'Electrolytes'];
    }
  }

  return info;
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  formula: BmrFormula = 'cunningham',
  bodyFatPercent: number = 24
): number {
  // Defensive clamps — protects against invalid profile data (0, negative, or absurd entries)
  const safeWeight = weightKg > 0 ? weightKg : 60;
  const safeHeight = heightCm > 0 ? heightCm : 165;
  const safeAge = age > 0 ? age : 35;
  const safeBf = Math.min(70, Math.max(5, bodyFatPercent || 24)); // clamp to physiologically plausible range
  const ffm = safeWeight * (1 - safeBf / 100);
  switch (formula) {
    case 'owen':
      // Owen (1986) — female-specific, all-female study cohort
      return 795 + (7.18 * safeWeight);
    case 'de_lorenzo':
      // De Lorenzo — validated specifically in active women
      return (9 * safeWeight) + (11.7 * safeHeight) - (857 * Math.log(safeAge + 1)) + 302;
    case 'katch_mcardle':
      // Katch-McArdle: 370 + 21.6 * FFM
      return 370 + 21.6 * ffm;
    case 'cunningham':
    default:
      // Cunningham: 370 + 22 * FFM — gold standard for trained women
      return 370 + 22 * ffm;
  }
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  activity: ActivityLevel,
  phase: MenstrualPhase,
  lifecycle: LifecycleType,
  formula: BmrFormula = 'cunningham',
  bodyFatPercent: number = 24
): number {
  const bmr = calculateBMR(weightKg, heightCm, age, formula, bodyFatPercent);
  
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9
  };
  
  const factor = activityFactors[activity] || 1.375;
  let tdee = bmr * factor;
  
  // Cycle and lifecycle adjustments — evidence-based, proportional not flat:
  if (lifecycle === 'pregnancy') {
    tdee += 350; // Trimester 2/3 average (SACN 2011)
  } else if (lifecycle === 'lactation') {
    tdee += 500; // Nursing calorie cost (WHO)
  } else if (lifecycle === 'menopause') {
    tdee = Math.round(tdee * 0.95); // ~5% reduction, oestrogen loss reduces metabolic rate
  } else if (lifecycle === 'regular') {
    // Luteal phase: progesterone raises RMR by ~5-8% (Solomon et al., Davidsen et al.)
    if (phase === 'luteal') {
      tdee = Math.round(tdee * 1.06);
    } else if (phase === 'ovulatory') {
      tdee = Math.round(tdee * 1.02); // Slight oestrogen-driven thermogenic effect
    }
  } else if (lifecycle === 'perimenopause') {
    // Perimenopause: ovulation irregular — only apply luteal bump if confirmed luteal phase
    // Conservative 3% to account for intermittent progesterone activity
    if (phase === 'luteal') {
      tdee = Math.round(tdee * 1.03);
    }
  }
  
  return Math.round(tdee);
}

export function calculateEnergyAvailability(
  calorieIntake: number,
  exerciseExpenditure: number,
  weightKg: number,
  bodyFatPercent: number
): {
  ffm: number;
  ea: number;
  status: 'danger' | 'caution' | 'optimal' | 'surplus';
  explanation: string;
} {
  // If body fat isn't provided or implausible, estimate standard 24% for active women
  const bf = (bodyFatPercent > 0 && bodyFatPercent < 70) ? bodyFatPercent : 24;
  const ffm = weightKg * (1 - bf / 100);
  
  // EA = (Energy Intake - Energy Expended) / FFM
  const netEnergy = calorieIntake - exerciseExpenditure;
  const ea = ffm > 0 ? netEnergy / ffm : 0;
  
  let status: 'danger' | 'caution' | 'optimal' | 'surplus' = 'optimal';
  let explanation = '';
  
  if (ea < 30) {
    status = 'danger';
    explanation = "Critical level. High risk of Relative Energy Deficiency in Sport (REDs). Your hypothalamus may downregulate reproduction (amenorrhea), metabolic rate, and bone integrity.";
  } else if (ea < 45) {
    status = 'caution';
    explanation = "Subclinical Low Energy Availability (LEA). Your energy intake is sufficient for recovery but narrow. Monitor fatigue, performance plateaus, and overall sleep.";
  } else if (ea <= 60) {
    status = 'optimal';
    explanation = "Optimal Training Window. Support superb hormone health, thyroid function, muscle tissue healing, and peak power progression safely.";
  } else {
    status = 'surplus';
    explanation = "Full Energy Abundance. Supported window for healthy pregnancy, deep restoration, muscle hypertrophy, or structural metabolic building periods.";
  }
  
  return {
    ffm: Math.round(ffm * 10) / 10,
    ea: Math.round(ea * 10) / 10,
    status,
    explanation
  };
}

