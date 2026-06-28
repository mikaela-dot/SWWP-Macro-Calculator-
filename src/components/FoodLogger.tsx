/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { FoodLog, MenstrualPhase, LifecycleType } from '../types';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ChefHat, 
  Salad, 
  Loader2, 
  Camera, 
  Search, 
  X, 
  RefreshCw, 
  Sliders, 
  Globe, 
  Utensils, 
  Check, 
  Image, 
  Scale, 
  Upload, 
  Calculator,
  Pencil
} from 'lucide-react';

// ─── MEAL SPLIT BLOCK ────────────────────────────────────────────────────────
interface MealSplitBlockProps {
  foods: FoodLog[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFibre: number;
  mealSplitCount: 3 | 4 | 5;
  setMealSplitCount: (n: 3 | 4 | 5) => void;
  lifecycle: LifecycleType;
}

function MealSplitBlock({ foods, targetCalories, targetProtein, targetCarbs, targetFat, targetFibre, mealSplitCount, setMealSplitCount, lifecycle }: MealSplitBlockProps) {
  const todayCalories = foods.reduce((s, f) => s + (f.calories || 0), 0);
  const todayProtein  = foods.reduce((s, f) => s + (f.protein  || 0), 0);
  const todayCarbs    = foods.reduce((s, f) => s + (f.carbs    || 0), 0);
  const todayFat      = foods.reduce((s, f) => s + (f.fat      || 0), 0);
  const todayFibre    = foods.reduce((s, f) => s + (f.fibreG   || 0), 0);

  const perMealCal  = Math.round(targetCalories / mealSplitCount);
  const perMealPro  = Math.round(targetProtein  / mealSplitCount);
  const perMealCarb = Math.round(targetCarbs    / mealSplitCount);
  const perMealFat  = Math.round(targetFat      / mealSplitCount);
  const perMealFib  = Math.round((targetFibre   / mealSplitCount) * 10) / 10;

  const pct = (val: number, target: number) => target > 0 ? Math.min(100, Math.round((val / target) * 100)) : 0;
  const proMinPerMeal = (lifecycle === 'menopause' || lifecycle === 'perimenopause') ? 35 : 30;

  return (
    <div className="space-y-5">
      {/* Per-meal targets */}
      <div className="bg-[#FAF7F2]/60 border border-daydream/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-sm font-mono uppercase tracking-wider font-bold text-kale flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-cinnamon" /> Today's Meal Split
            </span>
            <p className="text-sm text-kale/55 font-sans mt-1">
              Your daily targets divided across {mealSplitCount} meals — a guide, not a rule.
            </p>
          </div>
          <div className="flex gap-1.5">
            {([3, 4, 5] as (3|4|5)[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMealSplitCount(n)}
                className={`px-3.5 py-1.5 text-sm font-mono font-bold rounded-lg transition ${
                  mealSplitCount === n
                    ? 'bg-kale text-coconut'
                    : 'bg-coconut text-kale/60 border border-daydream hover:text-kale'
                }`}
              >
                {n} meals
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Energy', val: perMealCal, unit: 'kcal', color: 'text-kale' },
            { label: 'Protein', val: perMealPro, unit: 'g', color: 'text-cinnamon' },
            { label: 'Carbs',  val: perMealCarb, unit: 'g', color: 'text-sage' },
            { label: 'Fat',    val: perMealFat,  unit: 'g', color: 'text-[#9A3B26]' },
            { label: 'Fibre',  val: perMealFib,  unit: 'g', color: 'text-sage' },
          ].map((item) => (
            <div key={item.label} className="bg-coconut border border-daydream p-2 rounded-xl text-center">
              <span className={`text-[10px] font-mono uppercase block ${item.color} opacity-60`}>{item.label}</span>
              <strong className={`text-sm font-serif italic block ${item.color}`}>{item.val}{item.unit}</strong>
              <span className="text-[9px] font-mono block text-kale/30">per meal</span>
            </div>
          ))}
        </div>

        {(lifecycle === 'perimenopause' || lifecycle === 'menopause') && (
          <div className="bg-[#EEF4EC] border border-sage/30 rounded-xl p-3">
            <p className="text-sm font-serif italic text-sage leading-relaxed">
              Protein per meal should still reach at least {proMinPerMeal}g to cross the leucine threshold — prioritise protein first, then fill carbs and fat around it.
            </p>
          </div>
        )}
      </div>

      {/* Daily progress */}
      <div className="bg-coconut border border-daydream rounded-2xl p-5 space-y-3">
        <span className="text-sm font-mono uppercase tracking-wider font-bold text-kale/70 block">
          Today's Progress vs. Daily Target
        </span>
        {[
          { label: 'Energy',  val: todayCalories, target: targetCalories, unit: 'kcal', bar: 'bg-kale' },
          { label: 'Protein', val: todayProtein,  target: targetProtein,  unit: 'g',    bar: 'bg-cinnamon' },
          { label: 'Carbs',   val: todayCarbs,    target: targetCarbs,    unit: 'g',    bar: 'bg-sage' },
          { label: 'Fat',     val: todayFat,      target: targetFat,      unit: 'g',    bar: 'bg-[#9A3B26]' },
          { label: 'Fibre',   val: todayFibre,    target: targetFibre,    unit: 'g',    bar: 'bg-sage' },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-sm font-mono mb-1">
              <span className="text-kale/60 uppercase tracking-wide text-xs">{row.label}</span>
              <span className="text-kale/80 font-semibold">
                {Math.round(row.val * 10) / 10}{row.unit} / {row.target}{row.unit}
              </span>
            </div>
            <div className="h-1.5 bg-daydream/40 rounded-full overflow-hidden">
              <div
                className={`h-full ${row.bar} rounded-full transition-all duration-300`}
                style={{ width: `${pct(row.val, row.target)}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-kale/45 font-sans italic pt-1">
          {foods.length === 0
            ? 'Nothing logged yet — use the Barcode Scanner or Smart AI tab to log meals.'
            : `${foods.length} item${foods.length === 1 ? '' : 's'} logged today.`}
        </p>
      </div>
    </div>
  );
}

// ─── FOOD LOGGER ─────────────────────────────────────────────────────────────
interface FoodLoggerProps {
  foods: FoodLog[];
  onAddFood: (food: FoodLog) => void;
  onDeleteFood: (id: string) => void;
  onUpdateFood?: (food: FoodLog) => void;
  cyclePhase: MenstrualPhase;
  lifecycle: LifecycleType;
  id?: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFibre?: number;
}

// Science-backed coefficients based on raw item weight per 100g.
// Active female dietitians use RAW weights to guarantee baseline macronutrient stability.
const RAW_PROTEIN_PRESETS = [
  // ── POULTRY ──────────────────────────────────────────────────────────────
  { id: "chicken_breast", name: "Raw Chicken Breast Skinless", protein: 22.0, fat: 1.5, carbs: 0, cal: 110, iron: 1.0, calcium: 15, sodium: 65, hint: "Pure muscle stimulus highest leucine trigger", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: highest leucine for muscle protein synthesis" },
  { id: "chicken_thigh", name: "Raw Chicken Thigh Skinless", protein: 19.0, fat: 5.0, carbs: 0, cal: 124, iron: 1.1, calcium: 12, sodium: 70, hint: "Higher fat profile supports luteal hormone synthesis", phases: ["luteal","follicular"], phaseNote: "Luteal priority: fat supports progesterone precursor synthesis" },
  { id: "turkey_breast", name: "Raw Turkey Breast Skinless", protein: 22.3, fat: 1.1, carbs: 0, cal: 104, iron: 0.8, calcium: 14, sodium: 60, hint: "L-tryptophan precursor supporting pre-sleep neurotransmitters", phases: ["luteal"], phaseNote: "Luteal priority: tryptophan converts to serotonin countering PMS mood dips" },
  { id: "duck_breast", name: "Raw Duck Breast Skinless", protein: 19.0, fat: 8.0, carbs: 0, cal: 156, iron: 2.7, calcium: 11, sodium: 63, hint: "Rich iron profile ideal for menstrual phase recovery", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: heme iron replaces menses losses" },
  // ── RED MEAT ─────────────────────────────────────────────────────────────
  { id: "sirloin_steak", name: "Raw Sirloin Steak Trimmed", protein: 20.0, fat: 6.0, carbs: 0, cal: 140, iron: 2.4, calcium: 18, sodium: 55, hint: "Iron and zinc dense optimal for follicular phase recovery", phases: ["menstrual","follicular"], phaseNote: "Menstrual/Follicular priority: heme iron and zinc restore post-bleed reserves" },
  { id: "beef_tenderloin", name: "Raw Beef Tenderloin Lean", protein: 21.0, fat: 5.0, carbs: 0, cal: 135, iron: 2.2, calcium: 12, sodium: 50, hint: "Highly bioavailable heme iron counteracts monthly bleed loss", phases: ["menstrual"], phaseNote: "Menstrual priority: most bioavailable iron source available" },
  { id: "beef_mince_lean", name: "Raw Lean Beef Mince", protein: 21.0, fat: 5.0, carbs: 0, cal: 130, iron: 2.3, calcium: 12, sodium: 65, hint: "Versatile heme iron source supporting red blood cell production", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: rebuilds haemoglobin post-bleed" },
  { id: "lamb_leg", name: "Raw Lamb Leg Trimmed", protein: 20.0, fat: 6.5, carbs: 0, cal: 143, iron: 2.7, calcium: 16, sodium: 64, hint: "NZ pasture-raised lamb rich in B12 and zinc", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: B12 and iron synergy for red cell production" },
  { id: "venison", name: "Raw Venison Deer", protein: 22.0, fat: 2.4, carbs: 0, cal: 120, iron: 3.4, calcium: 7, sodium: 51, hint: "Ultra-lean NZ game meat with exceptional iron density", phases: ["menstrual"], phaseNote: "Menstrual priority: highest iron density of all meats" },
  // ── FISH & SEAFOOD ───────────────────────────────────────────────────────
  { id: "salmon_fillet", name: "Raw Salmon Fillet", protein: 20.0, fat: 13.0, carbs: 0, cal: 200, iron: 0.8, calcium: 12, sodium: 60, hint: "Omega-3 dense anti-inflammatory progesterone support", phases: ["luteal","ovulatory"], phaseNote: "Luteal/Ovulatory priority: EPA/DHA suppress prostaglandin-driven inflammation" },
  { id: "ocean_trout", name: "Raw Ocean Trout Fillet", protein: 21.0, fat: 10.0, carbs: 0, cal: 175, iron: 0.7, calcium: 14, sodium: 55, hint: "Rich omega-3 profile supporting follicular anti-inflammation", phases: ["luteal","ovulatory"], phaseNote: "Luteal priority: omega-3 modulates prostaglandin cascade reducing cramp severity" },
  { id: "snapper", name: "Raw NZ Snapper", protein: 22.0, fat: 1.5, carbs: 0, cal: 105, iron: 0.4, calcium: 28, sodium: 60, hint: "Lean NZ white fish high in iodine for thyroid support", phases: ["follicular","luteal"], phaseNote: "All phases: iodine supports thyroid T3/T4 critical for metabolic rate" },
  { id: "tarakihi", name: "Raw Tarakihi NZ", protein: 21.0, fat: 1.2, carbs: 0, cal: 98, iron: 0.4, calcium: 22, sodium: 58, hint: "NZ endemic white fish supporting thyroid synthesis", phases: ["follicular","luteal"], phaseNote: "All phases: iodine-rich NZ endemic white fish" },
  { id: "gurnard", name: "Raw Gurnard NZ", protein: 21.0, fat: 1.1, carbs: 0, cal: 95, iron: 0.3, calcium: 20, sodium: 55, hint: "Delicate NZ white fish with lean amino acid profile", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: lean complete protein supports anabolic window" },
  { id: "blue_cod", name: "Raw Blue Cod NZ", protein: 20.0, fat: 1.2, carbs: 0, cal: 93, iron: 0.3, calcium: 18, sodium: 58, hint: "Prized NZ deep-sea fish with clean protein matrix", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: clean lean protein for muscle synthesis" },
  { id: "kahawai", name: "Raw Kahawai NZ", protein: 22.0, fat: 4.0, carbs: 0, cal: 122, iron: 0.8, calcium: 15, sodium: 60, hint: "NZ omega-3 rich fish supporting inflammation control", phases: ["luteal","menstrual"], phaseNote: "Luteal/Menstrual priority: omega-3 reduces inflammatory prostaglandins" },
  { id: "tuna_fresh", name: "Raw Fresh Tuna Steak", protein: 23.0, fat: 1.0, carbs: 0, cal: 109, iron: 1.0, calcium: 8, sodium: 45, hint: "Highest selenium content supporting thyroid conversion", phases: ["follicular","ovulatory"], phaseNote: "Ovulatory priority: selenium supports LH surge and egg quality" },
  { id: "shrimp_peeled", name: "Raw Peeled Prawns", protein: 24.0, fat: 0.3, carbs: 0, cal: 99, iron: 0.5, calcium: 70, sodium: 111, hint: "Zinc-rich ultra-lean recovery booster supports ovarian health", phases: ["follicular","ovulatory"], phaseNote: "Ovulatory priority: zinc triggers LH surge and supports follicle maturation" },
  { id: "mussels", name: "Raw NZ Green Lip Mussels", protein: 12.0, fat: 2.0, carbs: 3.5, cal: 86, iron: 4.0, calcium: 33, sodium: 286, hint: "NZ superfood with exceptional iron B12 and zinc density", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: iron B12 and zinc triple action for post-bleed recovery" },
  { id: "canned_salmon", name: "Canned Salmon drained", protein: 22.0, fat: 9.0, carbs: 0, cal: 172, iron: 0.9, calcium: 210, sodium: 350, hint: "Bone-in canned salmon highest calcium source in fish", phases: ["luteal","menstrual"], phaseNote: "All phases: bone-in calcium plus omega-3 dual benefit" },
  { id: "tuna_canned", name: "Canned Tuna in Water drained", protein: 25.0, fat: 1.0, carbs: 0, cal: 109, iron: 1.3, calcium: 11, sodium: 300, hint: "Convenient lean protein with minimal fat overhead", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: lean high protein for anabolic window" },
  // ── EGGS & DAIRY ─────────────────────────────────────────────────────────
  { id: "whole_eggs", name: "Whole Raw Eggs", protein: 12.6, fat: 10.0, carbs: 0.7, cal: 143, iron: 1.8, calcium: 56, sodium: 140, hint: "High choline and vitamin D egg yolks aid progesterone conversion", phases: ["luteal","follicular"], phaseNote: "Luteal priority: choline and vitamin D support progesterone receptor sensitivity" },
  { id: "egg_whites", name: "Liquid Pasteurized Egg Whites", protein: 11.0, fat: 0.2, carbs: 0.7, cal: 52, iron: 0.0, calcium: 7, sodium: 166, hint: "Pure fat-free albumin protein isolate excellent texturizer", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: pure protein no fat overhead for anabolic phase" },
  { id: "greek_yogurt", name: "Whole Milk Greek Yogurt Plain", protein: 10.0, fat: 4.5, carbs: 3.6, cal: 97, calcium: 110, iron: 0.1, sodium: 36, hint: "Rich bio-active calcium supports bone density and estrogen pathways", phases: ["luteal","menstrual"], phaseNote: "Luteal priority: calcium reduces PMS severity by 48% per Thys-Jacobs research" },
  { id: "cottage_cheese", name: "Low Fat Cottage Cheese", protein: 11.0, fat: 2.3, carbs: 3.4, cal: 78, calcium: 83, iron: 0.1, sodium: 364, hint: "Casein-rich slow-release protein for overnight muscle repair", phases: ["luteal"], phaseNote: "Luteal priority: slow-release casein supports overnight recovery during high-progesterone sleep disruption" },
  // ── PLANT PROTEINS ───────────────────────────────────────────────────────
  { id: "tofu_firm", name: "Organic Firm Tofu", protein: 8.0, fat: 4.8, carbs: 1.9, cal: 76, iron: 5.4, calcium: 350, sodium: 10, fibre: 0.9, hint: "Plant phytoestrogen support with dense calcium mineral base", phases: ["menstrual","follicular"], phaseNote: "Menstrual/Follicular priority: isoflavones modulate estrogen receptor activity" },
  { id: "tempeh_organic", name: "Organic Fermented Tempeh", protein: 19.0, fat: 11.0, carbs: 9.0, cal: 193, iron: 2.7, calcium: 111, sodium: 9, fibre: 9.0, hint: "Fermented gut-friendly plant aminos supporting healthy microbiomes", phases: ["follicular","luteal"], phaseNote: "All phases: fermented isoflavones plus gut microbiome support for estrogen metabolism" },
  { id: "lentils_cooked", name: "Cooked Red Green Lentils", protein: 9.0, fat: 0.4, carbs: 20.0, cal: 116, iron: 3.3, calcium: 19, sodium: 2, fibre: 7.9, hint: "Non-heme iron plus folate ideal for luteal phase support", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: non-heme iron plus folate for red cell support pair with vitamin C" },
  { id: "chickpeas_cooked", name: "Cooked Chickpeas", protein: 9.0, fat: 3.0, carbs: 27.0, cal: 164, iron: 2.9, calcium: 49, sodium: 7, fibre: 7.6, hint: "Phytoestrogen-rich legume supporting estrogen receptor balance", phases: ["follicular","luteal"], phaseNote: "Follicular priority: phytoestrogens support rising estrogen phase" },
  { id: "black_beans", name: "Cooked Black Beans", protein: 8.9, fat: 0.5, carbs: 24.0, cal: 132, iron: 2.1, calcium: 27, sodium: 1, fibre: 8.7, hint: "Anthocyanin-rich legume with high folate for hormonal methylation", phases: ["luteal","menstrual"], phaseNote: "Luteal priority: folate and B6 support progesterone and mood regulation" },
  { id: "edamame", name: "Shelled Edamame cooked", protein: 11.0, fat: 5.0, carbs: 8.9, cal: 121, iron: 2.3, calcium: 63, sodium: 1, fibre: 5.2, hint: "Complete plant protein with isoflavone estrogen modulation", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: complete protein plus isoflavones support rising estrogen" },
  { id: "faba_bean_protein", name: "Faba Bean Protein Powder", protein: 80.0, fat: 2.0, carbs: 5.0, cal: 357, iron: 6.0, calcium: 40, sodium: 90, hint: "Clean plant protein powder highest leucine in plant category", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: highest leucine plant protein triggers muscle protein synthesis" },
  { id: "pea_protein", name: "Pea Protein Powder", protein: 80.0, fat: 2.0, carbs: 7.0, cal: 365, iron: 5.0, calcium: 30, sodium: 230, hint: "Branched-chain amino rich plant protein for muscle protein synthesis", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: BCAA-rich plant protein supports muscle synthesis across all phases" },
  { id: "white_fish", name: "Raw White Fish Cod", protein: 19.0, fat: 1.0, carbs: 0, cal: 90, iron: 0.4, calcium: 10, sodium: 70, hint: "Ultra-lean amino profile assists thyroid T3 synthesis", phases: ["follicular","ovulatory"], phaseNote: "Follicular priority: ultra-lean protein maximises anabolic window" },
  // ── PERFORMANCE SUPPLEMENTS ──────────────────────────────────────────────
  { id: "creatine_mono", name: "Creatine Monohydrate", protein: 0.0, fat: 0.0, carbs: 0.0, cal: 0, iron: 0.0, calcium: 0, sodium: 0, hint: "Female-specific research shows cognitive and strength benefits especially in luteal phase and perimenopause", phases: ["follicular","ovulatory","luteal"], phaseNote: "Follicular/Ovulatory priority: Smith-Ryan 2021 shows 3-5g daily improves power output and cognitive function in women particularly during low-estrogen windows" },
  { id: "collagen_powder", name: "Hydrolysed Collagen Powder", protein: 90.0, fat: 0.0, carbs: 0.0, cal: 360, iron: 0.0, calcium: 20, sodium: 150, hint: "Type I and III collagen peptides for joint skin and gut lining support", phases: ["luteal","menstrual"], phaseNote: "Luteal/Menstrual priority: collagen supports joint laxity management as relaxin fluctuates" },
  // ── DAIRY PROTEINS ───────────────────────────────────────────────────────────
  { id: "greek_yogurt_0pct", name: "Greek Yogurt 0% Fat Plain", protein: 10.2, fat: 0.4, carbs: 3.6, cal: 59, calcium: 110, iron: 0.1, sodium: 36, fibre: 0, hint: "High protein per calorie — ideal post-workout with berries in follicular phase", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: fast protein source, low fat suits early-day logging" },
  { id: "skyr_plain", name: "Skyr Plain Icelandic Style", protein: 11.0, fat: 0.2, carbs: 4.0, cal: 63, calcium: 135, iron: 0.1, sodium: 40, fibre: 0, hint: "Exceptionally high protein density, very low fat — strong leucine per serve", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: highest protein per calorie of all yogurt-style foods" },
  { id: "cottage_cheese_full", name: "Cottage Cheese Full Fat", protein: 11.1, fat: 4.5, carbs: 3.4, cal: 98, calcium: 83, iron: 0.1, sodium: 364, fibre: 0, hint: "Casein-dominant protein — slow-digesting, ideal before sleep for overnight MPS", phases: ["luteal","menstrual"], phaseNote: "Luteal/Menstrual: casein release matches progesterone-elevated protein oxidation overnight" },
  { id: "ricotta", name: "Ricotta Cheese Whole Milk", protein: 11.3, fat: 13.0, carbs: 3.0, cal: 174, calcium: 207, iron: 0.4, sodium: 84, fibre: 0, hint: "High calcium and whey protein — supports bone density in perimenopause", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: calcium density makes this a standout for bone health across lifecycle" },
  { id: "quark", name: "Quark Plain", protein: 12.0, fat: 0.2, carbs: 4.1, cal: 67, calcium: 95, iron: 0.1, sodium: 41, fibre: 0, hint: "Very high protein per calorie, mild flavour — underused in NZ/AU but widely available", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: second only to skyr for protein density in dairy category" },
  { id: "kefir_plain", name: "Kefir Plain Full Fat", protein: 3.4, fat: 3.5, carbs: 4.5, cal: 61, calcium: 120, iron: 0.1, sodium: 40, fibre: 0, hint: "Probiotic-rich fermented dairy — supports the estrobolome and gut microbiome", phases: ["follicular","luteal","menstrual"], phaseNote: "Follicular/Luteal: probiotic support for estrogen metabolism via gut bacteria" },
  // ── FISH & SEAFOOD EXTRAS ─────────────────────────────────────────────────────
  { id: "canned_sardines", name: "Canned Sardines in Water Drained", protein: 24.6, fat: 11.5, carbs: 0, cal: 208, calcium: 382, iron: 2.9, sodium: 310, fibre: 0, hint: "Exceptional calcium from bones plus EPA/DHA — one of the most micronutrient-dense proteins available", phases: ["menstrual","luteal"], phaseNote: "Menstrual priority: iron and omega-3 combat inflammation and iron losses" },
  { id: "canned_mackerel", name: "Canned Mackerel in Spring Water", protein: 21.0, fat: 8.0, carbs: 0, cal: 156, calcium: 186, iron: 1.4, sodium: 270, fibre: 0, hint: "Omega-3 rich and affordable — supports progesterone clearance and inflammation reduction", phases: ["luteal","menstrual"], phaseNote: "Luteal: EPA/DHA support prostaglandin balance and progesterone clearance" },
  { id: "smoked_salmon", name: "Smoked Salmon Cold Smoked", protein: 25.4, fat: 4.3, carbs: 0, cal: 142, calcium: 11, iron: 0.9, sodium: 784, fibre: 0, hint: "High EPA/DHA plus astaxanthin antioxidant — note high sodium if tracking fluid balance", phases: ["follicular","ovulatory"], phaseNote: "Follicular/Ovulatory: astaxanthin and omega-3 support peak energy and oestrogen activity" },
  { id: "oysters_raw", name: "Raw Pacific Oysters", protein: 9.0, fat: 2.5, carbs: 4.7, cal: 81, calcium: 45, iron: 5.1, sodium: 211, fibre: 0, hint: "Highest zinc food source — zinc is essential for progesterone production and immune function", phases: ["luteal","menstrual"], phaseNote: "Menstrual/Luteal: zinc and iron combination supports hormonal repair and blood replenishment" },
  // ── CONVENIENT PROTEINS ───────────────────────────────────────────────────────
  { id: "deli_turkey", name: "Deli Turkey Breast Sliced", protein: 17.7, fat: 1.0, carbs: 2.0, cal: 89, calcium: 10, iron: 0.8, sodium: 480, fibre: 0, hint: "Lean complete protein — convenient option, watch sodium in processed versions", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: convenient lean protein, pair with vegetables to offset sodium" },
  { id: "chicken_rotisserie", name: "Rotisserie Chicken Breast Skinless", protein: 27.3, fat: 3.0, carbs: 0, cal: 135, calcium: 12, iron: 0.9, sodium: 340, fibre: 0, hint: "Cooked weight values — pre-cooked proteins have higher density per gram than raw", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: highest protein per 100g of any convenient cooked protein" },
  // ── PROTEIN POWDERS ───────────────────────────────────────────────────────────
  { id: "whey_protein", name: "Whey Protein Concentrate Powder", protein: 75.0, fat: 5.5, carbs: 12.0, cal: 375, calcium: 600, iron: 0.8, sodium: 130, fibre: 0, hint: "Fast-digesting — highest leucine of any protein powder, ideal within 30min post-resistance training", phases: ["follicular","ovulatory"], phaseNote: "Follicular/Ovulatory: fast leucine delivery maximises MPS during peak anabolic window" },
  { id: "casein_protein", name: "Micellar Casein Protein Powder", protein: 80.0, fat: 2.0, carbs: 5.0, cal: 360, calcium: 800, iron: 0.5, sodium: 160, fibre: 0, hint: "Slow-digesting 7-8hr release — best taken before sleep for overnight MPS, especially in menopause", phases: ["luteal","menstrual"], phaseNote: "Luteal/Menstrual: sustained overnight amino acid delivery combats progesterone-driven catabolism" },
  { id: "whey_isolate", name: "Whey Protein Isolate Powder", protein: 90.0, fat: 1.0, carbs: 2.0, cal: 380, calcium: 450, iron: 0.4, sodium: 50, fibre: 0, hint: "Purest whey — lowest lactose, highest leucine density, fastest absorption", phases: ["follicular","ovulatory"], phaseNote: "Follicular/Ovulatory: optimal for post-training leucine spike in peak training window" },
  { id: "hemp_protein", name: "Hemp Protein Powder", protein: 50.0, fat: 11.0, carbs: 20.0, cal: 380, calcium: 70, iron: 9.6, sodium: 20, fibre: 18.0, hint: "Complete plant protein with excellent omega-3 ratio — rare in plant proteins, plus high iron", phases: ["menstrual","follicular"], phaseNote: "Menstrual: iron content plus complete amino acid profile supports recovery from blood losses" },
  { id: "soy_protein", name: "Soy Protein Isolate Powder", protein: 88.0, fat: 1.0, carbs: 2.0, cal: 338, calcium: 178, iron: 9.3, sodium: 1000, fibre: 0.5, hint: "Complete plant protein — phytoestrogen content is clinically considered safe at normal food levels", phases: ["follicular","ovulatory","luteal","menstrual"], phaseNote: "All phases: complete amino acid profile, iron comparable to meat sources" },
  // ── PLANT PROTEINS EXTRAS ─────────────────────────────────────────────────────
  { id: "silken_tofu", name: "Silken Tofu", protein: 4.8, fat: 2.7, carbs: 2.0, cal: 55, calcium: 30, iron: 0.8, sodium: 9, fibre: 0.3, hint: "Smooth texture good for smoothies and sauces — lower protein density than firm tofu", phases: ["follicular","ovulatory"], phaseNote: "Follicular: easy-digest plant protein in high-energy phase" },
  { id: "white_beans", name: "Cooked White Cannellini Beans", protein: 9.7, fat: 0.4, carbs: 22.6, cal: 137, calcium: 90, iron: 3.7, sodium: 2, fibre: 6.3, hint: "Iron-rich legume — pair with vitamin C source to enhance non-haem iron absorption", phases: ["menstrual","follicular"], phaseNote: "Menstrual priority: high iron and fibre combination supports replenishment and gut motility" },
  { id: "kidney_beans", name: "Cooked Kidney Beans", protein: 8.7, fat: 0.5, carbs: 22.8, cal: 127, calcium: 43, iron: 2.9, sodium: 2, fibre: 7.4, hint: "High resistant starch supports gut microbiome diversity and satiety hormones", phases: ["luteal","menstrual"], phaseNote: "Luteal: resistant starch feeds beneficial bacteria that support progesterone metabolism" },

];
const RAW_VEG_CARB_PRESETS = [
  { id: "broccoli", name: "Raw Broccoli", protein: 2.8, fat: 0.4, carbs: 6.6, cal: 34, calcium: 47, iron: 0.73, sodium: 33, fibre: 2.6, hint: "Glucosinolates assist follicular/luteal estrogen clearance" },
  { id: "broccolini", name: "Raw Broccolini", protein: 3.5, fat: 0.4, carbs: 6.0, cal: 35, calcium: 52, iron: 0.9, sodium: 20, fibre: 3.0, hint: "Tender cruciferous with concentrated DIM content" },
  { id: "brussels_sprouts", name: "Raw Brussels Sprouts", protein: 3.4, fat: 0.3, carbs: 9.0, cal: 43, calcium: 42, iron: 1.4, sodium: 25, fibre: 3.8, hint: "DIM content balances estrogen ratio pathways" },
  { id: "cauliflower", name: "Raw Cauliflower", protein: 1.9, fat: 0.3, carbs: 5.0, cal: 25, calcium: 22, iron: 0.4, sodium: 30, fibre: 2.0, hint: "Indole-3-carbinol supports phase II liver estrogen detox" },
  { id: "kale_greens", name: "Raw Kale always cook for thyroid", protein: 4.3, fat: 0.9, carbs: 8.8, cal: 49, calcium: 150, iron: 1.5, sodium: 38, fibre: 3.6, hint: "Sulfur-compounds assist liver phase-II hormone detox always cook" },
  { id: "cabbage_red", name: "Raw Red Cabbage", protein: 1.4, fat: 0.1, carbs: 7.4, cal: 31, calcium: 45, iron: 0.8, sodium: 27, fibre: 2.1, hint: "Anthocyanins plus glucosinolates for anti-inflammatory action" },
  { id: "spinach", name: "Raw Spinach Greens", protein: 2.9, fat: 0.4, carbs: 3.6, cal: 23, calcium: 99, iron: 2.7, sodium: 79, fibre: 2.2, hint: "High iron and magnesium for vascular health and uterine recovery" },
  { id: "rocket", name: "Raw Rocket Arugula", protein: 2.6, fat: 0.7, carbs: 3.7, cal: 25, calcium: 160, iron: 1.5, sodium: 27, fibre: 1.6, hint: "Peppery liver-support green rich in folate" },
  { id: "silverbeet", name: "Raw Silverbeet Swiss Chard", protein: 1.9, fat: 0.1, carbs: 3.6, cal: 19, calcium: 51, iron: 1.8, sodium: 213, fibre: 1.6, hint: "High magnesium for luteal phase muscle and nerve support" },
  { id: "bok_choy", name: "Raw Bok Choy", protein: 1.5, fat: 0.2, carbs: 2.2, cal: 13, calcium: 105, iron: 0.8, sodium: 65, fibre: 1.0, hint: "Calcium-rich Asian green supporting bone density" },
  { id: "watercress", name: "Raw Watercress", protein: 2.3, fat: 0.1, carbs: 1.3, cal: 11, calcium: 120, iron: 0.2, sodium: 41, fibre: 0.5, hint: "Highest ORAC antioxidant score of any salad green" },
  { id: "mixed_salad", name: "Raw Garden Mix Greens", protein: 1.5, fat: 0.2, carbs: 3.0, cal: 17, calcium: 35, iron: 1.2, sodium: 20, fibre: 1.5, hint: "Vitamin C amplifies cellular plant iron uptake" },
  { id: "sweet_potato", name: "Raw Sweet Potato Kumara", protein: 1.6, fat: 0.1, carbs: 20.1, cal: 86, calcium: 30, iron: 0.6, sodium: 55, fibre: 3.0, hint: "Low-glycemic complex glycogen crucial baseline perimeno fuel" },
  { id: "beetroot", name: "Raw Beetroot", protein: 1.7, fat: 0.1, carbs: 10.0, cal: 44, calcium: 16, iron: 0.8, sodium: 78, fibre: 2.8, hint: "Nitrates enhance blood flow and reduce luteal fatigue" },
  { id: "carrot", name: "Raw Carrot", protein: 0.9, fat: 0.2, carbs: 10.0, cal: 41, calcium: 33, iron: 0.3, sodium: 69, fibre: 2.8, hint: "Beta-carotene precursor for progesterone-supportive vitamin A" },
  { id: "celeriac", name: "Raw Celeriac Celery Root", protein: 1.5, fat: 0.3, carbs: 9.2, cal: 42, calcium: 43, iron: 0.7, sodium: 100, fibre: 1.8, hint: "Low-calorie root vegetable supporting liver detox pathways" },
  { id: "parsnip", name: "Raw Parsnip", protein: 1.4, fat: 0.3, carbs: 17.0, cal: 71, calcium: 36, iron: 0.6, sodium: 10, fibre: 4.6, hint: "Prebiotic fibre supporting estrogen excretion via gut" },
  { id: "jerusalem_artichoke", name: "Raw Jerusalem Artichoke", protein: 2.0, fat: 0.0, carbs: 17.0, cal: 73, calcium: 14, iron: 3.4, sodium: 4, fibre: 1.6, hint: "Highest inulin content of any vegetable gut microbiome prebiotic" },
  { id: "turnip", name: "Raw Turnip", protein: 0.9, fat: 0.1, carbs: 6.4, cal: 28, calcium: 30, iron: 0.3, sodium: 67, fibre: 1.8, hint: "Low-calorie cruciferous root with mild glucosinolate content" },
  { id: "asparagus_spears", name: "Raw Asparagus Spears", protein: 2.2, fat: 0.1, carbs: 3.9, cal: 20, calcium: 24, iron: 2.1, sodium: 2, fibre: 2.1, hint: "Prebiotic inulin structures nourish short-chain fatty acid gut bugs" },
  { id: "avocado", name: "Raw Avocado", protein: 2.0, fat: 14.7, carbs: 8.5, cal: 160, calcium: 12, iron: 0.6, sodium: 7, fibre: 6.7, hint: "Ovarian lipid substrate essential for luteal progesterone synthesis" },
  { id: "zucchini", name: "Raw Zucchini Courgette", protein: 1.2, fat: 0.3, carbs: 3.1, cal: 17, calcium: 16, iron: 0.4, sodium: 8, fibre: 1.0, hint: "Low-calorie high-volume vegetable for satiety without glycemic load" },
  { id: "capsicum_red", name: "Raw Red Capsicum", protein: 1.0, fat: 0.3, carbs: 6.0, cal: 31, calcium: 7, iron: 0.4, sodium: 4, fibre: 2.1, hint: "Highest vitamin C content amplifies iron absorption" },
  { id: "capsicum_green", name: "Raw Green Capsicum", protein: 0.9, fat: 0.2, carbs: 4.6, cal: 20, calcium: 10, iron: 0.4, sodium: 3, fibre: 1.7, hint: "Vitamin C plus B6 supporting progesterone receptor sensitivity" },
  { id: "fennel", name: "Raw Fennel Bulb", protein: 1.2, fat: 0.2, carbs: 7.3, cal: 31, calcium: 49, iron: 0.7, sodium: 52, fibre: 3.1, hint: "Phytoestrogen anethole supports estrogen balance in perimenopause" },
  { id: "tomato", name: "Fresh Tomato", protein: 0.9, fat: 0.2, carbs: 3.9, cal: 18, calcium: 10, iron: 0.3, sodium: 5, fibre: 1.2, hint: "Lycopene antioxidant supports cellular protection, more bioavailable when cooked" },
  { id: "mushroom_button", name: "Raw Button Mushrooms", protein: 3.1, fat: 0.3, carbs: 3.3, cal: 22, calcium: 3, iron: 0.5, sodium: 5, fibre: 1.0, hint: "Vitamin D2 precursor when sun-exposed, supports bone and mood health" },
  { id: "corn_kernels", name: "Sweet Corn Kernels", protein: 3.3, fat: 1.4, carbs: 19.0, cal: 96, calcium: 2, iron: 0.5, sodium: 15, fibre: 2.7, hint: "Lutein and zeaxanthin support eye health and antioxidant defence" },
  { id: "green_beans", name: "Raw Green Beans", protein: 1.8, fat: 0.2, carbs: 7.0, cal: 31, calcium: 37, iron: 1.0, sodium: 6, fibre: 2.7, hint: "Folate-rich legume vegetable supporting methylation pathways" },
  { id: "snow_peas", name: "Raw Snow Peas", protein: 2.8, fat: 0.2, carbs: 7.6, cal: 42, calcium: 43, iron: 1.5, sodium: 4, fibre: 2.6, hint: "Crisp low-calorie vegetable with meaningful plant iron content" },
  { id: "pumpkin", name: "Raw Pumpkin Squash", protein: 1.0, fat: 0.1, carbs: 6.5, cal: 26, calcium: 21, iron: 0.8, sodium: 1, fibre: 0.5, hint: "Beta-carotene rich, gentle on digestion, low-glycemic complex carb" },
  { id: "celery", name: "Raw Celery", protein: 0.7, fat: 0.2, carbs: 3.0, cal: 16, calcium: 40, iron: 0.2, sodium: 80, fibre: 1.6, hint: "Natural sodium and potassium balance for fluid regulation" },
  { id: "cucumber", name: "Raw Cucumber", protein: 0.7, fat: 0.1, carbs: 3.6, cal: 16, calcium: 16, iron: 0.3, sodium: 2, fibre: 0.5, hint: "Hydrating silicon-rich vegetable supporting connective tissue" },
  { id: "leek", name: "Raw Leek", protein: 1.5, fat: 0.3, carbs: 14.0, cal: 61, calcium: 59, iron: 2.1, sodium: 20, fibre: 1.8, hint: "Prebiotic flavonoids kaempferol supports anti-inflammatory pathways" },
  { id: "shiitake", name: "Raw Shiitake Mushrooms", protein: 2.2, fat: 0.5, carbs: 6.8, cal: 34, calcium: 2, iron: 0.4, sodium: 9, fibre: 2.5, hint: "Lentinan immune modulator supporting NK cell activity" },
  { id: "artichoke", name: "Cooked Globe Artichoke", protein: 3.5, fat: 0.2, carbs: 11.0, cal: 53, calcium: 44, iron: 0.6, sodium: 72, fibre: 5.4, hint: "Cynarin supports bile flow and liver phase detox" },
  { id: "white_rice", name: "Raw Uncooked White Rice", protein: 7.1, fat: 0.7, carbs: 80.0, cal: 350, calcium: 9, iron: 0.8, sodium: 5, fibre: 1.3, hint: "Pure rapid-fill glycogen reload ideal post workout buffer" },
  { id: "brown_rice", name: "Raw Uncooked Brown Rice", protein: 7.5, fat: 2.7, carbs: 77.0, cal: 365, calcium: 23, iron: 2.0, sodium: 7, fibre: 1.8, hint: "Fibre-rich complex carb for stable luteal blood glucose" },
  { id: "jasberry_rice", name: "Raw Uncooked Purple Jasberry Rice", protein: 8.0, fat: 1.5, carbs: 75.0, cal: 355, calcium: 12, iron: 1.2, sodium: 1, fibre: 2.7, hint: "Super-antioxidant anthocyanins fight inflammatory muscle stress" },
  { id: "quinoa_dry", name: "Raw Organic Quinoa Dry", protein: 14.0, fat: 6.0, carbs: 64.0, cal: 368, calcium: 47, iron: 4.6, sodium: 5, fibre: 7.0, hint: "Complete plant protein block rich in folate and vital magnesium" },
  { id: "oats_dry", name: "Raw Dry Rolled Oats", protein: 13.0, fat: 6.9, carbs: 68.0, cal: 389, calcium: 52, iron: 4.7, sodium: 2, fibre: 10.6, hint: "Beta-glucan fibers support gut-estrogen excretion pathway" },
  { id: "buckwheat", name: "Raw Buckwheat Groats", protein: 13.0, fat: 3.4, carbs: 72.0, cal: 343, calcium: 18, iron: 2.2, sodium: 1, fibre: 10.0, hint: "Gluten-free complete protein with rutin for vascular health" },
  { id: "millet", name: "Raw Millet", protein: 11.0, fat: 4.2, carbs: 73.0, cal: 378, calcium: 8, iron: 3.0, sodium: 5, fibre: 8.5, hint: "Gluten-free alkaline grain supporting gut and thyroid health" },
  { id: "blueberries_fresh", name: "Fresh Blueberries", protein: 0.7, fat: 0.3, carbs: 14.0, cal: 57, calcium: 6, iron: 0.3, sodium: 1, fibre: 2.4, hint: "Polyphenolic anthocyanins mitigate systemic cellular free radicals" },
  { id: "tart_cherries", name: "Fresh Tart Cherries", protein: 1.0, fat: 0.3, carbs: 16.0, cal: 63, calcium: 13, iron: 0.4, sodium: 3, fibre: 1.6, hint: "Melatonin precursor plus uricosuric anti-inflammatory compounds" },
  { id: "raspberries", name: "Fresh Raspberries", protein: 1.2, fat: 0.7, carbs: 12.0, cal: 52, calcium: 25, iron: 0.7, sodium: 1, fibre: 6.5, hint: "Ellagic acid supports estrogen metabolism pathways" },
  { id: "strawberries", name: "Fresh Strawberries", protein: 0.8, fat: 0.3, carbs: 8.0, cal: 33, calcium: 16, iron: 0.4, sodium: 1, fibre: 2.0, hint: "Vitamin C maximises non-heme iron absorption from plant foods" },
  { id: "kiwifruit", name: "Fresh Kiwifruit NZ", protein: 1.1, fat: 0.5, carbs: 15.0, cal: 61, calcium: 34, iron: 0.3, sodium: 3, fibre: 3.0, hint: "Actinidin enzyme aids protein digestion plus serotonin precursors" },
  { id: "feijoa", name: "Fresh Feijoa NZ Seasonal", protein: 1.1, fat: 0.4, carbs: 13.0, cal: 55, calcium: 17, iron: 0.1, sodium: 3, fibre: 6.4, hint: "NZ-endemic fruit with high folate and iodine content" },
  { id: "banana_fresh", name: "Fresh Raw Yellow Banana", protein: 1.1, fat: 0.3, carbs: 22.8, cal: 89, calcium: 5, iron: 0.3, sodium: 1, fibre: 2.6, hint: "Potassium dense substrate aids muscle contractions and counters bloating" },
  { id: "apple", name: "Fresh Apple with skin", protein: 0.3, fat: 0.2, carbs: 14.0, cal: 52, calcium: 6, iron: 0.1, sodium: 1, fibre: 2.4, hint: "Pectin prebiotic fibre binds excess estrogen for excretion" },
  { id: "pear", name: "Fresh Pear", protein: 0.4, fat: 0.1, carbs: 15.0, cal: 57, calcium: 9, iron: 0.2, sodium: 1, fibre: 3.1, hint: "Low-fructose fruit gentle on insulin ideal luteal phase snack" },
  { id: "chia_seeds", name: "Raw Chia Seeds", protein: 16.5, fat: 30.7, carbs: 42.1, cal: 486, calcium: 631, iron: 7.7, sodium: 16, fibre: 34.4, hint: "High alpha-linolenic omega-3 and soluble gel fiber to ease constipation" },
  { id: "flaxseed", name: "Ground Flaxseed Linseed", protein: 18.0, fat: 42.0, carbs: 29.0, cal: 534, calcium: 255, iron: 5.7, sodium: 30, fibre: 27.3, hint: "Lignans modulate excess estrogen via enterolactone conversion" },
  { id: "hemp_seeds", name: "Raw Hemp Seeds Hulled", protein: 32.0, fat: 49.0, carbs: 9.0, cal: 553, calcium: 70, iron: 7.9, sodium: 5, fibre: 4.0, hint: "Perfect omega-6 to omega-3 ratio for systemic inflammation control" },
  { id: "pumpkin_seeds", name: "Raw Pumpkin Seeds", protein: 19.0, fat: 19.0, carbs: 18.0, cal: 327, calcium: 46, iron: 8.8, sodium: 7, fibre: 6.0, hint: "Highest zinc source in seeds critical for follicular ovulation trigger" },
  { id: "walnuts", name: "Raw Walnuts", protein: 15.0, fat: 65.0, carbs: 14.0, cal: 654, calcium: 98, iron: 2.9, sodium: 2, fibre: 6.7, hint: "ALA omega-3 plus ellagic acid for anti-inflammatory action" },
  // ── NUT & SEED BUTTERS ───────────────────────────────────────────────────
  { id: "almond_butter", name: "Almond Butter Smooth Unsalted", protein: 21.0, fat: 56.0, carbs: 19.0, cal: 614, calcium: 270, iron: 3.7, sodium: 1, fibre: 10.3, hint: "Vitamin E and magnesium dense — supports luteal muscle relaxation" },
  { id: "almond_butter_homemade", name: "Homemade Almond Butter (whole almonds blended)", protein: 21.2, fat: 49.9, carbs: 21.6, cal: 579, calcium: 264, iron: 3.7, sodium: 1, fibre: 12.5, hint: "Same nutrition as whole raw almonds — blending doesn't change the macros" },
  { id: "peanut_butter_natural", name: "Peanut Butter Natural Unsweetened", protein: 25.0, fat: 50.0, carbs: 20.0, cal: 588, calcium: 43, iron: 1.9, sodium: 5, fibre: 8.0, hint: "Affordable plant protein and niacin source for energy metabolism" },
  { id: "cashew_butter", name: "Cashew Butter Smooth", protein: 17.6, fat: 49.4, carbs: 27.6, cal: 587, calcium: 43, iron: 5.0, sodium: 5, fibre: 3.3, hint: "Copper and magnesium rich — supports iron metabolism and energy" },
  { id: "tahini", name: "Tahini Sesame Seed Paste", protein: 17.0, fat: 54.0, carbs: 21.0, cal: 595, calcium: 426, iron: 4.0, sodium: 115, fibre: 9.3, hint: "Exceptional plant calcium source — supports bone density across all phases" },
  // ── EXPANDED FRUIT VARIETY ───────────────────────────────────────────────
  { id: "orange", name: "Fresh Orange", protein: 0.9, fat: 0.1, carbs: 11.8, cal: 47, calcium: 40, iron: 0.1, sodium: 0, fibre: 2.4, hint: "High vitamin C amplifies plant iron absorption when paired with legumes" },
  { id: "mandarin", name: "Fresh Mandarin NZ", protein: 0.8, fat: 0.3, carbs: 13.3, cal: 53, calcium: 37, iron: 0.2, sodium: 2, fibre: 1.8, hint: "Easy-peel vitamin C source, gentle on digestion" },
  { id: "mango", name: "Fresh Mango", protein: 0.8, fat: 0.4, carbs: 15.0, cal: 60, calcium: 11, iron: 0.2, sodium: 1, fibre: 1.6, hint: "Beta-carotene and vitamin A support skin and mucosal immunity" },
  { id: "pineapple", name: "Fresh Pineapple", protein: 0.5, fat: 0.1, carbs: 13.1, cal: 50, calcium: 13, iron: 0.3, sodium: 1, fibre: 1.4, hint: "Bromelain enzyme supports digestion and has mild anti-inflammatory action" },
  { id: "grapes", name: "Fresh Grapes", protein: 0.7, fat: 0.2, carbs: 18.1, cal: 69, calcium: 10, iron: 0.4, sodium: 2, fibre: 0.9, hint: "Resveratrol polyphenols support vascular and cellular health" },
  { id: "rockmelon", name: "Fresh Rockmelon Cantaloupe", protein: 0.8, fat: 0.2, carbs: 8.2, cal: 34, calcium: 9, iron: 0.2, sodium: 16, fibre: 0.9, hint: "High water content plus potassium for hydration and fluid balance" },
  { id: "watermelon", name: "Fresh Watermelon", protein: 0.6, fat: 0.2, carbs: 7.6, cal: 30, calcium: 7, iron: 0.2, sodium: 1, fibre: 0.4, hint: "Citrulline supports blood flow and may ease luteal phase fluid retention" },
  { id: "peach", name: "Fresh Peach", protein: 0.9, fat: 0.3, carbs: 9.5, cal: 39, calcium: 6, iron: 0.3, sodium: 0, fibre: 1.5, hint: "Gentle low-FODMAP stone fruit, easy on digestion in luteal phase" },
  { id: "plum", name: "Fresh Plum", protein: 0.7, fat: 0.3, carbs: 11.4, cal: 46, calcium: 6, iron: 0.2, sodium: 0, fibre: 1.4, hint: "Sorbitol and fibre support gentle regularity" },
  { id: "passionfruit", name: "Fresh Passionfruit NZ", protein: 2.2, fat: 0.4, carbs: 23.4, cal: 97, calcium: 12, iron: 1.6, sodium: 28, fibre: 10.4, hint: "Exceptionally high fibre per fruit — supports estrobolome gut health" },
  { id: "pomegranate", name: "Fresh Pomegranate Arils", protein: 1.7, fat: 1.2, carbs: 18.7, cal: 83, calcium: 10, iron: 0.3, sodium: 3, fibre: 4.0, hint: "Punicalagins support oestrogen metabolism and antioxidant capacity" },
  { id: "grapefruit", name: "Fresh Grapefruit", protein: 0.8, fat: 0.1, carbs: 10.7, cal: 42, calcium: 22, iron: 0.1, sodium: 0, fibre: 1.6, hint: "Naringenin compound supports liver phase-I detoxification" },
];


// Popular commercial brand products
const POPULAR_COMMERCIAL_PRESETS = [
  { id: "lindt_70", name: "Lindt 70pct Dark Chocolate", calories: 566, protein: 7.2, carbs: 34.0, fat: 42.0, ironMg: 6.7, calciumMg: 50, sodiumMg: 20, brand: "Lindt", macros: "P7g C34g F42g" },
  { id: "lindt_85", name: "Lindt 85pct Dark Chocolate", calories: 584, protein: 9.5, carbs: 19.0, fat: 46.0, ironMg: 10.0, calciumMg: 60, sodiumMg: 15, brand: "Lindt", macros: "P10g C19g F46g" },
  { id: "fage_0", name: "Fage Total 0pct Greek Yogurt", calories: 54, protein: 10.3, carbs: 3.0, fat: 0, ironMg: 0.1, calciumMg: 110, sodiumMg: 36, brand: "Fage", macros: "P10g C3g F0g" },
  { id: "siggis_skyr", name: "Siggis Icelandic Plain Skyr", calories: 57, protein: 10.7, carbs: 3.6, fat: 0, ironMg: 0.1, calciumMg: 115, sodiumMg: 45, brand: "Siggis", macros: "P11g C4g F0g" },
  { id: "rolled_oats", name: "Quaker Old Fashioned Rolled Oats", calories: 379, protein: 13.1, carbs: 67.7, fat: 6.5, ironMg: 4.3, calciumMg: 54, sodiumMg: 2, brand: "Quaker", macros: "P13g C68g F7g" },
  { id: "whey_gold", name: "Optimum Gold Standard Whey Protein", calories: 375, protein: 75.0, carbs: 9.4, fat: 4.7, ironMg: 1.2, calciumMg: 400, sodiumMg: 400, brand: "Optimum Nutrition", macros: "P75g C9g F5g" },
  { id: "peanut_butter", name: "Creamy Peanut Butter", calories: 594, protein: 21.9, carbs: 25.0, fat: 50.0, ironMg: 2.2, calciumMg: 43, sodiumMg: 425, brand: "Generic", macros: "P22g C25g F50g" },
  { id: "almond_milk", name: "Almond Breeze Unsweetened Almond Milk", calories: 15, protein: 0.4, carbs: 0.3, fat: 1.1, ironMg: 0.2, calciumMg: 120, sodiumMg: 70, brand: "Blue Diamond", macros: "P0g C0g F1g" },
  { id: "avocado_hass", name: "Fresh Hass Avocado Flesh", calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, ironMg: 0.6, calciumMg: 12, sodiumMg: 7, brand: "Fresh", macros: "P2g C9g F15g" },
  { id: "banana_yellow", name: "Fresh Yellow Banana", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, ironMg: 0.3, calciumMg: 5, sodiumMg: 1, brand: "Fresh", macros: "P1g C23g F0g" },
  { id: "skyr_plain", name: "Plain Skyr High Protein Yogurt", calories: 63, protein: 11.0, carbs: 4.0, fat: 0.2, ironMg: 0.1, calciumMg: 130, sodiumMg: 50, brand: "Generic", macros: "P11g C4g F0g" },
  { id: "greek_full", name: "Full Fat Greek Yogurt Plain", calories: 97, protein: 10.0, carbs: 3.6, fat: 4.5, ironMg: 0.1, calciumMg: 110, sodiumMg: 36, brand: "Generic", macros: "P10g C4g F5g" },
];


const INTERNATIONAL_BARCODES = [
  { code: "9300601385415", country: "NZ", item: "Sanitarium Weet-Bix" },
  { code: "9415154000014", country: "NZ", item: "Anchor Milk Full Fat" },
  { code: "9310085003000", country: "AU", item: "Uncle Tobys Rolled Oats" },
  { code: "9310072011108", country: "AU", item: "Macro Organic Quinoa" },
  { code: "5449000000996", country: "EU", item: "Coca-Cola Original" },
  { code: "7622210449283", country: "EU", item: "Cadbury Dairy Milk" },
  { code: "0021000658831", country: "USA", item: "Quaker Old Fashioned Oats" },
  { code: "0016000275287", country: "USA", item: "General Mills Total Cereal" },
  { code: "4005500020134", country: "DE", item: "Bahlsen Leibniz Butter Biscuits" },
  { code: "8000500310427", country: "IT", item: "Ferrero Nutella" },
  { code: "4902102012041", country: "JP", item: "Meiji Milk Chocolate" },
  { code: "8801062573010", country: "KR", item: "Ottogi Sesame Oil" },
];

const GLOBAL_FOOD_PRESETS = [
  { id: "miso_paste", name: "White Miso Paste Japan", protein: 12.0, fat: 3.0, carbs: 25.0, cal: 159, iron: 2.5, calcium: 57, sodium: 3728, hint: "Fermented soy isoflavones support estrogen receptor modulation" },
  { id: "natto", name: "Natto Fermented Soybeans Japan", protein: 17.0, fat: 11.0, carbs: 13.0, cal: 212, iron: 8.6, calcium: 217, sodium: 0, hint: "Highest dietary source of vitamin K2 for bone matrix support" },
  { id: "wakame", name: "Dried Wakame Seaweed Japan Korea", protein: 3.0, fat: 0.6, carbs: 9.1, cal: 45, iron: 2.2, calcium: 150, sodium: 872, hint: "Fucoxanthin supports fat metabolism and iodine for thyroid health" },
  { id: "kimchi", name: "Fermented Kimchi Korea", protein: 2.0, fat: 0.5, carbs: 4.0, cal: 23, iron: 0.7, calcium: 36, sodium: 498, hint: "Lactobacillus strains optimise estrogen-gut microbiome axis" },
  { id: "tofu_silken", name: "Silken Tofu Japan China", protein: 5.0, fat: 2.7, carbs: 2.0, cal: 55, iron: 1.0, calcium: 75, sodium: 4, hint: "Gentle digestible protein ideal for sensitive luteal digestion" },
  { id: "paneer", name: "Fresh Paneer Cheese India", protein: 18.0, fat: 20.0, carbs: 2.0, cal: 260, iron: 0.4, calcium: 480, sodium: 20, hint: "Highest calcium of all fresh cheeses supporting bone density" },
  { id: "dal_lentil", name: "Cooked Yellow Dal India", protein: 7.0, fat: 0.4, carbs: 18.0, cal: 102, iron: 2.0, calcium: 27, sodium: 4, hint: "Folate-rich legume supporting methylation and red cell production" },
  { id: "ghee", name: "Clarified Butter Ghee India", protein: 0.0, fat: 99.0, carbs: 0.0, cal: 876, iron: 0.0, calcium: 2, sodium: 2, hint: "Saturated fat substrate supporting steroid hormone precursors" },
  { id: "basmati_rice", name: "Raw Basmati Rice India Pakistan", protein: 7.5, fat: 0.9, carbs: 78.0, cal: 356, iron: 1.0, calcium: 10, sodium: 5, hint: "Low glycaemic index rice ideal for insulin-sensitive perimenopausal use" },
  { id: "tahini", name: "Tahini Sesame Paste Middle East", protein: 17.0, fat: 54.0, carbs: 23.0, cal: 595, iron: 8.9, calcium: 426, sodium: 115, hint: "Highest calcium of any nut or seed butter critical bone support" },
  { id: "hummus", name: "Traditional Hummus Middle East", protein: 8.0, fat: 9.0, carbs: 14.0, cal: 166, iron: 2.4, calcium: 38, sodium: 379, hint: "Chickpea-sesame combo delivers plant iron with absorption enhancers" },
  { id: "falafel", name: "Baked Falafel Middle East", protein: 13.0, fat: 5.5, carbs: 32.0, cal: 233, iron: 4.2, calcium: 78, sodium: 294, hint: "Herb-rich chickpea patties high in folate and plant iron" },
  { id: "bulgur", name: "Raw Bulgur Wheat Middle East", protein: 12.0, fat: 1.3, carbs: 76.0, cal: 342, iron: 2.5, calcium: 35, sodium: 9, fibre: 12.5, hint: "High-fibre whole grain with the lowest GI of all wheat grains" },
  { id: "zaatar_blend", name: "Zaatar Herb Blend Levant", protein: 9.0, fat: 8.0, carbs: 40.0, cal: 261, iron: 13.0, calcium: 415, sodium: 60, hint: "Exceptional iron and calcium density sprinkle liberally" },
  { id: "medjool_dates", name: "Fresh Medjool Dates Middle East", protein: 1.8, fat: 0.1, carbs: 75.0, cal: 277, iron: 1.0, calcium: 64, sodium: 1, hint: "Menstrual phase natural oxytocin support and iron replenishment" },
  { id: "sardines", name: "Canned Sardines in Water Mediterranean", protein: 25.0, fat: 11.0, carbs: 0.0, cal: 208, iron: 2.9, calcium: 351, sodium: 505, hint: "Whole small fish with bones unmatched calcium and omega-3 density" },
  { id: "mackerel", name: "Raw Atlantic Mackerel Europe", protein: 19.0, fat: 14.0, carbs: 0.0, cal: 205, iron: 1.6, calcium: 12, sodium: 90, hint: "Highest omega-3 of all fish supporting progesterone anti-inflammation" },
  { id: "rye_bread", name: "Dark Rye Bread Scandinavia", protein: 9.0, fat: 3.5, carbs: 48.0, cal: 259, iron: 2.6, calcium: 73, sodium: 600, fibre: 6.0, hint: "Highest fibre of all breads for estrogen excretion via gut" },
  { id: "kefir", name: "Plain Milk Kefir Eastern Europe", protein: 3.4, fat: 1.0, carbs: 4.5, cal: 41, iron: 0.1, calcium: 120, sodium: 40, hint: "30 plus probiotic strains supporting estrogen-gut microbiome axis" },
  { id: "feta_cheese", name: "Greek Feta Cheese", protein: 14.0, fat: 21.0, carbs: 4.0, cal: 264, iron: 0.6, calcium: 493, sodium: 917, hint: "Highest calcium of common cheeses supporting bone density" },
  { id: "teff", name: "Raw Teff Grain Ethiopia", protein: 13.0, fat: 2.4, carbs: 73.0, cal: 367, iron: 7.6, calcium: 180, sodium: 12, hint: "Highest calcium grain globally critical for bone health" },
  { id: "moringa", name: "Moringa Leaf Powder Africa Asia", protein: 27.0, fat: 6.0, carbs: 38.0, cal: 306, iron: 28.0, calcium: 2003, sodium: 9, hint: "Gram for gram highest iron and calcium of any food on earth" },
  { id: "plantain", name: "Raw Green Plantain West Africa Caribbean", protein: 1.3, fat: 0.4, carbs: 32.0, cal: 122, iron: 0.6, calcium: 3, sodium: 4, hint: "Resistant starch prebiotic fuel supporting gut health and estrogen clearance" },
  { id: "sorghum", name: "Raw Sorghum Grain Africa", protein: 11.0, fat: 3.3, carbs: 75.0, cal: 339, iron: 4.4, calcium: 28, sodium: 6, hint: "Gluten-free ancient grain high in polyphenol antioxidants" },
  { id: "black_rice", name: "Raw Black Forbidden Rice", protein: 8.9, fat: 3.3, carbs: 73.0, cal: 356, iron: 3.5, calcium: 12, sodium: 4, hint: "Anthocyanin-rich ancient grain with highest antioxidant of all rice" },
  { id: "acai_powder", name: "Freeze-Dried Acai Powder Brazil", protein: 4.5, fat: 33.0, carbs: 36.0, cal: 533, iron: 2.3, calcium: 260, sodium: 8, hint: "Exceptional ORAC antioxidant score supporting cellular inflammation control" },
  { id: "yuca_cassava", name: "Raw Cassava Yuca Latin America", protein: 1.4, fat: 0.3, carbs: 38.0, cal: 160, iron: 0.3, calcium: 16, sodium: 14, hint: "Dense starchy root providing sustained energy without fructose load" },
  { id: "nutritional_yeast", name: "Nutritional Yeast Flakes", protein: 50.0, fat: 3.0, carbs: 25.0, cal: 325, iron: 4.9, calcium: 14, sodium: 30, hint: "Complete B-vitamin complex including B12 for energy and nerve health" },
  { id: "collagen_powder", name: "Hydrolysed Collagen Powder", protein: 90.0, fat: 0.0, carbs: 0.0, cal: 360, iron: 0.0, calcium: 20, sodium: 150, hint: "Type I and III collagen peptides for joint skin and gut lining support" },
  { id: "bone_broth", name: "Homemade Bone Broth per 250ml", protein: 10.0, fat: 1.0, carbs: 0.5, cal: 50, iron: 0.5, calcium: 48, sodium: 300, hint: "Glycine and proline support gut mucosal lining and joint matrix" },
  { id: "spirulina", name: "Spirulina Powder", protein: 57.0, fat: 8.0, carbs: 24.0, cal: 290, iron: 28.5, calcium: 120, sodium: 1048, hint: "Gram for gram the most nutrient-dense food iron rivals moringa" },
  { id: "turmeric_powder", name: "Turmeric Powder", protein: 9.7, fat: 3.3, carbs: 65.0, cal: 354, iron: 41.4, calcium: 183, sodium: 38, hint: "Curcumin inhibits NF-kB inflammatory cascade supporting all cycle phases" },
];

const CAMERA_SIMULATOR_PRESETS = [
  {
    name: "Dr. Sims Standard: Chicken & Asparagus Platter",
    desc: "150g Raw Chicken Breast, 150g Raw Asparagus Greens",
    imgUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
    mealData: {
      name: "Grilled Herb Chicken & Asparagus (Raw Grams Base)",
      estimatedRawProteinGrams: 150,
      estimatedRawVegetableGrams: 150,
      calories: 216,
      carbs: 10,
      protein: 37,
      fat: 3,
      ironMg: 2.6,
      calciumMg: 85,
      sodiumMg: 147,
      analysisBrief: "Multimodal sensor evaluated 150g raw equivalent lean chicken breast and 150g vitamin K-rich fresh asparagus."
    }
  },
  {
    name: "Bone Health Depot: Salmon & Baby Spinach Bowl",
    desc: "200g Raw King Salmon, 100g Fresh Raw Spinach Bed",
    imgUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=200",
    mealData: {
      name: "Shedded King Salmon Over Raw Spinach Bed",
      estimatedRawProteinGrams: 200,
      estimatedRawVegetableGrams: 100,
      calories: 423,
      carbs: 4,
      protein: 43,
      fat: 26,
      ironMg: 4.3,
      calciumMg: 123,
      sodiumMg: 199,
      analysisBrief: "Multimodal AI identified 200g oil-rich raw salmon fillet delivering synergistic calcium & magnesium."
    }
  },
  {
    name: "Perimeno Shield: Soft Scrambled Eggs & Avocado",
    desc: "3 Large Raw Eggs, 100g Halved Raw Avocado",
    imgUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200",
    mealData: {
      name: "Choline Egg Scramble with Avocado (Raw Grams Base)",
      estimatedRawProteinGrams: 150,
      estimatedRawVegetableGrams: 100,
      calories: 375,
      carbs: 9,
      protein: 21,
      fat: 30,
      ironMg: 3.3,
      calciumMg: 96,
      sodiumMg: 217,
      analysisBrief: "Recognized 3 large grade-A whole eggs (150g) flanked with 100g Raw Lipid-Somatic Avocado."
    }
  }
];

export default function FoodLogger({
  foods,
  onAddFood,
  onDeleteFood,
  onUpdateFood,
  cyclePhase,
  lifecycle,
  id,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  targetFibre
}: FoodLoggerProps) {
  
  // UI Tabs
  const [activeInputTab, setActiveInputTab] = useState<'ai' | 'manual' | 'scanner' | 'recipe'>('manual');
  
  // Smart Raw Manual Calculator Inputs
  const [proteinPresetId, setProteinPresetId] = useState(RAW_PROTEIN_PRESETS[0].id);
  const [rawFoodSearch, setRawFoodSearch] = useState('');
  const [rawFoodResults, setRawFoodResults] = useState<any[]>([]);
  const [rawSelectedFood, setRawSelectedFood] = useState<any>(null);
  const [rawSelectedGrams, setRawSelectedGrams] = useState<number | ''>('');
  const [rawSearchOpen, setRawSearchOpen] = useState(false);
  const [proteinGrams, setProteinGrams] = useState<number | ''>(150);
  const [vegPresetId, setVegPresetId] = useState(RAW_VEG_CARB_PRESETS[0].id);
  const [vegGrams, setVegGrams] = useState<number | ''>(100);
  const [manualModeType, setManualModeType] = useState<'raw' | 'direct'>('raw');
  const [mealSplitCount, setMealSplitCount] = useState<3 | 4 | 5>(4);

  // Direct Digits manual inputs (fallback)
  const [manualTitle, setManualTitle] = useState('');
  const [manualCalories, setManualCalories] = useState<number | ''>('');
  const [manualProtein, setManualProtein] = useState<number | ''>('');
  const [manualCarbs, setManualCarbs] = useState<number | ''>('');
  const [manualFat, setManualFat] = useState<number | ''>('');
  const [manualIron, setManualIron] = useState<number | ''>('');
  const [manualCalcium, setManualCalcium] = useState<number | ''>('');
  const [manualFibre, setManualFibre] = useState<number | ''>('');
  const [manualSodium, setManualSodium] = useState<number | ''>('');

  // AI Natural Language Parser State
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPreview, setAiPreview] = useState<any>(null);
  // Recipe parser states
  const [recipeText, setRecipeText] = useState('');
  const [recipeServings, setRecipeServings] = useState<string>('4');
  const [recipeServingNumber, setRecipeServingNumber] = useState<string>('1');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');
  const [recipePreview, setRecipePreview] = useState<any>(null);

  // General Scanner view tabs (barcode scanner is now the clean default)
  const [scanTab, setScanTab] = useState<'barcode' | 'camera'>('barcode');
  
  // Barcode State
  const [typedBarcode, setTypedBarcode] = useState('');
  const [barcodeWeightGrams, setBarcodeWeightGrams] = useState<number | ''>(100);
  const [scannedFavourites, setScannedFavourites] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('sa_scanned_favs') || '[]'); } catch(_) { return []; }
  });
  const [favSaved, setFavSaved] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<any>(null);
  const [barcodeManualEntry, setBarcodeManualEntry] = useState(false);

  // Camera State 
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showHtml5Scanner, setShowHtml5Scanner] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);

  // File Upload drag & drop highlight
  const [dragActive, setDragActive] = useState(false);

  // Food Log Editing States
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFat, setEditFat] = useState<number>(0);
  const [editIron, setEditIron] = useState<number | ''>('');
  const [editCalcium, setEditCalcium] = useState<number | ''>('');
  const [editSodium, setEditSodium] = useState<number | ''>('');
  const [editFibre, setEditFibre] = useState<number | ''>('');

  // Global database search states
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbSearchResults, setDbSearchResults] = useState<any[]>([]);
  const [dbSearchLoading, setDbSearchLoading] = useState(false);
  const [dbSearchError, setDbSearchError] = useState('');
  const [searchWeightGrams, setSearchWeightGrams] = useState<string>('');
  const [selectedSearchProduct, setSelectedSearchProduct] = useState<any | null>(null);

  const startEditingFood = (food: FoodLog) => {
    setEditingFoodId(food.id);
    setEditName(food.name);
    setEditCalories(food.calories);
    setEditProtein(food.protein);
    setEditCarbs(food.carbs);
    setEditFat(food.fat);
    setEditIron(food.ironMg !== undefined ? food.ironMg : '');
    setEditCalcium(food.calciumMg !== undefined ? food.calciumMg : '');
    setEditSodium(food.sodiumMg !== undefined ? food.sodiumMg : '');
    setEditFibre(food.fibreG !== undefined ? food.fibreG : '');
  };

  const handleDbSearch = async () => {
    if (!dbSearchQuery.trim()) return;
    setDbSearchLoading(true);
    setDbSearchError('');
    setDbSearchResults([]);
    setSelectedSearchProduct(null);

    const q = dbSearchQuery.toLowerCase().trim();

    // Step 1 — search internal USDA-accurate database first (instant, no API)
    const allInternal: any[] = [...RAW_PROTEIN_PRESETS, ...RAW_VEG_CARB_PRESETS];
    const internalMatches = allInternal.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.id && item.id.toLowerCase().replace(/_/g, ' ').includes(q)) ||
      (item.hint && item.hint.toLowerCase().includes(q))
    ).map(item => ({
      id: item.id,
      name: item.name,
      calories: item.cal || item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      ironMg: item.iron || item.ironMg || undefined,
      calciumMg: item.calcium || item.calciumMg || undefined,
      sodiumMg: item.sodium || item.sodiumMg || undefined,
      fibre: item.fibre || undefined,
      _source: 'internal'
    }));

    if (internalMatches.length > 0) {
      setDbSearchResults(internalMatches);
      setDbSearchLoading(false);
      return;
    }

    // Step 2 — search USDA FoodData Central (300k+ whole foods, ingredients, accurate data)
    try {
      const usdaRes = await fetch(`/api/food/usda-search?q=${encodeURIComponent(dbSearchQuery)}`);
      if (usdaRes.ok) {
        const usdaData = await usdaRes.json();
        if (usdaData.length > 0) {
          setDbSearchResults(usdaData);
          setDbSearchLoading(false);
          return;
        }
      }
    } catch (_) {
      // USDA unavailable — fall through to OFF
    }

    // Step 3 — fall through to Open Food Facts for packaged/branded products
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(dbSearchQuery)}`);
      if (!res.ok) {
        throw new Error(
          res.status === 503 || res.status === 502 || res.status === 504
            ? "Food databases are temporarily unavailable — please try again in a moment."
            : `Search returned an error (${res.status}) — please try again.`
        );
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server.");
      }
      const data = await res.json();
      setDbSearchResults(data.map((item: any) => ({ ...item, _source: 'off' })));
      if (data.length === 0) {
        setDbSearchError("No results found. Try a simpler search term — e.g. 'chicken' instead of 'raw chicken breast fillet'.");
      }
    } catch (err: any) {
      setDbSearchError(err.message || "Search failed — check your connection and try again.");
    } finally {
      setDbSearchLoading(false);
    }
  };

  const handleCommercialPresetSelect = (presetId: string) => {
    if (!presetId) return;
    const selected = POPULAR_COMMERCIAL_PRESETS.find(p => p.id === presetId);
    if (selected) {
      setDbSearchResults([selected]);
      setSelectedSearchProduct(selected);
      setSearchWeightGrams('');
      setDbSearchQuery(selected.name);
    }
  };

  const commitSelectedSearchProduct = () => {
    if (!selectedSearchProduct) return;
    const finalGrams = Number(searchWeightGrams) || 0;
    const multiplier = finalGrams / 100;
    const finalFood: FoodLog = {
      id: 'f_search_' + Date.now(),
      name: `${selectedSearchProduct.name} (${finalGrams}g)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Math.round(selectedSearchProduct.calories * multiplier),
      protein: Math.round(selectedSearchProduct.protein * multiplier),
      carbs: Math.round(selectedSearchProduct.carbs * multiplier),
      fat: Math.round(selectedSearchProduct.fat * multiplier),
      ironMg: selectedSearchProduct.ironMg ? Number((selectedSearchProduct.ironMg * multiplier).toFixed(1)) : undefined,
      calciumMg: selectedSearchProduct.calciumMg ? Math.round(selectedSearchProduct.calciumMg * multiplier) : undefined,
      sodiumMg: selectedSearchProduct.sodiumMg ? Math.round(selectedSearchProduct.sodiumMg * multiplier) : undefined,
      fibreG: selectedSearchProduct.fibre ? Number((selectedSearchProduct.fibre * multiplier).toFixed(1)) : undefined,
    };
    onAddFood(finalFood);
    setSelectedSearchProduct(null);
    setDbSearchResults([]);
    setDbSearchQuery('');
  };


  const saveScannedFavourite = (food: any) => {
    const favs = JSON.parse(localStorage.getItem('sa_scanned_favs') || '[]');
    if (favs.find((f: any) => f.name === food.name)) {
      setFavSaved(true);
      setTimeout(() => setFavSaved(false), 1500);
      return;
    }
    const updated = [...favs, { name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, ironMg: food.ironMg, calciumMg: food.calciumMg, sodiumMg: food.sodiumMg, fibreG: food.fibre ?? food.fibreG }];
    localStorage.setItem('sa_scanned_favs', JSON.stringify(updated));
    setScannedFavourites(updated);
    setFavSaved(true);
    setTimeout(() => setFavSaved(false), 1500);
  };

  const removeScannedFavourite = (name: string) => {
    const updated = scannedFavourites.filter((f: any) => f.name !== name);
    localStorage.setItem('sa_scanned_favs', JSON.stringify(updated));
    setScannedFavourites(updated);
  };

  const quickAddFavourite = (fav: any, grams: number = 100) => {
    const mul = grams / 100;
    const food: FoodLog = {
      id: 'f_fav_' + Date.now(),
      name: `${fav.name} (${grams}g)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Math.round(fav.calories * mul),
      protein: Math.round(fav.protein * mul),
      carbs: Math.round(fav.carbs * mul),
      fat: Math.round(fav.fat * mul),
      ironMg: fav.ironMg ? Number((fav.ironMg * mul).toFixed(1)) : undefined,
      calciumMg: fav.calciumMg ? Math.round(fav.calciumMg * mul) : undefined,
      sodiumMg: fav.sodiumMg ? Math.round(fav.sodiumMg * mul) : undefined,
      fibreG: fav.fibreG ? Number((fav.fibreG * mul).toFixed(1)) : undefined,
    };
    onAddFood(food);
  };


  const handleRawFoodSearch = (query: string) => {
    setRawFoodSearch(query);
    setRawSelectedFood(null);
    if (query.length < 2) { setRawFoodResults([]); setRawSearchOpen(false); return; }
    const q = query.toLowerCase();
    // Search across all databases - phase priority first
    const allFoods = [
      ...sortedProteins.map((f: any) => ({ ...f, category: 'Protein' })),
      ...sortedVegs.map((f: any) => ({ ...f, category: 'Greens & Carbs' })),
      ...GLOBAL_FOOD_PRESETS.map((f: any) => ({ ...f, category: 'Global Foods' })),
    ];
    const seen = new Set<string>();
    const results = allFoods.filter((f: any) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return f.name.toLowerCase().includes(q);
    }).slice(0, 8);
    setRawFoodResults(results);
    setRawSearchOpen(results.length > 0);
  };

  const selectRawFood = (food: any) => {
    setRawSelectedFood(food);
    setRawFoodSearch(food.name);
    setRawSearchOpen(false);
    setRawSelectedGrams('');
  };

  const logRawSearchFood = () => {
    if (!rawSelectedFood || !rawSelectedGrams) return;
    const g = Number(rawSelectedGrams);
    const mul = g / 100;
    const food: FoodLog = {
      id: 'f_raw_' + Date.now(),
      name: rawSelectedFood.name + ' (' + g + 'g)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Math.round((rawSelectedFood.cal || rawSelectedFood.calories || 0) * mul),
      protein: Math.round((rawSelectedFood.protein || 0) * mul),
      carbs: Math.round((rawSelectedFood.carbs || 0) * mul),
      fat: Math.round((rawSelectedFood.fat || 0) * mul),
      ironMg: rawSelectedFood.iron ? Number(((rawSelectedFood.iron || rawSelectedFood.ironMg || 0) * mul).toFixed(1)) : undefined,
      calciumMg: rawSelectedFood.calcium ? Math.round((rawSelectedFood.calcium || rawSelectedFood.calciumMg || 0) * mul) : undefined,
      sodiumMg: rawSelectedFood.sodium ? Math.round((rawSelectedFood.sodium || rawSelectedFood.sodiumMg || 0) * mul) : undefined,
      fibreG: rawSelectedFood.fibre ? Number((rawSelectedFood.fibre * mul).toFixed(1)) : undefined,
    };
    onAddFood(food);
    setRawFoodSearch('');
    setRawSelectedFood(null);
    setRawSelectedGrams('');
    setRawFoodResults([]);
    setRawSearchOpen(false);
  };

  // Phase-sorted food lists — prioritise foods matching current cycle phase
  const sortByPhase = (list: any[], phase: string) => {
    const priority = list.filter(f => f.phases && f.phases.includes(phase));
    const rest = list.filter(f => !f.phases || !f.phases.includes(phase));
    return [...priority, ...rest];
  };
  const sortedProteins = sortByPhase(RAW_PROTEIN_PRESETS, cyclePhase);
  const sortedVegs = sortByPhase(RAW_VEG_CARB_PRESETS, cyclePhase);

  // Derive Live calculations for Raw Weights manually
  const selectedProteinPreset = sortedProteins.find(p => p.id === proteinPresetId) || sortedProteins[0];
  const selectedVegPreset = sortedVegs.find(v => v.id === vegPresetId) || sortedVegs[0];

  const pG = Number(proteinGrams || 0);
  const vG = Number(vegGrams || 0);

  const calculatedProtein = Math.round((pG * selectedProteinPreset.protein / 100) + (vG * selectedVegPreset.protein / 100));
  const calculatedCarbs = Math.round((pG * selectedProteinPreset.carbs / 100) + (vG * selectedVegPreset.carbs / 100));
  const calculatedFat = Math.round((pG * selectedProteinPreset.fat / 100) + (vG * selectedVegPreset.fat / 100));
  const calculatedCalories = Math.round((pG * selectedProteinPreset.cal / 100) + (vG * selectedVegPreset.cal / 100));
  const calculatedFibre = Number((
    (pG * (selectedProteinPreset.fibre || 0) / 100) +
    (vG * (selectedVegPreset.fibre || 0) / 100)
  ).toFixed(1));
  
  const calculatedIron = Number(((pG * (selectedProteinPreset.iron || 0) / 100) + (vG * (selectedVegPreset.iron || 0) / 100)).toFixed(1));
  const calculatedCalcium = Math.round((pG * (selectedProteinPreset.calcium || 0) / 100) + (vG * (selectedVegPreset.calcium || 0) / 100));
  const calculatedSodium = Math.round((pG * (selectedProteinPreset.sodium || 0) / 100) + (vG * (selectedVegPreset.sodium || 0) / 100));

  // Handle logging calculated raw grams meal
  const handleLogRawMeal = () => {
    const mealLabel = `${selectedProteinPreset.name} (${pG}g) with ${selectedVegPreset.name} (${vG}g) [Raw Base]`;
    const newFood: FoodLog = {
      id: 'f_raw_' + Date.now(),
      name: mealLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      ironMg: calculatedIron > 0 ? calculatedIron : undefined,
      calciumMg: calculatedCalcium > 0 ? calculatedCalcium : undefined,
      sodiumMg: calculatedSodium > 0 ? calculatedSodium : undefined,
      fibreG: calculatedFibre > 0 ? calculatedFibre : undefined,
    };
    onAddFood(newFood);
    
    // reset weights to zero after logging
    setProteinGrams('');
    setVegGrams('');
  };

  // Handle logging a raw macro direct form submit
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualCalories) return;

    const newFood: FoodLog = {
      id: 'f_dir_' + Date.now(),
      name: manualTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Number(manualCalories),
      protein: Number(manualProtein || 0),
      carbs: Number(manualCarbs || 0),
      fat: Number(manualFat || 0),
      ironMg: manualIron !== '' ? Number(manualIron) : undefined,
      calciumMg: manualCalcium !== '' ? Number(manualCalcium) : undefined,
      sodiumMg: manualSodium !== '' ? Number(manualSodium) : undefined,
      fibreG: manualFibre !== '' ? Number(manualFibre) : undefined,
    };

    onAddFood(newFood);
    setManualTitle('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualIron('');
    setManualCalcium('');
    setManualFibre('');
    setManualSodium('');
  };

  // Recipe parser
  const handleParseRecipe = async () => {
    if (!recipeText.trim()) return;
    setRecipeLoading(true);
    setRecipeError('');
    setRecipePreview(null);

    try {
      const response = await fetch('/api/gemini/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeText: recipeText.trim(),
          servings: Number(recipeServings) || 4,
          servingNumber: Number(recipeServingNumber) || 1
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Recipe parser unavailable.');
      }

      const data = await response.json();
      setRecipePreview(data);
    } catch (err: any) {
      setRecipeError(err.message || 'Recipe parser unavailable — please try again.');
    } finally {
      setRecipeLoading(false);
    }
  };

  // AI NLP meal ingestion
  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError('');

    try {
      const response = await fetch('/api/gemini/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealText: aiText, cyclePhase, lifecycle })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server parsing error.');
      }

      const data = await response.json();
      const newFood: FoodLog = {
        id: 'f_ai_' + Date.now(),
        name: data.name || aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: Number(data.calories || 0),
        carbs: Number(data.carbs || 0),
        protein: Number(data.protein || 0),
        fat: Number(data.fat || 0),
        ironMg: data.ironMg ? Number(data.ironMg) : undefined,
        calciumMg: data.calciumMg ? Number(data.calciumMg) : undefined,
        sodiumMg: data.sodiumMg ? Number(data.sodiumMg) : undefined,
        fibreG: data.fibreG ? Number(data.fibreG) : undefined
      };

      setAiPreview(newFood); // show preview for confirmation instead of auto-logging
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('API call failed') || msg.includes('503') || msg.includes('key')) {
        setAiError('AI parser is temporarily unavailable — try again in a moment. Alternatively, use the Barcode Scanner below to log this food manually.');
      } else {
        setAiError(msg || 'Connection to AI parser lost. Please retry.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // WebRTC Live Camera activation
  const startLiveCamera = async () => {
    setVisionError('');
    setVisionResult(null);
    setCapturedImage(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVisionError('Camera not supported on this browser. Use manual barcode entry below.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access error:", err);
      const errName = err?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setVisionError('Camera permission denied. Please allow camera access in your browser settings and refresh.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setVisionError('No camera found. Use the manual barcode entry below.');
      } else {
        setVisionError('Camera unavailable on this device. Use manual barcode entry below.');
      }
      setCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setShowHtml5Scanner(false);
  };

  // Stop camera when leaving scanner tab
  useEffect(() => {
    if (activeInputTab !== 'scanner') {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [activeInputTab]);

  // Web native audio sound synthesizer to emit a brief scan "beep"
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // elegant 880Hz scan tone
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Could not play scan audio beep feedback:", e);
    }
  };

  // Automatic Native Barcode Scanning loop inside WebRTC stream
  useEffect(() => {
    let intervalId: any;
    let isActive = true;

    const runDetector = async () => {
      // @ts-ignore
      if (cameraActive && scanTab === 'barcode' && barcodeVideoRef.current && typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          // @ts-ignore
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });
          
          intervalId = setInterval(async () => {
            if (barcodeVideoRef.current && isActive) {
              try {
                // @ts-ignore
                const detected = await detector.detect(barcodeVideoRef.current);
                if (detected && detected.length > 0) {
                  const val = detected[0].rawValue;
                  if (val && isActive) {
                    isActive = false;
                    playScanBeep();
                    setTypedBarcode(val);
                    performBarcodeQuery(val);
                    stopLiveCamera();
                  }
                }
              } catch (_) {}
            }
          }, 350);
        } catch (err) {
          console.warn("Failed to construct native BarcodeDetector loop:", err);
        }
      }
    };

    runDetector();

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, scanTab]);

  // Multi-modal analyzer trigger
  const handleScanImage = async (base64String: string) => {
    setVisionLoading(true);
    setVisionError('');
    try {
      const response = await fetch('/api/gemini/scan-food-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64String, cyclePhase, lifecycle })
      });

      if (!response.ok) {
        throw new Error("Unable to analyze food. Ensure image contains a food or nutritional text.");
      }

      const parsedData = await response.json();
      setVisionResult(parsedData);
    } catch (err: any) {
      console.error("Camera OCR scan err:", err);
      setVisionError(err.message || "Failed to scan picture. Please try another snapshot.");
    } finally {
      setVisionLoading(false);
    }
  };

  const captureLiveSnapshot = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopLiveCamera();
        handleScanImage(dataUrl);
      }
    }
  };

  // Interactive local sandbox presets matching real Gemini models directly
  const triggerMockPlateScan = (mockPlate: typeof CAMERA_SIMULATOR_PRESETS[0]) => {
    setCapturedImage(mockPlate.imgUrl);
    setVisionLoading(true);
    setVisionError('');
    setVisionResult(null);
    stopLiveCamera();
    
    // Simulate smart backend processing with gorgeous precision matching the mock data
    setTimeout(() => {
      setVisionResult(mockPlate.mealData);
      setVisionLoading(false);
    }, 1200);
  };

  // Convert files loaded locally (drag & drop or clicked)
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVisionError("Please upload a food/nutrient photo or image file.");
      return;
    }
    
    setVisionLoading(true);
    setVisionError('');
    setVisionResult(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target?.result as string;
      setCapturedImage(b64);
      await handleScanImage(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Barcode endpoint integration
  const performBarcodeQuery = async (barcodeVal: string) => {
    if (!barcodeVal.trim()) return;
    setBarcodeLoading(true);
    setBarcodeError('');
    setBarcodeResult(null);
    setBarcodeManualEntry(false);

    try {
      const response = await fetch('/api/gemini/barcode-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcodeVal })
      });

      if (!response.ok) {
        throw new Error("Product unrecognized. Open Food Facts registry could not recognize this local trade code.");
      }

      const res = await response.json();
      setBarcodeResult(res);
      // Determine ONCE whether this product has no nutrition data on file —
      // this flag stays fixed even as the user types values in, so the manual
      // entry fields don't disappear the moment a field stops being zero.
      const noDataOnFile = (res.calories === 0 && res.protein === 0 && res.carbs === 0 && res.fat === 0);
      setBarcodeManualEntry(noDataOnFile);
      // set weight default to 0 as requested to allow smooth manual typing immediately
      setBarcodeWeightGrams(0);
    } catch (err: any) {
      console.error(err);
      setBarcodeError(err.message || 'Connection offline or barcode unrecognized.');
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Logs the active scanned item adjusting parameters with chosen grams
  const commitScannedFoodLog = (source: 'barcode' | 'vision') => {
    if (source === 'barcode' && barcodeResult) {
      const finalGrams = Number(barcodeWeightGrams || 0);
      const multiplier = finalGrams / 100;
      const finalFood: FoodLog = {
        id: 'f_bar_' + Date.now(),
        name: `${barcodeResult.name} (${finalGrams}g)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: Math.round(barcodeResult.calories * multiplier),
        protein: Math.round(barcodeResult.protein * multiplier),
        carbs: Math.round(barcodeResult.carbs * multiplier),
        fat: Math.round(barcodeResult.fat * multiplier),
        ironMg: barcodeResult.ironMg ? Number((barcodeResult.ironMg * multiplier).toFixed(1)) : undefined,
        calciumMg: barcodeResult.calciumMg ? Math.round(barcodeResult.calciumMg * multiplier) : undefined,
        sodiumMg: barcodeResult.sodiumMg ? Math.round(barcodeResult.sodiumMg * multiplier) : undefined,
        fibreG: barcodeResult.fibre ? Number((barcodeResult.fibre * multiplier).toFixed(1)) : undefined,
      };
      onAddFood(finalFood);
      
      // Cleanup
      setBarcodeResult(null);
      setBarcodeManualEntry(false);
      setTypedBarcode('');
    } else if (source === 'vision' && visionResult) {
      const finalFood: FoodLog = {
        id: 'f_cam_' + Date.now(),
        name: visionResult.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: visionResult.calories,
        protein: visionResult.protein,
        carbs: visionResult.carbs,
        fat: visionResult.fat,
        ironMg: visionResult.ironMg || undefined,
        calciumMg: visionResult.calciumMg || undefined,
        sodiumMg: visionResult.sodiumMg || undefined,
        fibreG: visionResult.fibreG || undefined
      };
      onAddFood(finalFood);
      
      // Cleanup
      setVisionResult(null);
      setCapturedImage(null);
    }
  };

  return (
    <div id={id} className="bg-coconut rounded-[40px] p-8 border border-daydream shadow-sm flex flex-col gap-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <span className="text-sm uppercase tracking-[0.25em] text-kale/60 block font-mono font-bold">NUTRITION REGISTRY</span>
          <h2 className="text-xl font-serif italic text-kale mt-1 tracking-tight flex items-center gap-2">
            Fuel & Performance Ingestion
          </h2>
          <p className="text-sm text-kale/70 mt-1 max-w-xl leading-relaxed">
            Science first. Simple, accurate raw weight tracking designed strictly to preserve thyroid sensitivity, avoid low energy availability (LEA), and hit anabolic muscle triggers.
          </p>
        </div>
      </div>

      {/* Primary Input Mode Navigation */}
      <div className="flex gap-4 border-b border-daydream pb-0.5 overflow-x-auto scrollbar-hide" id="fuel-registry-tabs" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        <button
          onClick={() => setActiveInputTab('manual')}
          className={`pb-2.5 text-sm font-mono uppercase tracking-[0.15em] outline-none transition-all duration-150 flex items-center gap-1.5 ${
            activeInputTab === 'manual'
              ? 'border-b-2 border-kale text-kale font-extrabold'
              : 'text-kale/50 hover:text-kale'
          }`}
        >
          <Scale className="h-3 w-3" />
          Meal Split
        </button>
        <button
          onClick={() => setActiveInputTab('scanner')}
          className={`pb-2.5 text-sm font-mono uppercase tracking-[0.15em] outline-none transition-all duration-150 flex items-center gap-1.5 ${
            activeInputTab === 'scanner'
              ? 'border-b-2 border-kale text-kale font-extrabold'
              : 'text-kale/50 hover:text-kale'
          }`}
        >
          <Camera className="h-3 w-3" />
          Scanner
        </button>
        <button
          onClick={() => setActiveInputTab('ai')}
          className={`pb-2.5 text-sm font-mono uppercase tracking-[0.15em] outline-none transition-all duration-150 flex items-center gap-1.5 ${
            activeInputTab === 'ai'
              ? 'border-b-2 border-kale text-kale font-extrabold'
              : 'text-kale/50 hover:text-kale'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          AI Parser
        </button>
        <button
          onClick={() => setActiveInputTab('recipe')}
          className={`pb-2.5 text-sm font-mono uppercase tracking-[0.15em] outline-none transition-all duration-150 flex items-center gap-1.5 ${
            activeInputTab === 'recipe'
              ? 'border-b-2 border-kale text-kale font-extrabold'
              : 'text-kale/50 hover:text-kale'
          }`}
        >
          <ChefHat className="h-3 w-3" />
          Recipe
        </button>
      </div>

      {/* Main Ingest Forms view */}
      <div className="min-h-[220px]">
        
        {/* TAB 1: CLINICAL RAW GRAMS MANUAL CALCULATOR */}
        {activeInputTab === 'manual' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-daydream/40 pb-3">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setManualModeType('raw')}
                  className={`text-sm font-mono uppercase px-3 py-1.5 rounded-lg transition ${
                    manualModeType === 'raw' 
                      ? 'bg-kale text-coconut font-bold' 
                      : 'bg-coconut/80 text-kale/60 border border-daydream hover:text-kale'
                  }`}
                >
                  Meal Split
                </button>
                <button
                  type="button"
                  onClick={() => setManualModeType('direct')}
                  className={`text-sm font-mono uppercase px-3 py-1.5 rounded-lg transition ${
                    manualModeType === 'direct' 
                      ? 'bg-kale text-coconut font-bold' 
                      : 'bg-coconut/80 text-kale/60 border border-daydream hover:text-kale'
                  }`}
                >
                  Direct Macro Digits
                </button>
              </div>
              <span className="text-sm text-cinnamon font-mono bg-cinnamon/5 px-2.5 py-1 rounded-md font-semibold">
                ★ Calibrated against today's targets
              </span>
            </div>

            {/* GLOBAL DATABASE SEARCH COMPONENT */}
            <div className="bg-[#FAF7F2]/60 border border-daydream p-5 rounded-[24px] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-daydream/40 pb-2.5">
                <div>
                  <h4 className="text-sm font-serif italic text-kale font-bold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-sage" /> Search Food Database
                  </h4>
                  <p className="text-sm text-kale/60 font-sans mt-0.5">
                    Internal database first → USDA FoodData Central (300k+ foods) → Open Food Facts for packaged products.
                  </p>
                </div>
                <span className="text-sm font-mono font-bold text-cinnamon bg-cinnamon/10 px-2 py-0.5 rounded-md uppercase shrink-0">
                  3-Source Search
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-3 text-kale/40">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDbSearch()}
                    placeholder="Search whole foods or packaged products (e.g. chicken, salmon, Weetbix, almond butter...)"
                    className="w-full text-sm pl-10 pr-4 py-2.5 border border-daydream rounded-xl focus:border-sage focus:outline-none bg-coconut text-kale font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDbSearch}
                  disabled={dbSearchLoading || !dbSearchQuery.trim()}
                  className="px-5 bg-kale text-coconut rounded-xl text-sm font-mono font-bold uppercase tracking-wider hover:bg-sage hover:text-kale transition disabled:opacity-40 flex items-center gap-1.5 h-[40px]"
                >
                  {dbSearchLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  Find
                </button>
              </div>



              {dbSearchError && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-medium">
                  {dbSearchError}
                </p>
              )}

              {/* SEARCH RESULTS DROPDOWN LIST */}
              {dbSearchResults.length > 0 && (
                <div className="border border-daydream bg-coconut rounded-xl overflow-hidden max-h-[250px] overflow-y-auto divide-y divide-daydream/40 animate-fade-in shadow-sm">
                  {dbSearchResults.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setSelectedSearchProduct(prod);
                        setSearchWeightGrams('');
                      }}
                      className={`w-full text-left p-3 hover:bg-[#FAF7F2]/50 transition flex justify-between items-center ${
                        selectedSearchProduct?.id === prod.id ? 'bg-sage/10 hover:bg-sage/15 border-l-4 border-sage' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-serif font-bold text-kale truncate">{prod.name}</div>
                          {prod._source === 'internal' && (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-sage/20 text-sage px-1.5 py-0.5 rounded shrink-0">USDA ✓</span>
                          )}
                          {prod._source === 'usda' && (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-cinnamon/10 text-cinnamon px-1.5 py-0.5 rounded shrink-0">USDA</span>
                          )}
                          {prod._source === 'off' && (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-daydream text-kale/50 px-1.5 py-0.5 rounded shrink-0">Packaged</span>
                          )}
                          {prod.category && (
                            <span className="text-[9px] font-mono text-kale/30 truncate">{prod.category}</span>
                          )}
                        </div>
                        <div className="flex gap-2 text-sm font-mono text-kale/50 mt-1 uppercase">
                          <span>{prod.calories} kcal</span>
                          <span>|</span>
                          <span>P: {prod.protein}g</span>
                          <span>|</span>
                          <span>C: {prod.carbs}g</span>
                          <span>|</span>
                          <span>F: {prod.fat}g</span>
                          {prod.fibre > 0 && <><span>|</span><span>Fi: {prod.fibre}g</span></>}
                        </div>
                      </div>
                      <span className="text-sm font-mono text-kale/40 shrink-0">Select</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ACTIVE SELECTION WEIGHT SPECIFICATION */}
              {selectedSearchProduct && (
                <div className="p-4 bg-sage/5 rounded-2xl border border-sage/20 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-sage uppercase tracking-wider block">Selected Search Product</span>
                      <h5 className="text-sm font-serif font-bold italic text-kale">{selectedSearchProduct.name}</h5>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedSearchProduct(null)}
                      className="text-kale/40 hover:text-kale p-1 rounded-lg"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-kale/60 uppercase tracking-widest">
                      How many grams did you eat?
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={searchWeightGrams}
                        onChange={(e) => setSearchWeightGrams(e.target.value)}
                        onFocus={() => setSearchWeightGrams('')}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="text-xl font-mono font-bold border-2 border-sage/40 focus:border-sage bg-white rounded-xl p-3 w-32 text-kale focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                        placeholder="100"
                      />
                      <span className="text-sm font-mono text-kale/60">grams</span>
                      <button
                        type="button"
                        onClick={commitSelectedSearchProduct}
                        disabled={!searchWeightGrams || Number(searchWeightGrams) <= 0}
                        className="flex-1 px-4 py-3 bg-kale hover:bg-sage hover:text-kale text-coconut rounded-xl text-sm font-mono font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Log {searchWeightGrams || '0'}g
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-sm font-mono pt-1.5 border-t border-daydream/40">
                    <div>
                      <span className="block text-kale/50 text-[11px] uppercase">energy</span>
                      <strong className="text-kale">{Math.round(selectedSearchProduct.calories * (Number(searchWeightGrams) / 100))} kcal</strong>
                    </div>
                    <div>
                      <span className="block text-cinnamon/60 text-[11px] uppercase">protein</span>
                      <strong className="text-cinnamon">{Math.round(selectedSearchProduct.protein * (Number(searchWeightGrams) / 100))}g</strong>
                    </div>
                    <div>
                      <span className="block text-sage text-[11px] uppercase">carbs</span>
                      <strong className="text-sage">{Math.round(selectedSearchProduct.carbs * (Number(searchWeightGrams) / 100))}g</strong>
                    </div>
                    <div>
                      <span className="block text-[#9A3B26]/60 text-[11px] uppercase">lipids</span>
                      <strong className="text-[#9A3B26]">{Math.round(selectedSearchProduct.fat * (Number(searchWeightGrams) / 100))}g</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {manualModeType === 'raw' ? (
              <MealSplitBlock
                foods={foods}
                targetCalories={targetCalories || 2000}
                targetProtein={targetProtein || 100}
                targetCarbs={targetCarbs || 200}
                targetFat={targetFat || 65}
                targetFibre={targetFibre || 30}
                mealSplitCount={mealSplitCount}
                setMealSplitCount={setMealSplitCount}
                lifecycle={lifecycle}
              />
            ) : (
              /* Direct Digits Mode Form */
              <form onSubmit={handleDirectSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Meal / Item Name *</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Cooked steak breast fillet"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Calories (kcal) *</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="350"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Protein (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="25"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="35"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Fat (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="10"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Iron (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualIron}
                    onChange={(e) => setManualIron(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="2.5"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Calcium (mg)</label>
                  <input
                    type="number"
                    value={manualCalcium}
                    onChange={(e) => setManualCalcium(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="150"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Sodium (mg)</label>
                  <input
                    type="number"
                    value={manualSodium}
                    onChange={(e) => setManualSodium(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="200"
                    className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.55">
                  <label className="text-sm font-bold text-sage uppercase tracking-widest font-mono">Fibre (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={manualFibre}
                    onChange={(e) => setManualFibre(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="text-sm border border-sage/40 rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!manualTitle || !manualCalories}
                    className="w-full text-sm font-mono font-bold leading-none uppercase tracking-widest bg-kale text-coconut h-[40px] rounded-xl hover:bg-sage hover:text-kale transition disabled:opacity-40"
                  >
                    Log Direct Macros
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: SMART BARCODE & CAMERA SCANNER */}
        {activeInputTab === 'scanner' && (
          <div className="space-y-6 animate-fade-in">

              {/* Scanned Favourites */}
              {scannedFavourites.length > 0 && (
                <div className="bg-coconut border border-daydream rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-kale/60 uppercase tracking-widest">★ Scanned Favourites</span>
                    <span className="text-[11px] text-kale/40 font-mono">tap to add 100g • × to remove</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scannedFavourites.map((fav: any, i: number) => (
                      <div key={i} className="flex items-center gap-1 bg-cinnamon/10 border border-cinnamon/20 rounded-xl px-3 py-1.5">
                        <span
                          className="text-sm font-mono font-bold text-kale cursor-pointer hover:text-cinnamon transition truncate max-w-[140px]"
                          onClick={() => quickAddFavourite(fav, 100)}
                          title={`Add 100g of ${fav.name}`}
                        >
                          {fav.name}
                        </span>
                        <span
                          className="text-sm text-kale/40 cursor-pointer hover:text-cinnamon ml-1"
                          onClick={() => removeScannedFavourite(fav.name)}
                        >×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Scanner Subnavigation */}
            <div className="flex gap-4 border-b border-daydream/40 pb-3 justify-center md:justify-start">
              <button
                type="button"
                onClick={() => { setScanTab('camera'); stopLiveCamera(); }}
                className={`text-sm font-mono uppercase px-3 py-1.5 rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 ${
                  scanTab === 'camera' 
                    ? 'bg-kale text-coconut font-bold' 
                    : 'bg-[#FAF7F2]/60 text-kale/60 border border-daydream hover:text-kale'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                Multimodal Camera Ingest
              </button>
              <button
                type="button"
                onClick={() => { setScanTab('barcode'); stopLiveCamera(); }}
                className={`text-sm font-mono uppercase px-3 py-1.5 rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 ${
                  scanTab === 'barcode' 
                    ? 'bg-kale text-coconut font-bold' 
                    : 'bg-[#FAF7F2]/60 text-kale/60 border border-daydream hover:text-kale'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                International Trade Barcode
              </button>
            </div>

            {/* Sub Mode A: Multimodal Photo OCR & Plate Scan */}
            {scanTab === 'camera' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Camera Ingest Frame */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {cameraActive ? (
                    <div className="relative min-h-[250px] aspect-video bg-black rounded-3xl overflow-hidden border border-kale shadow-inner flex flex-col justify-end">
                      {/* WebRTC Video Viewport */}
                      {!showHtml5Scanner && (
                        <video 
                          ref={(el) => {
                            if (el) {
                              // @ts-ignore
                              videoRef.current = el;
                              if (cameraStream && el.srcObject !== cameraStream) {
                                el.srcObject = cameraStream;
                                el.play().catch(e => console.warn("Play capture stream err:", e));
                              }
                            }
                          }}
                          className="absolute inset-0 w-full h-full object-cover" 
                          autoPlay
                          playsInline
                          muted
                        />
                      )}

                      {/* Mock Simulated scanning HUD (works everywhere & looks high-tech) */}
                      {showHtml5Scanner && (
                        <div className="absolute inset-0 bg-stone-900/40 flex flex-col items-center justify-center text-coconut p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-sage mb-2" />
                          <span className="font-mono text-sm uppercase tracking-widest text-[#FAF7F2]">Clinical viewfinder live</span>
                        </div>
                      )}

                      {/* Overlay scan target bounds */}
                      <div className="absolute inset-0 border-[2px] border-dashed border-sage/60 m-12 rounded-2xl pointer-events-none flex items-center justify-center">
                        <span className="bg-kale/80 px-2.5 py-1 text-sm font-mono uppercase tracking-[0.15em] text-coconut rounded">Position plate or brand label inside matrix</span>
                      </div>

                      {/* Camera Controls */}
                      <div className="relative z-10 p-4 bg-gradient-to-t from-stone-900/90 to-transparent flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={stopLiveCamera}
                          className="bg-coconut/10 hover:bg-coconut/20 text-coconut px-3.5 py-1.5 rounded-xl text-sm font-mono uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        
                        <button
                          type="button"
                          onClick={showHtml5Scanner ? () => {
                            // Grab current mock plate to process
                            triggerMockPlateScan(CAMERA_SIMULATOR_PRESETS[0]);
                          } : captureLiveSnapshot}
                          className="w-14 h-14 rounded-full border-4 border-coconut bg-cinnamon flex items-center justify-center text-coconut hover:scale-105 active:scale-95 transition cursor-pointer select-none"
                        >
                          <span className="w-10 h-10 rounded-full bg-coconut block" />
                        </button>

                        <div className="w-[50px]" />
                      </div>
                    </div>
                  ) : (
                    /* Inactive Camera State with Drag-n-Drop File Loader */
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`min-h-[200px] border-2 border-dashed rounded-[30px] p-6 text-center flex flex-col items-center justify-center bg-[#FAF7F2]/40 transition-colors ${
                        dragActive ? 'border-sage bg-sage/5' : 'border-daydream hover:border-sage'
                      }`}
                    >
                      <Camera className="h-8 w-8 text-kale/40 mb-3 stroke-[1.5]" />
                      <h4 className="font-serif italic font-bold text-sm text-kale">Camera & File Sync Entry</h4>
                      <p className="text-sm text-stone-500 max-w-sm leading-relaxed mt-1 mb-4 select-none">
                        Activate your physical camera device, drag a plate photo here, or select standard files. Perfect for capturing foreign items or meals.
                      </p>

                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          type="button"
                          onClick={startLiveCamera}
                          className="bg-kale hover:bg-sage hover:text-kale text-coconut px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-widest font-bold transition flex items-center gap-1.5"
                        >
                          <Camera className="h-3 w-3" />
                          Start Live Scanner
                        </button>

                        <label className="bg-coconut hover:bg-daydream text-kale border border-daydream px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-widest font-bold transition flex items-center gap-1.5 cursor-pointer">
                          <Upload className="h-3 w-3" />
                          Upload Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                processUploadedFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Sandboxed Interactive Simulator Selectors (ensures easy testing inside iframe limits) */}
                  <div className="bg-[#FAF7F2]/40 border border-daydream rounded-2xl p-4">
                    <span className="text-sm font-mono font-bold text-kale/60 uppercase block mb-2.5">
                      ★ Active Testing Presets (In-country & Travel simulator)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {CAMERA_SIMULATOR_PRESETS.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => triggerMockPlateScan(m)}
                          className="bg-coconut hover:bg-daydream/20 text-left border border-daydream/80 p-2.5 rounded-xl transition hover:border-sage relative flex gap-2"
                        >
                          <img 
                            src={m.imgUrl} 
                            alt={m.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-daydream" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-serif italic font-bold text-sm text-kale block truncate">{m.name}</span>
                            <span className="text-[8.5px] font-mono text-kale/60 block truncate">{m.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Multimodal Outputs Display */}
                <div className="lg:col-span-5">
                  <div className="bg-coconut border border-daydream p-5 rounded-3xl min-h-[280px] flex flex-col justify-between gap-5 relative">
                    
                    {visionLoading && (
                      <div className="absolute inset-0 bg-coconut/80 rounded-3xl flex flex-col items-center justify-center z-10">
                        <Loader2 className="h-7 w-7 text-cinnamon animate-spin mb-2" />
                        <span className="font-mono text-sm uppercase tracking-widest text-[#9a3b26]">Querying Multimodal Gemini...</span>
                        <p className="text-sm text-stone-500 max-w-[200px] text-center mt-1">Estimating raw component weight curves</p>
                      </div>
                    )}

                    {!capturedImage && !visionResult && (
                      <div className="text-center py-12 text-kale/40 border border-dashed border-daydream rounded-2xl bg-coconut/40 flex-1 flex flex-col items-center justify-center">
                        <ChefHat className="h-6 w-6 mb-2 opacity-50 stroke-[1.5]" />
                        <span className="text-sm font-serif italic text-center px-4">Ready to analyze. Snap a fresh meal photo or choose a preset to process.</span>
                      </div>
                    )}

                    {capturedImage && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-[#FAF7F2] p-2 rounded-xl">
                          <img 
                            src={capturedImage} 
                            alt="Scanned item text representation" 
                            className="w-12 h-12 object-cover rounded-lg border border-daydream bg-stone-100" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-mono text-kale/50 uppercase block">Snapshot Source</span>
                            <span className="text-sm text-kale font-semibold truncate block">Multimodal Base Payload Loaded</span>
                          </div>
                          <button 
                            onClick={() => { setCapturedImage(null); setVisionResult(null); }}
                            className="p-1 px-2.5 text-sm text-kale/40 hover:text-rose-600 font-bold"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}

                    {visionError && (
                      <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-sm text-rose-600 font-semibold leading-relaxed">
                        ⚠ {visionError}
                      </div>
                    )}

                    {visionResult && (
                      <div className="space-y-4 animate-fade-in flex-1">
                        <div>
                          <span className="text-[9.5px] font-mono text-sage uppercase font-bold tracking-wider block">Est. Raw weights from vision</span>
                          <h4 className="text-sm font-serif italic font-bold text-kale truncate mt-1">{visionResult.name}</h4>
                        </div>

                        {/* Estimated components raw weights metrics */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#FAF7F2] border border-daydream rounded-xl p-2 font-mono">
                            <span className="text-[11px] text-stone-500 uppercase block">Est. Raw Protein</span>
                            <strong className="text-sm text-cinnamon tracking-tight">{visionResult.estimatedRawProteinGrams || 0}g</strong>
                          </div>
                          <div className="bg-[#FAF7F2] border border-daydream rounded-xl p-2 font-mono">
                            <span className="text-[11px] text-stone-500 uppercase block">Est. Raw Veg/Sides</span>
                            <strong className="text-sm text-sage tracking-tight">{visionResult.estimatedRawVegetableGrams || 0}g</strong>
                          </div>
                        </div>

                        {/* Nutrition outline */}
                        <div className="grid grid-cols-4 gap-2.5 text-center py-2.5 border-y border-daydream/60">
                          <div>
                            <span className="text-[11px] font-mono text-stone-400 block uppercase">calories</span>
                            <strong className="text-sm text-kale font-bold">{visionResult.calories}</strong>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono text-stone-400 block uppercase">protein</span>
                            <strong className="text-sm text-cinnamon font-bold">{visionResult.protein}g</strong>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono text-stone-400 block uppercase">carbs</span>
                            <strong className="text-sm text-sage font-bold">{visionResult.carbs}g</strong>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono text-stone-400 block uppercase">fat</span>
                            <strong className="text-sm text-[#9a3b26] font-bold">{visionResult.fat}g</strong>
                          </div>
                        </div>

                        {/* Brief explanation */}
                        <p className="text-sm text-kale/80 font-serif italic leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-daydream">
                          🍽️ {visionResult.analysisBrief}
                        </p>

                        <button
                          type="button"
                          onClick={() => commitScannedFoodLog('vision')}
                          className="w-full text-sm font-mono uppercase tracking-widest font-bold bg-kale text-coconut h-[38px] rounded-xl hover:bg-sage hover:text-kale transition flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Log Vision Scanned Plate
                        </button>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

            {/* Sub Mode B: International Trade Barcode Lookup */}
            {scanTab === 'barcode' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Search query Left */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-[#FAF7F2]/60 border border-daydream rounded-2xl p-4 space-y-4">
                    <div>
                      <h4 className="font-serif italic font-bold text-sm text-kale">Global Barcode Database Query</h4>
                      <p className="text-sm text-stone-500 leading-relaxed mt-0.5">
                        Scan or manually enter any international barcode. The lookup bypasses local locks to query the global decentralized registry (Open Food Facts API), perfect for checking snacks or staples from different countries.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={typedBarcode}
                        onChange={(e) => setTypedBarcode(e.target.value)}
                        placeholder="e.g. 9300601385415 or 0021000658831"
                        className="w-full text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono font-bold"
                        onKeyDown={(e) => { if (e.key === 'Enter') performBarcodeQuery(typedBarcode); }}
                      />
                      <button
                        type="button"
                        onClick={() => performBarcodeQuery(typedBarcode)}
                        disabled={barcodeLoading || !typedBarcode.trim()}
                        className="w-full bg-kale hover:bg-sage hover:text-kale text-coconut px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5"
                      >
                        {barcodeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                        Lookup
                      </button>
                    </div>

                    {barcodeError && (
                      <p className="text-sm text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                        ⚠ {barcodeError}
                      </p>
                    )}

                    {/* Integrated Mobile/Webcam Barcode Scanning Engine Viewfinder */}
                    <div className="pt-2 border-t border-daydream/40 space-y-3">
                      <button
                        type="button"
                        onClick={cameraActive ? stopLiveCamera : startLiveCamera}
                        className="w-full h-9 bg-coconut hover:bg-daydream/30 border border-daydream text-sm font-mono font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 text-kale shadow-xs select-none cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-cinnamon shrink-0" />
                        {cameraActive ? "Deactivate Scanner Camera" : "Activate Live Barcode Camera Scanner"}
                      </button>

                      {cameraActive && (
                        <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-kale shadow-inner flex flex-col justify-end">
                          {/* Live Video Stream from Device Camera */}
                          {!showHtml5Scanner && (
                            <video
                              ref={(el) => {
                                if (el) {
                                  // @ts-ignore
                                  barcodeVideoRef.current = el;
                                  if (cameraStream && el.srcObject !== cameraStream) {
                                    el.srcObject = cameraStream;
                                    el.play().catch(e => console.warn("Play barcode stream err:", e));
                                  }
                                }
                              }}
                              className="absolute inset-0 w-full h-full object-cover"
                              autoPlay
                              playsInline
                              muted
                            />
                          )}

                          {/* Fallback Virtual scanner overlay if sandbox blocks WebRTC camera feed */}
                          {showHtml5Scanner && (
                            <div className="absolute inset-0 bg-[#1C201A]/65 flex flex-col items-center justify-center p-4 text-coconut text-center">
                              <Loader2 className="h-6 w-6 animate-spin text-sage mb-2" />
                              <span className="font-mono text-sm uppercase tracking-widest text-[#FAF7F2]">Clinical viewfinder live</span>
                            </div>
                          )}

                          {/* Pulsing neon red laser scanline overlay */}
                          <div className="absolute inset-x-0 w-full h-[3px] bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-pulse pointer-events-none" style={{
                            top: '48%',
                            animation: 'bounce 2.2s infinite ease-in-out'
                          }} />

                          {/* Glowing corner target reticles */}
                          <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
                            <div className="flex justify-between">
                              <div className="w-5 h-5 border-t-3 border-l-3 border-sage rounded-tl" />
                              <div className="w-5 h-5 border-t-3 border-r-3 border-sage rounded-tr" />
                            </div>
                            
                            <div className="text-center">
                              <span className="bg-kale/90 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-coconut rounded-lg">
                                {'BarcodeDetector' in window ? "NATIVE BARCODE ENGINE STANDBY • ALIGN REGISTRY CODE" : "LOCAL OPTICAL ALIGNMENT LIVE"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <div className="w-5 h-5 border-b-3 border-l-3 border-sage rounded-bl" />
                              <div className="w-5 h-5 border-b-3 border-r-3 border-sage rounded-br" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* International test presets for easy showcase of foreign scanning */}
                  <div className="bg-coconut border border-daydream rounded-xl p-4">
                    <span className="text-[9.5px] font-mono text-kale/60 uppercase block mb-3 font-semibold tracking-wider">
                      ✈️ Quick Test presets for international products (simulates traveling)
                    </span>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {INTERNATIONAL_BARCODES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setTypedBarcode(item.code);
                            performBarcodeQuery(item.code);
                          }}
                          className="bg-[#FAF7F2] hover:bg-daydream/30 text-left p-2 rounded-xl border border-daydream text-sm break-words transition font-mono"
                        >
                          <span className="block font-bold text-stone-700">{item.country}</span>
                          <span className="block font-serif italic text-kale mt-0.5">{item.item}</span>
                          <span className="text-[11px] text-kale/40 block mt-0.5 truncate">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scanned product weight adjuster Right */}
                <div className="md:col-span-5">
                  <div className="bg-coconut border border-daydream p-5 rounded-3xl min-h-[220px] flex flex-col justify-between gap-5 relative">
                    
                    {!barcodeResult && !barcodeLoading && (
                      <div className="text-center py-10 text-stone-400 border border-dashed border-daydream rounded-2xl bg-[#985F3B]/5 grow flex flex-col items-center justify-center">
                        <Globe className="h-6 w-6 text-[#985F3B]/40 mb-2 stroke-[1.5]" />
                        <span className="text-[10.5px] font-serif italic">Pending lookup feed. Submit a barcode or click traveling test items.</span>
                      </div>
                    )}

                    {barcodeLoading && (
                      <div className="absolute inset-0 bg-coconut/80 rounded-3xl flex flex-col items-center justify-center z-10">
                        <Loader2 className="h-7 w-7 text-sage animate-spin mb-1.5" />
                        <span className="font-mono text-sm uppercase tracking-widest text-kale/60">Quering Global Registry...</span>
                      </div>
                    )}

                    {barcodeResult && (
                      <div className="space-y-4 animate-fade-in flex-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-mono font-bold text-cinnamon uppercase bg-cinnamon/10 px-1.5 py-0.5 rounded">
                              {barcodeResult.source === 'local_international_db' ? 'PRE-LOADED TRAVEL DB' : 'GLOBAL FOOD FACTS API'}
                            </span>
                          </div>
                          <h4 className="text-sm font-serif italic font-extrabold text-kale truncate mt-1">{barcodeResult.name}</h4>
                        </div>

                        {/* Core density info */}
                        <p className="text-[9.5px] text-stone-500 font-mono">
                          Registry baseline densities are stated per <strong className="text-kale">100g</strong>. Under Dr. Sims standards, please input the exact weight consumed:
                        </p>

                        {/* Grams Adjuster Input */}
                        <div className="bg-[#FAF7F2] border border-daydream p-3 rounded-2xl space-y-2">
                          <label className="text-[8.5px] font-mono uppercase text-kale/60 font-bold block">Consumed Intake Weight (g)</label>
                          <div className="relative">
                             <input
                               type="number"
                               value={barcodeWeightGrams || ''}
                               onChange={(e) => setBarcodeWeightGrams(e.target.value !== '' ? Number(e.target.value) : '')}
                               className="w-full text-sm font-mono font-bold bg-coconut border border-daydream/80 rounded-xl p-2 focus:outline-none focus:border-sage"
                               min="0"
                               placeholder="0"
                             />
                            <span className="absolute right-3 top-2 text-sm text-stone-400 font-mono font-bold">grams</span>
                          </div>
                        </div>

                        {/* Calculated values with the multiplier */}
                        {(() => {
                          const mul = Number(barcodeWeightGrams || 0) / 100;
                          if (barcodeManualEntry) {
                            return (
                              <div className="bg-[#FDF5F0] border-t border-cinnamon/20 px-3 py-3">
                                <p className="text-sm font-serif italic text-cinnamon leading-relaxed">
                                  This product was found, but Open Food Facts has no nutrition data on file for it. Enter the values from the packaging manually below before adding.
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-kale/60 uppercase tracking-widest font-mono">Calories (per 100g)</label>
                                    <input
                                      type="number"
                                      value={barcodeResult.calories || ''}
                                      onChange={(e) => setBarcodeResult({ ...barcodeResult, calories: e.target.value === '' ? 0 : Number(e.target.value) })}
                                      placeholder="0"
                                      className="text-sm border border-cinnamon/40 rounded-xl p-2 focus:border-cinnamon focus:outline-none bg-coconut text-kale font-mono"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-kale/60 uppercase tracking-widest font-mono">Protein (g per 100g)</label>
                                    <input
                                      type="number"
                                      value={barcodeResult.protein || ''}
                                      onChange={(e) => setBarcodeResult({ ...barcodeResult, protein: e.target.value === '' ? 0 : Number(e.target.value) })}
                                      placeholder="0"
                                      className="text-sm border border-cinnamon/40 rounded-xl p-2 focus:border-cinnamon focus:outline-none bg-coconut text-kale font-mono"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-kale/60 uppercase tracking-widest font-mono">Carbs (g per 100g)</label>
                                    <input
                                      type="number"
                                      value={barcodeResult.carbs || ''}
                                      onChange={(e) => setBarcodeResult({ ...barcodeResult, carbs: e.target.value === '' ? 0 : Number(e.target.value) })}
                                      placeholder="0"
                                      className="text-sm border border-cinnamon/40 rounded-xl p-2 focus:border-cinnamon focus:outline-none bg-coconut text-kale font-mono"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-kale/60 uppercase tracking-widest font-mono">Fat (g per 100g)</label>
                                    <input
                                      type="number"
                                      value={barcodeResult.fat || ''}
                                      onChange={(e) => setBarcodeResult({ ...barcodeResult, fat: e.target.value === '' ? 0 : Number(e.target.value) })}
                                      placeholder="0"
                                      className="text-sm border border-cinnamon/40 rounded-xl p-2 focus:border-cinnamon focus:outline-none bg-coconut text-kale font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="grid grid-cols-4 gap-2 text-center text-sm font-mono py-2 bg-coconut border-t border-daydream">
                              <div>
                                <span className="text-[11px] text-stone-400 block uppercase">calories</span>
                                <strong className="text-kale">{Math.round(barcodeResult.calories * mul)}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-400 block uppercase">protein</span>
                                <strong className="text-cinnamon">{Math.round(barcodeResult.protein * mul)}g</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-400 block uppercase">carbs</span>
                                <strong className="text-sage">{Math.round(barcodeResult.carbs * mul)}g</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-400 block uppercase">fat</span>
                                <strong className="text-stone-700">{Math.round(barcodeResult.fat * mul)}g</strong>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => commitScannedFoodLog('barcode')}
                            className="flex-1 text-sm font-mono uppercase tracking-widest font-bold bg-kale text-coconut h-[38px] rounded-xl hover:bg-sage hover:text-kale transition flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" /> Log Scaled Intake
                          </button>
                          <button
                            type="button"
                            onClick={() => saveScannedFavourite(barcodeResult)}
                            className="text-sm font-mono uppercase tracking-widest font-bold bg-coconut border border-daydream text-kale h-[38px] px-4 rounded-xl hover:bg-cinnamon hover:text-coconut hover:border-cinnamon transition flex items-center justify-center gap-1"
                            title="Save to favourites"
                          >
                            {favSaved ? <Check className="h-3.5 w-3.5" /> : '★'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 3: SMART AI PARSER */}
        {activeInputTab === 'ai' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <label className="text-sm font-semibold text-kale/80 font-serif italic">
              Describe items consumed:
            </label>
            <div className="relative">
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                rows={3}
                placeholder="Examples:
- 3 boiled eggs, half an avocado, and two slices of sourdough toast
- 1 bowl of greek yogurt, wild berries, raw oats and pumpkin seeds
- Grilled salmon with spinach salad, walnuts, and wild rice"
                className="w-full text-sm border border-daydream rounded-2xl p-4 pr-12 focus:border-sage focus:outline-none placeholder-stone-400 bg-coconut/50 text-kale resize-none font-sans"
                disabled={aiLoading}
              />
              <button 
                onClick={handleAiParse}
                disabled={aiLoading || !aiText.trim()}
                className="absolute right-3 bottom-4 p-2.5 bg-kale text-coconut rounded-xl hover:bg-sage hover:text-kale transition disabled:opacity-40 select-none outline-none flex items-center gap-1 min-h-[40px]"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="text-sm font-mono uppercase tracking-widest px-1">AI Log</span>
              </button>
            </div>
            {aiError && (
              <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-100">
                ⚠ {aiError}
              </p>
            )}

            {aiPreview && (
              <div className="bg-[#EEF4EC] border border-sage/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-sage uppercase tracking-wider">AI Parsed — Does this look right?</span>
                  <button type="button" onClick={() => setAiPreview(null)} className="text-kale/40 hover:text-kale text-lg leading-none">×</button>
                </div>
                <p className="font-serif italic text-kale font-semibold">{aiPreview.name}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-sm font-mono">
                  <div className="bg-coconut rounded-xl p-2">
                    <div className="text-kale/50 text-xs uppercase">kcal</div>
                    <div className="font-bold text-kale">{aiPreview.calories}</div>
                  </div>
                  <div className="bg-coconut rounded-xl p-2">
                    <div className="text-cinnamon/60 text-xs uppercase">protein</div>
                    <div className="font-bold text-cinnamon">{aiPreview.protein}g</div>
                  </div>
                  <div className="bg-coconut rounded-xl p-2">
                    <div className="text-sage text-xs uppercase">carbs</div>
                    <div className="font-bold text-sage">{aiPreview.carbs}g</div>
                  </div>
                  <div className="bg-coconut rounded-xl p-2">
                    <div className="text-[#9A3B26]/60 text-xs uppercase">fat</div>
                    <div className="font-bold text-[#9A3B26]">{aiPreview.fat}g</div>
                  </div>
                </div>
                {aiPreview.fibreG > 0 && (
                  <p className="text-xs font-mono text-sage">Fibre: {aiPreview.fibreG}g</p>
                )}
                <p className="text-xs text-kale/50 font-sans italic">AI estimates are ±15–20% accurate. If this looks wrong, dismiss and log manually.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { onAddFood(aiPreview); setAiPreview(null); setAiText(''); }}
                    className="flex-1 bg-kale text-coconut rounded-xl py-2.5 text-sm font-mono font-bold uppercase tracking-wider hover:bg-sage transition"
                  >
                    ✓ Confirm & Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiPreview(null)}
                    className="px-4 bg-coconut border border-daydream text-kale/60 rounded-xl py-2.5 text-sm font-mono hover:text-kale transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <span className="text-sm text-kale/60 font-mono">
              ✦ Note: The parser adjusts macro allocation and micronutrient models automatically with simulated female hormone-mediated metabolic shifts.
            </span>
          </div>
        )}

        {activeInputTab === 'recipe' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-[#FAF7F2]/60 border border-daydream/80 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-sm font-mono font-bold text-kale uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="h-3.5 w-3.5 text-cinnamon" /> Recipe Parser
                </span>
                <p className="text-sm text-kale/55 font-sans mt-1">
                  Paste any recipe — ingredients list or full recipe text. AI calculates nutrition per serving using USDA food data.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-kale/60 uppercase tracking-widest">Recipe makes (servings)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={recipeServings}
                    onChange={(e) => setRecipeServings(e.target.value)}
                    className="text-sm font-mono font-bold border border-daydream rounded-xl p-2.5 bg-coconut text-kale focus:border-sage focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="4"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-kale/60 uppercase tracking-widest">I am eating (servings)</label>
                  <input
                    type="number"
                    min="0.25"
                    max="10"
                    step="0.25"
                    value={recipeServingNumber}
                    onChange={(e) => setRecipeServingNumber(e.target.value)}
                    className="text-sm font-mono font-bold border border-daydream rounded-xl p-2.5 bg-coconut text-kale focus:border-sage focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-kale/60 uppercase tracking-widest">Paste your recipe here</label>
                <textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder={"Example:\nChicken & Vegetable Stir Fry\n- 500g chicken breast\n- 200g broccoli\n- 150g red capsicum\n- 2 tbsp coconut oil\n- 100g brown rice (dry)\n- 2 tbsp soy sauce"}
                  rows={8}
                  className="text-sm font-sans border border-daydream rounded-xl p-3 bg-coconut text-kale focus:border-sage focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleParseRecipe}
                disabled={recipeLoading || !recipeText.trim()}
                className="w-full bg-kale text-coconut rounded-xl py-3 text-sm font-mono font-bold uppercase tracking-widest hover:bg-sage transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {recipeLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Parsing recipe...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Parse Recipe</>
                )}
              </button>

              {recipeError && (
                <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-100">
                  ⚠ {recipeError}
                </p>
              )}
            </div>

            {recipePreview && (
              <div className="bg-[#EEF4EC] border border-sage/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-sage uppercase tracking-wider">Recipe Parsed — Does this look right?</span>
                  <button type="button" onClick={() => setRecipePreview(null)} className="text-kale/40 hover:text-kale text-xl leading-none">×</button>
                </div>

                <div>
                  <p className="font-serif italic text-kale font-bold text-base">{recipePreview.name}</p>
                  <p className="text-xs font-mono text-kale/50 mt-0.5">{recipePreview.servingDescription}</p>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: 'kcal', val: recipePreview.calories, color: 'text-kale' },
                    { label: 'protein', val: `${recipePreview.protein}g`, color: 'text-cinnamon' },
                    { label: 'carbs', val: `${recipePreview.carbs}g`, color: 'text-sage' },
                    { label: 'fat', val: `${recipePreview.fat}g`, color: 'text-[#9A3B26]' },
                    { label: 'fibre', val: `${recipePreview.fibreG || 0}g`, color: 'text-sage' },
                  ].map((item) => (
                    <div key={item.label} className="bg-coconut rounded-xl p-2">
                      <div className="text-[10px] text-kale/50 font-mono uppercase">{item.label}</div>
                      <div className={`font-bold font-mono text-sm ${item.color}`}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {recipePreview.ingredients && recipePreview.ingredients.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-kale/50 uppercase tracking-wider mb-1.5">Ingredients recognised</p>
                    <div className="space-y-1">
                      {recipePreview.ingredients.map((ing: string, i: number) => (
                        <p key={i} className="text-xs font-sans text-kale/70">✦ {ing}</p>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-kale/50 font-sans italic">
                  AI estimates are ±15–20% accurate. If values look wrong, adjust your recipe description and try again.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAddFood({
                        id: 'f_recipe_' + Date.now(),
                        name: recipePreview.name,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        calories: recipePreview.calories,
                        protein: recipePreview.protein,
                        carbs: recipePreview.carbs,
                        fat: recipePreview.fat,
                        fibreG: recipePreview.fibreG || undefined,
                        ironMg: recipePreview.ironMg || undefined,
                        calciumMg: recipePreview.calciumMg || undefined,
                        sodiumMg: recipePreview.sodiumMg || undefined,
                      });
                      setRecipePreview(null);
                      setRecipeText('');
                    }}
                    className="flex-1 bg-kale text-coconut rounded-xl py-2.5 text-sm font-mono font-bold uppercase tracking-wider hover:bg-sage transition"
                  >
                    ✓ Confirm & Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipePreview(null)}
                    className="px-4 bg-coconut border border-daydream text-kale/60 rounded-xl py-2.5 text-sm font-mono hover:text-kale transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-kale/45 font-sans italic">
              ✦ Works with any recipe format — ingredient lists, full recipes, or just a rough description. Include quantities and units for best accuracy.
            </p>
          </div>
        )}

      </div>


      {/* ── FIBRE BAR ─────────────────────────────────────────────────── */}
      {(() => {
        const FIBRE_TARGET = 30;
        const totalFibre = foods.reduce((sum, f) => sum + (f.fibreG || 0), 0);
        const fibrePct = Math.min(100, Math.round((totalFibre / FIBRE_TARGET) * 100));
        const fibreRemaining = Math.max(0, FIBRE_TARGET - totalFibre);

        const phaseNudge: Record<string, string> = {
          menstrual: "Menstrual phase — soluble fibre eases cramping and binds excess prostaglandins. Add oats or chia.",
          follicular: "Follicular phase — fibre feeds the gut microbiome that recycles oestrogen. Prioritise legumes and vegetables.",
          ovulatory: "Ovulatory phase — cruciferous vegetables support oestrogen clearance via the gut.",
          luteal: "Luteal phase — fibre supports progesterone clearance and eases progesterone-driven constipation. Add flaxseed or lentils.",
          perimenopause: "Perimenopause — fibre modulates oestrogen via the estrobolome. 30g minimum daily is non-negotiable.",
          menopause: "Menopause — fibre lowers cardiovascular risk and supports the gut-hormone axis. Prioritise diversity of plant foods.",
          pill: "On hormonal contraception, your hormone profile stays steady — fibre still matters daily for gut and metabolic health, just without the phase-specific shifts.",
          pregnancy: "Pregnancy increases fibre needs to support digestion changes from progesterone and reduce constipation risk. Aim for the full 30g daily.",
          lactation: "Lactation demands consistent fibre intake to support your own digestion alongside increased fluid and energy needs."
        };
        const nudge = phaseNudge[cyclePhase] || phaseNudge[lifecycle] || "Aim for 30g daily — diversity of plant sources matters as much as quantity.";
        const isGood = fibrePct >= 80;

        return (
          <div className={`rounded-2xl p-4 border ${isGood ? 'bg-[#EEF4EC] border-sage/40' : 'bg-[#FDF5F0] border-cinnamon/20'} mb-2`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-sage' : 'bg-cinnamon'}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-kale/60">Fibre</span>
              </div>
              <div className="font-serif text-kale text-sm">
                <span className={`text-base font-semibold ${isGood ? 'text-sage' : 'text-cinnamon'}`}>{totalFibre.toFixed(1)}g</span>
                <span className="text-kale/40"> / {FIBRE_TARGET}g</span>
              </div>
            </div>
            <div className="w-full h-2 bg-daydream rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-sage' : 'bg-cinnamon/70'}`}
                style={{ width: `${fibrePct}%` }}
              />
            </div>
            {fibreRemaining > 0 ? (
              <p className="font-serif italic text-xs text-cinnamon leading-relaxed">{nudge}</p>
            ) : (
              <p className="font-serif italic text-xs text-sage leading-relaxed">Daily fibre target met — your gut and hormone pathways will thank you. 🌿</p>
            )}
          </div>
        );
      })()}

      {/* Logged foods display list section (unchanged from earlier beautiful base UI) */}
      <div className="border-t border-daydream pt-6" id="intake-journal-list">
        <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block mb-4 font-mono font-bold">
          Intake Journal today ({foods.length})
        </span>

        {foods.length === 0 ? (
          <div className="text-center py-8 text-kale/40 border border-dashed border-daydream rounded-2xl bg-coconut/40">
            <ChefHat className="h-6 w-6 mx-auto mb-2 opacity-60 stroke-[1.5]" />
            <span className="text-sm font-serif italic">No food items recorded for today.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {foods.map((food) => {
              const isEditing = editingFoodId === food.id;
              if (isEditing) {
                return (
                  <div 
                    key={food.id} 
                    className="flex flex-col gap-3 p-4 bg-coconut border-2 border-sage rounded-2xl animate-fade-in"
                  >
                    <div className="flex justify-between items-center bg-[#FAF7F2]/50 p-2 rounded-xl mb-1">
                      <span className="text-sm font-mono font-bold text-kale uppercase">Editing Intake Record</span>
                      <span className="text-sm font-mono text-kale/40">{food.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Meal / Item Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-semibold"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Calories</label>
                          <input
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(parseInt(e.target.value) || 0)}
                            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Pro (g)</label>
                          <input
                            type="number"
                            value={editProtein}
                            onChange={(e) => setEditProtein(parseInt(e.target.value) || 0)}
                            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Carb (g)</label>
                          <input
                            type="number"
                            value={editCarbs}
                            onChange={(e) => setEditCarbs(parseInt(e.target.value) || 0)}
                            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-kale/60 uppercase tracking-widest font-mono">Fat (g)</label>
                          <input
                            type="number"
                            value={editFat}
                            onChange={(e) => setEditFat(parseInt(e.target.value) || 0)}
                            className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-bold text-kale/60 uppercase tracking-widest font-mono">Iron (mg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editIron}
                          onChange={(e) => setEditIron(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="None"
                          className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-bold text-kale/60 uppercase tracking-widest font-mono">Calcium (mg)</label>
                        <input
                          type="number"
                          value={editCalcium}
                          onChange={(e) => setEditCalcium(e.target.value === '' ? '' : parseInt(e.target.value))}
                          placeholder="None"
                          className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-bold text-kale/60 uppercase tracking-widest font-mono">Sodium (mg)</label>
                        <input
                          type="number"
                          value={editSodium}
                          onChange={(e) => setEditSodium(e.target.value === '' ? '' : parseInt(e.target.value))}
                          placeholder="None"
                          className="text-sm border border-daydream rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-bold text-sage uppercase tracking-widest font-mono">Fibre (g)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editFibre}
                          onChange={(e) => setEditFibre(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="None"
                          className="text-sm border border-sage/40 rounded-xl p-2.5 focus:border-sage focus:outline-none bg-coconut text-kale font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-daydream/40 mt-1">
                      <button
                        type="button"
                        onClick={() => setEditingFoodId(null)}
                        className="px-3.5 py-1.5 border border-daydream rounded-xl text-sm font-mono uppercase tracking-wider text-kale/70 hover:bg-[#FAF7F2]/50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editName || editCalories < 0) return;
                          const nextFood: FoodLog = {
                            ...food,
                            name: editName,
                            calories: Number(editCalories),
                            protein: Number(editProtein),
                            carbs: Number(editCarbs),
                            fat: Number(editFat),
                            ironMg: editIron !== '' ? Number(editIron) : undefined,
                            calciumMg: editCalcium !== '' ? Math.round(Number(editCalcium)) : undefined,
                            sodiumMg: editSodium !== '' ? Math.round(Number(editSodium)) : undefined,
                            fibreG: editFibre !== '' ? Number(editFibre) : food.fibreG
                          };
                          if (onUpdateFood) {
                            onUpdateFood(nextFood);
                          } else {
                            food.name = editName;
                            food.calories = Number(editCalories);
                            food.protein = Number(editProtein);
                            food.carbs = Number(editCarbs);
                            food.fat = Number(editFat);
                            food.ironMg = editIron !== '' ? Number(editIron) : undefined;
                            food.calciumMg = editCalcium !== '' ? Math.round(Number(editCalcium)) : undefined;
                            food.sodiumMg = editSodium !== '' ? Math.round(Number(editSodium)) : undefined;
                            food.fibreG = editFibre !== '' ? Number(editFibre) : undefined;
                          }
                          setEditingFoodId(null);
                        }}
                        className="px-4 py-1.5 bg-kale text-coconut rounded-xl text-sm font-mono uppercase tracking-widest font-bold hover:bg-sage hover:text-kale transition flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={food.id} 
                  className="flex items-center justify-between p-4 bg-coconut/50 rounded-2xl border border-daydream transition-colors group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-serif font-bold italic text-kale truncate">{food.name}</span>
                      <span className="text-sm text-kale/50 font-mono uppercase tracking-wider">{food.timestamp}</span>
                    </div>
                    {/* Macros line */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 font-mono text-sm">
                      <span className="text-kale font-bold">{food.calories} kcal</span>
                      <span className="text-kale/15">|</span>
                      <span className="text-kale/60">Carbs <strong className="text-kale">{food.carbs}g</strong></span>
                      <span className="text-kale/60">Pro <strong className="text-kale">{food.protein}g</strong></span>
                      <span className="text-kale/60">Fat <strong className="text-kale">{food.fat}g</strong></span>
                      
                      {/* Micro displays if logged */}
                      {(food.ironMg || food.calciumMg || food.sodiumMg) && (
                        <>
                          <span className="text-kale/15">|</span>
                          {food.ironMg !== undefined && (
                            <span className="text-cinnamon font-bold">Fe {food.ironMg}mg</span>
                          )}
                          {food.calciumMg !== undefined && (
                            <span className="text-kale font-bold">Ca {food.calciumMg}mg</span>
                          )}
                          {food.sodiumMg !== undefined && (
                            <span className="text-sage font-bold">Na {food.sodiumMg}mg</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditingFood(food)}
                      className="p-2 opacity-40 hover:bg-sage/10 rounded-xl hover:text-kale transition group-hover:opacity-100 duration-150 outline-none"
                      title="Edit record"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFood(food.id)}
                      className="p-2 opacity-40 hover:bg-rose-50 rounded-xl hover:text-rose-600 transition group-hover:opacity-100 duration-150 outline-none"
                      title="Remove record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
