export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { mealText, cyclePhase, lifecycle } = req.body || {};
  if (!mealText) return res.status(400).json({ error: "Missing mealText." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "GEMINI_API_KEY not set in environment." });

  const prompt = `You are a nutrition database for a women's health app. Parse the following food description and return ONLY a valid JSON object with nutritional values for the EXACT portion described (not per 100g).

Food description: "${mealText}"

Rules:
- "name" should be a clean, readable food name including the portion if specified
- All values must be for the ACTUAL AMOUNT described (e.g. if "15g almond butter", return macros for 15g)
- If no amount is specified, assume a standard single serving
- Use USDA or NZ/AU food composition data where possible
- Calories must be physiologically plausible (not 0 unless it is water/black coffee)
- Return ONLY the JSON object, no markdown, no explanation

{"name":"food name","calories":0,"carbs":0,"protein":0,"fat":0,"ironMg":0,"calciumMg":0,"sodiumMg":0,"fibreG":0}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 256 }
      })
    });

    const rawText = await r.text();
    console.log("Gemini status:", r.status);
    console.log("Gemini response:", rawText.substring(0, 500));

    if (!r.ok) {
      return res.status(500).json({ 
        error: "Gemini API call failed.", 
        status: r.status,
        details: rawText.substring(0, 200)
      });
    }

    const data = JSON.parse(rawText);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini", raw: rawText.substring(0, 200) });
    }

    // Clean JSON from markdown if needed
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Sanity check — reject physiologically impossible values
    if (parsed.calories > 5000 || parsed.protein > 500 || parsed.carbs > 1000 || parsed.fat > 500) {
      return res.status(500).json({ error: "AI returned implausible nutrition values — please try again or log manually." });
    }
    
    return res.status(200).json(parsed);

  } catch (err: any) {
    console.error("Parse meal error:", err);
    return res.status(500).json({ 
      error: "Failed to parse meal ingredients with AI.", 
      details: err.message 
    });
  }
}
