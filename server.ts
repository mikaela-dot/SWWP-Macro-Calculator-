/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the model SDK with fallback check
const geminiApiKey = process.env.GEMINI_API_KEY;

// Lazy initialize the SDK safely to ensure clean app startup
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    hasApiKey: !!geminiApiKey,
    currentTime: "2026-05-25T03:17:46Z"
  });
});

// Proxy Open Food Facts global database text-search
app.get("/api/food/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(String(query))}&search_simple=1&action=process&json=1&page_size=20`;
    const response = await fetch(url, {
      headers: { "User-Agent": "MDeatsActive-Search/1.0" }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: "Open Food Facts API error" });
    }

    const data = await response.json();
    const products = data.products || [];

    const results = products.map((prod: any) => {
      const nutriments = prod.nutriments || {};
      const cals = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)));
      const protein = Math.round(Number(nutriments["proteins_100g"] || 0));
      const carbs = Math.round(Number(nutriments["carbohydrates_100g"] || 0));
      const fat = Math.round(Number(nutriments["fat_100g"] || 0));
      const iron = Number(nutriments["iron_100g"] || 0) * 1000; 
      const calcium = Number(nutriments["calcium_100g"] || 0) * 1000;
      const sodium = Number(nutriments["sodium_100g"] || 0) * 1000;

      const pName = prod.product_name || "Unknown Product";
      const brand = prod.brands ? ` (${prod.brands})` : "";

      return {
        id: prod.code || Math.random().toString(),
        name: `${pName}${brand}`,
        calories: cals || 0,
        carbs: carbs || 0,
        protein: protein || 0,
        fat: fat || 0,
        ironMg: iron > 0 ? Number(iron.toFixed(1)) : undefined,
        calciumMg: calcium > 0 ? Math.round(calcium) : undefined,
        sodiumMg: sodium > 0 ? Math.round(sodium) : undefined,
        servingGrams: 100
      };
    });

    return res.json(results);
  } catch (err: any) {
    console.error("Open Food Facts search error:", err);
    return res.status(500).json({ error: "Search failed", details: err.message });
  }
});

// Endpoint 1: Parse natural text into dynamic macros and vitamins
app.post("/api/gemini/parse-meal", async (req, res) => {
  const { mealText, cyclePhase, lifecycle } = req.body;

  if (!mealText) {
    return res.status(400).json({ error: "Missing mealText input parameters." });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Settings." 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following food entry or meal description into macros: "${mealText}". 
Context: The active female user is in the "${cyclePhase}" phase of her cycle under a "${lifecycle}" lifecycle state. Estimate reasonable protein, carbohydrate, fat, calories, iron, calcium, and sodium targets based on normal food data.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A simple consolidated title for the food item or meal." },
            calories: { type: Type.INTEGER, description: "Total calories in kcal" },
            carbs: { type: Type.INTEGER, description: "Carbohydrates in grams" },
            protein: { type: Type.INTEGER, description: "Protein in grams" },
            fat: { type: Type.INTEGER, description: "Fat in grams" },
            ironMg: { type: Type.NUMBER, description: "Estimated iron in milligrams (Mg)" },
            calciumMg: { type: Type.NUMBER, description: "Estimated calcium in milligrams (Mg)" },
            sodiumMg: { type: Type.NUMBER, description: "Estimated sodium in milligrams (Mg)" }
          },
          required: ["name", "calories", "carbs", "protein", "fat"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
       throw new Error("Empty response from AI engine");
    }

    const parsedData = JSON.parse(textResult.trim());
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Meal parsing error:", err);
    return res.status(500).json({ 
      error: "Failed to parse meal ingredients with AI.", 
      details: err.message 
    });
  }
});

// Endpoint 2: Intelligent physiology coaching chat
app.post("/api/gemini/coach-chat", async (req, res) => {
  const { messages, userProfile, currentSummary } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Settings." 
    });
  }

  try {
    const profileContext = userProfile ? `
USER LIFE-STAGE PHYSIOLOGY PROFILE:
- Lifecycle State: ${userProfile.lifecycle}
- Weight: ${userProfile.weightKg}kg, Height: ${userProfile.heightCm}cm, Age: ${userProfile.age}
- Body Fat %: ${userProfile.bodyFatPercent}% (Calculates exact lean mass)
- Training/Lifestyle Goal: ${userProfile.trainingGoal}
` : '';

    const summaryContext = currentSummary ? `
TODAY'S LOGS & METRICS SUMMARY:
- Cycle Phase Today: ${currentSummary.phase}
- Total Calories In: ${currentSummary.totalCalories} kcal
- Macros: ${currentSummary.totalCarbs}g Carbs, ${currentSummary.totalProtein}g Protein, ${currentSummary.totalFat}g Fat
- Key Micro-indicators: Iron: ${currentSummary.totalIronMg}mg, Calcium: ${currentSummary.totalCalciumMg}mg, Sodium: ${currentSummary.totalSodiumMg}mg
- Active Workouts/Movement: ${currentSummary.workouts.length} recorded, Workout Burn: ${currentSummary.workoutKcalBurned} kcal
- Energy Availability (EA): ${currentSummary.energyAvailability} kcal/kg FFM/day (Status: ${currentSummary.energyAvailabilityStatus})
- Symptom logs: Energy level is ${currentSummary.symptoms?.energyLevel || 'unlogged'}/5. Symptoms recorded: ${currentSummary.symptoms?.symptoms?.join(', ') || 'none'}.
` : '';

    const systemInstruction = `You are 'M Deats Active Coach', a sports physiology and board-certified endocrinology expert specializing in active women, lifecycle transitions, and hormonal health syncing, with a special emphasis on perimenopause (perimeno). Your guidance strictly follows clinical evidence (Dr. Stacy Sims' female performance guidelines, Menopause Society guidelines, and the International Olympic Committee's REDs consensus protocols adapted for active women).

    Adapt your voice:
    - Empowering, scientific, practical, warm, and body-intelligent.
    - Focus on help for active women (not necessarily competitive athletes only). Help them balance daily active life, weight training, walking, metabolic health, and muscle wellness.
    - Explicitly talk about estrogen, progesterone, insulin sensitivity, resting energy expenditure, or anabolic resistance where relevant to her current state.
    - If she is in Perimenopause, explain how estrogen storms and progesterone drops can affect her cycle lengths and sleep. Recommend heavy resistance training to maintain lean mass and bone destiny, protein timing, smart carbs (high fiber), and low-stress exercises to manage salivary cortisol levels.
    - If her Energy Availability (EA) is critical (< 30 kcal/kg FFM/day), flag the danger zone of Low Energy Availability (LEA) politely and coach her on safety boundaries to avoid bone loss or system downregulation.
    - If she is in Menopause, explain that the decline of ovarian estrogens induces anabolic resistance. She needs heavy structural resistance loading and protein timing (~30-40g high-quality proteins post-workout) instead of standard empty steady state cardios.
    - If she is Pregnant or Lactating, celebrate her performance and highlight folate, hydration, sodium margins, and safety metrics.

    Keep responses highly structured in clean, professional Markdown. Add 2 direct nutritional bullet recommendations and 1 workout or active movement tip. Keep your answer under 3 scannable paragraphs.`;

    // Transform chat history into standard contents structure
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Inject the contextual parameters in the latest query if it's the start
    if (contents.length >= 1) {
      const idx = contents.length - 1;
      contents[idx].parts[0].text = `[Profile Context: ${profileContext}] \n [Today's Metrics: ${summaryContext}] \n\n User query: ${contents[idx].parts[0].text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const aiAnswer = response.text || "I was unable to retrieve a response from the coaching model. Please retry shortly.";
    return res.json({ response: aiAnswer });
  } catch (err: any) {
    console.error("Coaching chat error:", err);
    return res.status(500).json({ 
      error: "Failed to query the AI physiology coach.", 
      details: err.message 
    });
  }
});

// Endpoint 3: Barcode scanner search with support for international codes (Open Food Facts + Pre-loaded Registry)
app.post("/api/gemini/barcode-scan", async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ error: "Missing barcode parameter." });
  }

  // Pre-loaded offline registry for standard international test barcodes (enables instantaneous testing in case of weak connectivity or non-existent experimental products in other countries)
  const internationalRegistry: Record<string, any> = {
    "0021000658831": {
      name: "Kraft Macaroni & Cheese Dinner (USA)",
      calories: 350,
      carbs: 65,
      protein: 12,
      fat: 4,
      ironMg: 1.8,
      calciumMg: 100,
      sodiumMg: 570,
      servingGrams: 70
    },
    "5449000000996": {
      name: "Coca-Cola Zero Sugar (Europe)",
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      ironMg: 0,
      calciumMg: 0,
      sodiumMg: 10,
      servingGrams: 250
    },
    "9300601385415": {
      name: "Vegemite Yeast Spread (Australia)",
      calories: 180,
      carbs: 20,
      protein: 26,
      fat: 1,
      ironMg: 11.2,
      calciumMg: 120,
      sodiumMg: 3450,
      servingGrams: 100
    },
    "5010044000701": {
      name: "Cadbury Dairy Milk Chocolate (UK)",
      calories: 534,
      carbs: 57,
      protein: 7.3,
      fat: 30,
      ironMg: 1.5,
      calciumMg: 220,
      sodiumMg: 80,
      servingGrams: 100
    },
    "4902105051000": {
      name: "Nissin Soy Cup Noodle (Japan)",
      calories: 351,
      carbs: 44.5,
      protein: 9,
      fat: 15.2,
      ironMg: 2.1,
      calciumMg: 95,
      sodiumMg: 1900,
      servingGrams: 78
    },
    "3017670123512": {
      name: "Nutella Cocoa-Hazelnut Spread (France)",
      calories: 539,
      carbs: 57.5,
      protein: 6.3,
      fat: 30.9,
      ironMg: 1.6,
      calciumMg: 114,
      sodiumMg: 42,
      servingGrams: 100
    }
  };

  const cleanBarcode = String(barcode).trim();

  // Try the primary global Open Food Facts API first
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
    const response = await fetch(url, {
      headers: { "User-Agent": "MDeatsActiveApp - Web - Version 1.0" }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const nutriments = prod.nutriments || {};
        
        // Open Food Facts returns values typically per 100g
        const pName = prod.product_name || `Scanned Product (${cleanBarcode})`;
        const brand = prod.brands ? ` (${prod.brands})` : "";
        
        // Extract nutrients per 100g
        const cals = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)));
        const protein = Math.round(Number(nutriments["proteins_100g"] || 0));
        const carbs = Math.round(Number(nutriments["carbohydrates_100g"] || 0));
        const fat = Math.round(Number(nutriments["fat_100g"] || 0));
        const iron = Number(nutriments["iron_100g"] || 0) * 1000; // convert to mg
        const calcium = Number(nutriments["calcium_100g"] || 0) * 1000; // convert to mg
        const sodium = Number(nutriments["sodium_100g"] || 0) * 1000; // convert to mg

        return res.json({
          source: "open_food_facts",
          name: `${pName}${brand}`,
          calories: cals,
          carbs: carbs,
          protein: protein,
          fat: fat,
          ironMg: iron > 0 ? Number(iron.toFixed(1)) : undefined,
          calciumMg: calcium > 0 ? Math.round(calcium) : undefined,
          sodiumMg: sodium > 0 ? Math.round(sodium) : undefined,
          servingGrams: 100
        });
      }
    }
  } catch (err: any) {
    console.warn("OpenFoodFacts lookup failed or timed out. Falling back to offline matcher.", err);
  }

  // Backup fallback to offline predefined registry to support standard demonstration codes or fallback search
  if (internationalRegistry[cleanBarcode]) {
    return res.json({ source: "local_international_db", ...internationalRegistry[cleanBarcode] });
  }

  return res.status(404).json({ 
    error: "Product not found in Open Food Facts database. Please log manually or snap a label picture.",
    suggestManual: true 
  });
});

// Endpoint 4: Multimodal camera/photo plate and label interpreter
app.post("/api/gemini/scan-food-image", async (req, res) => {
  const { base64Image, cyclePhase, lifecycle } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64Image string." });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Settings." 
    });
  }

  try {
    // Strip header prefix if present (e.g. data:image/jpeg;base64,)
    let strippedBase64 = base64Image;
    let mimeType = "image/jpeg";

    if (base64Image.startsWith("data:")) {
      const match = base64Image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        strippedBase64 = match[2];
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `You are a performance-coaching clinical nutrition AI. Analyze this image of a food label, recipe ingredients, or meal plate.
        Your task is to identify the meal items, estimate the raw weight in grams of major proteins and vegetables/carbs for ultimate tracking accuracy (e.g., equivalent to raw chicken breast weight or raw vegetables before cooking) as this is highly standard for professional active female dietitians, and output exact macros.
        
        Provide the response in structured JSON with:
        - name: Concise descriptive meal title (e.g., "Grilled Salmon with Raw Spinach & Quinoa")
        - estimatedRawProteinGrams: A number representing the analyzed raw weight equivalent of the major protein component in grams, or 0 if none.
        - estimatedRawVegetableGrams: A number representing the analyzed raw weight equivalent of the main vegetables/sides in grams, or 0 if none.
        - calories: Calculated total calories in kcal.
        - carbs: Total carbohydrates in grams.
        - protein: Total protein in grams.
        - fat: Total fat in grams.
        - ironMg: Estimated iron in mg or 0.
        - calciumMg: Estimated calcium in mg or 0.
        - sodiumMg: Estimated sodium in mg or 0.
        - analysisBrief: A short 1-sentence description explaining how raw grams and macros were evaluated from the picture.

        Context: User cycle phase is "${cyclePhase}", lifecycle/lifestage is "${lifecycle}". Adapt recommendations to support bone mineral density, leucine protein triggers, and luteal energy fluxes.`,
        {
          inlineData: {
            mimeType: mimeType,
            data: strippedBase64
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            estimatedRawProteinGrams: { type: Type.INTEGER },
            estimatedRawVegetableGrams: { type: Type.INTEGER },
            calories: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            protein: { type: Type.INTEGER },
            fat: { type: Type.INTEGER },
            ironMg: { type: Type.NUMBER },
            calciumMg: { type: Type.NUMBER },
            sodiumMg: { type: Type.NUMBER },
            analysisBrief: { type: Type.STRING }
          },
          required: ["name", "calories", "carbs", "protein", "fat", "analysisBrief"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from AI vision model");
    }

    const parsedData = JSON.parse(textResult.trim());
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Camera vision analysis error:", err);
    return res.status(500).json({
      error: "Camera scanner failed to analyze the image.",
      details: err.message
    });
  }
});

// Setup Vite Dev-Server middleware or Serve Static Files
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`M Deats Active app server online at http://0.0.0.0:${PORT}`);
  });
}

bootServer();
