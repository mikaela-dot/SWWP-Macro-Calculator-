export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message, userProfile, currentSummary, conversationHistory } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Gemini API key not configured." });

  const systemText = `You are a clinical female physiology nutrition coach inside Sérenité Active by MDeats.
You specialise in cycle-phase nutrition, energy availability, hormonal health and female athletic performance.
User phase: ${currentSummary?.phase || "unknown"}. Lifecycle: ${userProfile?.lifecycle || "regular"}.
Today's intake so far: ${currentSummary?.totalCalories || 0}kcal, ${currentSummary?.totalProtein || 0}g protein, ${currentSummary?.totalCarbs || 0}g carbs, ${currentSummary?.totalFat || 0}g fat.
Today's calculated targets: ${currentSummary?.targetCalories || "unknown"}kcal, ${currentSummary?.targetProtein || "unknown"}g protein (minimum ${currentSummary?.proteinPerMealMin || 30}g per meal), ${currentSummary?.targetCarbs || "unknown"}g carbs, ${currentSummary?.targetFat || "unknown"}g fat.
${currentSummary?.metabolicOffsetActive ? `A metabolic adaptation offset of -${currentSummary.metabolicOffsetActive}kcal is currently active.` : ""}
${currentSummary?.usingCustomMacros ? "The user has set a manual custom macro split, overriding the default calculation." : ""}
Always reference these specific targets when giving advice — never give generic macro guidance disconnected from her actual calculated numbers.
Be warm, science-backed, concise and empowering. Keep responses under 150 words.`;

  const history = (conversationHistory || []).map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : (m.role === 'model' ? 'model' : 'user'),
    parts: [{ text: m.text || m.content || '' }]
  })).filter((m: any) => m.parts[0].text.length > 0);

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents: [...history, { role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    );
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
    const data = await r.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to respond.";
    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("Coach chat error:", err);
    return res.status(500).json({ error: "Coach unavailable.", details: err.message });
  }
}
