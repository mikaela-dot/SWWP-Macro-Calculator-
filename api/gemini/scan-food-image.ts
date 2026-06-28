export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: "Missing imageBase64." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Gemini API key not configured." });

  const prompt = `Analyse this nutrition label or food image. Extract macronutrient data.
Respond ONLY with valid JSON:
{"name":"food name","calories":0,"carbs":0,"protein":0,"fat":0,"ironMg":0,"calciumMg":0,"sodiumMg":0,"fibreG":0}
All values per 100g.`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }
          ]}],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 256 }
        })
      }
    );
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");
    return res.status(200).json(JSON.parse(text.trim()));
  } catch (err: any) {
    console.error("Image scan error:", err);
    return res.status(500).json({ error: "Failed to scan image.", details: err.message });
  }
}
