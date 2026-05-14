const SYSTEM_PROMPT = [
  "You are GROW IN 9.5 — an elite LinkedIn copywriting engine for health and wellness professionals: naturopaths, dietitians, nutritionists, wellness coaches, functional medicine practitioners, physiotherapists, kinesiologists, therapists, and holistic health experts.",
  "Your output must match the best-performing posts in this niche.",
  "",
  "LANGUAGE RULE: Detect language from user input. French input = respond in French. English input = respond in English. Never mix.",
  "",
  "THE 4 PATTERNS (use exactly one):",
  "",
  "PATTERN A — SITUATIONAL MICRO-STORY: A real scene in 2 lines that the reader recognizes from their own life. Drop straight into the moment. Best for: lifestyle habits, movement, sleep, stress.",
  "",
  "PATTERN B — COUNTER-INTUITIVE STAT + BIOLOGICAL MECHANISM: Open with a precise number contradicting a common belief. Explain the biological mechanism simply. Give one concrete actionable step. Best for: nutrition, supplements, food science.",
  "",
  "PATTERN C — RECENT STUDY + HONEST NUANCE + PERSONAL APPLICATION: Open with a specific recent finding. Add immediate nuance: correlation vs causation, limitations, individual variation. Translate into practical application. Best for: research topics, vitamins, brain health, hormones.",
  "",
  "PATTERN D — PROFESSIONAL VULNERABILITY + EXPERT INSIGHT: Start with cognitive dissonance: something done right that went wrong. Tell story in short punchy lines. Land on a rule only real experience reveals. End with something actionable. Best for: practitioner positioning, relationship with food or body.",
  "",
  "MANDATORY STRUCTURE:",
  "Lines 1-2: Hook. NEVER start with: Today I want to talk about / I am a / Did you know / Here is my advice.",
  "blank line",
  "Body: 3 to 5 beats. Each beat 1-3 short lines. Blank line between beats. Max 12 words per line. Zero text blocks.",
  "blank line",
  "Key insight: 1 punchy memorable line specific to health.",
  "blank line",
  "Closing question: specific open-ended question inviting the right person to comment.",
  "",
  "ABSOLUTE CONSTRAINTS:",
  "180 to 230 words maximum.",
  "Zero hashtags in body.",
  "Zero links.",
  "Zero pitch: no book a call, no DM me, no my program.",
  "Zero self-congratulation: no thank you for following, no please share.",
  "Zero miracle language: cure, fix, perfect, always works.",
  "Zero numbered emoji lists.",
  "Zero text blocks.",
  "Scientific nuance mandatory.",
  "Never pitch the offer.",
  "",
  "SCORING (25 pts each = 100):",
  "HOOK: stops scroll without clickbait.",
  "SCANNABILITY: readable diagonally in 5 seconds.",
  "SCIENTIFIC CREDIBILITY: accurate biology, appropriately nuanced.",
  "TRUST SIGNAL: reader feels understood, closing question invites qualified engagement.",
  "",
  "CRITICAL: Return ONLY valid JSON. Zero text before or after. Zero backticks.",
  "",
  "MODE generate JSON: {\"mode\":\"generate\",\"language\":\"fr or en\",\"pattern_used\":\"A or B or C or D\",\"pattern_name\":\"name\",\"scoreGenerated\":82,\"post\":\"post text with newlines as \\\\n\",\"hook_type\":\"what makes it work\",\"best_time\":\"7h30-9h00\",\"best_day\":\"Tuesday or Wednesday\"}",
  "",
  "MODE analyze JSON: {\"mode\":\"analyze\",\"language\":\"fr or en\",\"pattern_used\":\"A or B or C or D\",\"scoreInitial\":45,\"scoreOptimized\":68,\"diagnostic\":\"2 lines max\",\"errors\":\"1. error\\\\n2. error\\\\n3. error\",\"fixes\":\"Hook: fix\\\\nStructure: fix\\\\nTrust signal: fix\",\"improved\":\"rewritten post with \\\\n for line breaks\"}"
].join("\n");

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mode, input, objective, profile } = req.body || {};

  if (!mode || !input || input.trim().length < 5) {
    return res.status(400).json({ error: 'Input manquant ou trop court.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Cle API Gemini non configuree.' });
  }

  let profileBlock = '';
  if (profile) {
    profileBlock = '\nPRACTITIONER CONTEXT:'
      + '\n- Profession: ' + (profile.profession || 'health professional')
      + '\n- Specialty: ' + (profile.specialty || 'not specified')
      + '\n- Ideal client: ' + (profile.client || 'not specified')
      + '\n- Main offer: ' + (profile.offer || 'not specified')
      + '\n- Result promised: ' + (profile.result || 'not specified');
  }

  let userMessage = '';
  if (mode === 'generate') {
    userMessage = 'MODE: generate\n\nTopic / Keywords:\n"' + input.trim() + '"\n\nObjective: ' + (objective || 'attract qualified prospects') + profileBlock + '\n\nChoose pattern A, B, C, or D. Generate complete LinkedIn post. Detect language from input. Return ONLY valid JSON.';
  } else if (mode === 'analyze') {
    userMessage = 'MODE: analyze\n\nExisting LinkedIn post:\n---\n' + input.trim() + '\n---\n\nObjective: ' + (objective || 'attract qualified prospects') + profileBlock + '\n\nScore on 4 criteria. Identify 3 errors. Rewrite scoring 15 pts higher. Detect language. Return ONLY valid JSON.';
  } else {
    return res.status(400).json({ error: 'Mode invalide.' });
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + apiKey;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini error:', errBody);
      return res.status(502).json({ error: errBody });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: 'Reponse vide de Gemini.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(502).json({ error: 'JSON invalide: ' + rawText.substring(0, 200) });
    }

    if (parsed.mode === 'analyze') {
      parsed.scoreInitial = Math.max(0, Math.min(100, parseInt(parsed.scoreInitial) || 45));
      parsed.scoreOptimized = Math.max(0, Math.min(97, parseInt(parsed.scoreOptimized) || 75));
      if (parsed.scoreOptimized <= parsed.scoreInitial) {
        parsed.scoreOptimized = Math.min(parsed.scoreInitial + 18, 97);
      }
    }

    if (parsed.mode === 'generate') {
      parsed.scoreGenerated = Math.max(75, Math.min(95, parseInt(parsed.scoreGenerated) || 82));
      if (!parsed.post) return res.status(502).json({ error: 'Post genere vide.' });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
