import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  // Allow only GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const query = req.query?.q;
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

    const results = products
      .filter((prod: any) => {
        // Filter out products with no name or no nutrition data
        const n = prod.nutriments || {};
        const hasName = prod.product_name && prod.product_name.trim().length > 1;
        const hasCals = Number(n["energy-kcal_100g"] || n["energy-kcal_serving"] || 0) > 0;
        const hasAnyMacro = Number(n["proteins_100g"] || 0) > 0 || Number(n["carbohydrates_100g"] || 0) > 0 || Number(n["fat_100g"] || 0) > 0;
        return hasName && (hasCals || hasAnyMacro);
      })
      .slice(0, 12) // cap at 12 quality results
      .map((prod: any) => {
        const nutriments = prod.nutriments || {};
        const cals = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)));
        const protein = Math.round(Number(nutriments["proteins_100g"] || 0));
        const carbs = Math.round(Number(nutriments["carbohydrates_100g"] || 0));
        const fat = Math.round(Number(nutriments["fat_100g"] || 0));
        const iron = Number(nutriments["iron_100g"] || 0) * 1000; 
        const calcium = Number(nutriments["calcium_100g"] || 0) * 1000;
        const sodium = Number(nutriments["sodium_100g"] || 0) * 1000;
        const fibre = Number(nutriments["fiber_100g"] || nutriments["fibers_100g"] || nutriments["dietary-fiber_100g"] || 0);

        const pName = prod.product_name || "Unknown Product";
        const brand = prod.brands ? ` (${prod.brands})` : "";
        const country = prod.countries_tags?.[0]?.replace("en:", "") || "";

        return {
          id: prod.code || Math.random().toString(),
          name: `${pName}${brand}`,
          country,
          calories: cals || 0,
          carbs: carbs || 0,
          protein: protein || 0,
          fat: fat || 0,
          ironMg: iron > 0 ? Number(iron.toFixed(1)) : undefined,
          calciumMg: calcium > 0 ? Math.round(calcium) : undefined,
          sodiumMg: sodium > 0 ? Math.round(sodium) : undefined,
          fibre: fibre > 0 ? Number(fibre.toFixed(1)) : undefined,
          servingGrams: 100
        };
      });

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("Open Food Facts search error:", err);
    return res.status(500).json({ error: "Search failed", details: err.message });
  }
}
