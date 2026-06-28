export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { barcode } = req.body || {};
  if (!barcode) {
    return res.status(400).json({ error: "Missing barcode parameter." });
  }

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
        
        const pName = prod.product_name || `Scanned Product (${cleanBarcode})`;
        const brand = prod.brands ? ` (${prod.brands})` : "";
        
        const cals = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)));
        const protein = Math.round(Number(nutriments["proteins_100g"] || 0));
        const carbs = Math.round(Number(nutriments["carbohydrates_100g"] || 0));
        const fat = Math.round(Number(nutriments["fat_100g"] || 0));
        const iron = Number(nutriments["iron_100g"] || 0) * 1000; 
        const calcium = Number(nutriments["calcium_100g"] || 0) * 1000; 
        const sodium = Number(nutriments["sodium_100g"] || 0) * 1000; 

        const fibre = Number(nutriments["fiber_100g"] || nutriments["fibers_100g"] || nutriments["dietary-fiber_100g"] || 0);
        return res.status(200).json({
          source: "open_food_facts",
          name: `${pName}${brand}`,
          calories: cals,
          carbs: carbs,
          protein: protein,
          fat: fat,
          ironMg: iron > 0 ? Number(iron.toFixed(1)) : undefined,
          calciumMg: calcium > 0 ? Math.round(calcium) : undefined,
          sodiumMg: sodium > 0 ? Math.round(sodium) : undefined,
          fibre: fibre > 0 ? Number(fibre.toFixed(1)) : undefined,
          servingGrams: 100
        });
      }
    }
  } catch (err: any) {
    console.warn("OpenFoodFacts lookup failed or timed out. Falling back to offline matcher.", err);
  }

  if (internationalRegistry[cleanBarcode]) {
    return res.status(200).json({ source: "local_international_db", ...internationalRegistry[cleanBarcode] });
  }

  return res.status(404).json({ 
    error: "Product not found in Open Food Facts database. Please log manually or snap a label picture.",
    suggestManual: true 
  });
}
