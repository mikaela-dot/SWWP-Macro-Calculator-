export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'USDA API key not configured' });
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(q)}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)&pageSize=15&sortBy=dataType.keyword&sortOrder=asc`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API returned ${response.status}`);
    }

    const data = await response.json();
    const foods = data.foods || [];

    const results = foods
      .filter((food: any) => {
        // Filter out foods with no useful nutrient data
        const nutrients = food.foodNutrients || [];
        const hasEnergy = nutrients.some((n: any) => n.nutrientId === 1008 && n.value > 0);
        return hasEnergy;
      })
      .slice(0, 12)
      .map((food: any) => {
        const nutrients = food.foodNutrients || [];
        
        const getNutrient = (id: number) => {
          const n = nutrients.find((n: any) => n.nutrientId === id);
          return n ? Number(n.value) : 0;
        };

        const calories  = Math.round(getNutrient(1008)); // Energy kcal
        const protein   = Math.round(getNutrient(1003) * 10) / 10; // Protein
        const carbs     = Math.round(getNutrient(1005) * 10) / 10; // Carbs
        const fat       = Math.round(getNutrient(1004) * 10) / 10; // Fat
        const fibre     = Math.round(getNutrient(1079) * 10) / 10; // Fibre
        const iron      = Math.round(getNutrient(1089) * 100) / 100; // Iron mg
        const calcium   = Math.round(getNutrient(1087)); // Calcium mg
        const sodium    = Math.round(getNutrient(1093)); // Sodium mg

        return {
          id: String(food.fdcId),
          name: food.description,
          category: food.foodCategory || '',
          calories,
          protein,
          carbs,
          fat,
          fibre: fibre > 0 ? fibre : undefined,
          ironMg: iron > 0 ? iron : undefined,
          calciumMg: calcium > 0 ? calcium : undefined,
          sodiumMg: sodium > 0 ? sodium : undefined,
          _source: 'usda',
          _dataType: food.dataType
        };
      });

    return res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'USDA search failed' });
  }
}
