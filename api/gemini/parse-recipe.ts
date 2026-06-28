export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { recipeText, servings, servingNumber } = req.body || {};
  if (!recipeText) return res.status(400).json({ error: 'Missing recipe text.' });
  if (!servings || servings < 1) return res.status(400).json({ error: 'Missing serving count.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Gemini API key not configured.' });

  const prompt = `You are a clinical nutrition database. Parse the following recipe and calculate accurate nutritional values.

Recipe:
${recipeText}

This recipe makes ${servings} serving(s). The user is eating ${servingNumber || 1} serving(s).

Instructions:
- Calculate the TOTAL nutrition for the entire recipe first
- Then divide by ${servings} to get per-serving values
- Then multiply by ${servingNumber || 1} for the user's portion
- Use USDA FoodData Central values where possible
- Account for cooking methods (e.g. oil absorbed during frying, water lost during cooking)
- If an ingredient amount is unclear, use a standard serving size
- The recipe name should be descriptive and include key ingredients

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "name": "descriptive recipe name",
  "servingDescription": "1 of ${servings} servings",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fibreG": 0,
  "ironMg": 0,
  "calciumMg": 0,
  "sodiumMg": 0,
  "totalRecipeCalories": 0,
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"]
}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );

    if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);

    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Sanity checks
    if (parsed.calories > 8000 || parsed.protein > 600 || parsed.fat > 600) {
      return res.status(500).json({ error: 'AI returned implausible values — please check your recipe and try again.' });
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Recipe parse error:', err);
    return res.status(500).json({ error: err.message || 'Recipe parser unavailable — please try again.' });
  }
}
