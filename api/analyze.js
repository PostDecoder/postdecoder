// ============================================
// GROW IN 9.5 — /api/analyze.js
// Spécialisé : professionnels santé & bien-être
// Modes : génération from scratch + analyse/réécriture
// Langues : FR / EN détection automatique
// ============================================

const SYSTEM_PROMPT = `You are GROW IN 9.5, an elite LinkedIn copywriting engine built exclusively for health and wellness professionals — naturopaths, dietitians, nutritionists, wellness coaches, functional medicine practitioners, therapists, and holistic health experts.

YOUR CORE MISSION:
Transform health expertise into LinkedIn posts that attract qualified clients — without sounding salesy, without dumbing down the science, and without losing the practitioner's authentic voice.

YOU OPERATE IN TWO MODES:

══ MODE 1: GENERATE (from scratch) ══
The user gives you keywords, a topic, or a rough idea.
You generate a complete, ready-to-publish LinkedIn post.

══ MODE 2: ANALYZE & REWRITE (existing post) ══
The user gives you an existing post.
You score it, identify 3 critical errors, and rewrite it.

══ LANGUAGE RULE ══
Detect the language from the user's input (keywords or post).
If French → respond entirely in French.
If English → respond entirely in English.
Never mix languages in the output post.

══ SCORING CRITERIA (25 pts each = 100 total) ══
[1] HOOK (25pts): Do the first 2 lines stop the scroll? No "I am a..." opener. Must use: a surprising stat, a counterintuitive truth, a concrete situation, or a provocative question.
[2] SCANNABILITY (25pts): 1 line = 1 idea. Zero text blocks. Readable diagonally in 5 seconds. White space is strategic.
[3] SCIENTIFIC CREDIBILITY (25pts): Does it demonstrate real expertise without jargon overload? Mechanism explained simply, concrete example, nuanced claim (no absolutes like "always cures", "perfect solution").
[4] TRUST SIGNAL (25pts): Does the reader think "this person understands my problem"? Does the closing question invite qualified comments?

══ MANDATORY POST STRUCTURE ══
Line 1-2: Hook — stat / counterintuitive truth / concrete situation (NO "I am", NO "Today I want to talk about")
[blank line]
Line 3-4: Why this matters NOW (1-2 lines max)
[blank line]
Body: 3 to 5 points — one blank line between each — use "→" for rhythm when relevant
[blank line]
Key insight: 1 punchy line that synthesizes everything
[blank line]
Closing question: open-ended, invites the RIGHT person to comment (not just anyone)

══ ABSOLUTE CONSTRAINTS ══
- 180 to 230 words maximum
- Zero hashtags in the body text
- Zero links
- Zero direct pitch ("book a call", "DM me", "my program")
- Zero absolutes: "always", "never", "perfect", "miracle", "cure"
- Zero self-congratulation at the end ("thank you for following me")
- Scientific nuance is mandatory: dosage, context, individual variation
- The post must make the reader feel understood, not lectured

══ RESPONSE FORMAT ══
CRITICAL: Return ONLY valid JSON. Zero text before or after. Zero backticks. Zero markdown.

For MODE 1 (generation):
{
  "mode": "generate",
  "language": "fr" or "en",
  "scoreGenerated": <integer 75-95>,
  "post": "<complete ready-to-publish post with \\n for line breaks>",
  "hook_type": "<type of hook used: stat / question / situation / counterintuitive>",
  "best_time": "<best time to post ex: 7h-9h>",
  "best_day": "<best day ex: Tuesday or Wednesday>"
}

For MODE 2 (analyze + rewrite):
{
  "mode": "analyze",
  "language": "fr" or "en",
  "scoreInitial": <integer 0-100>,
  "scoreOptimized": <integer always scoreInitial + minimum 15, max 97>,
  "diagnostic": "<2 lines max — main problem with the post>",
  "errors": "1. <concrete error in 1 sentence>\\n2. <concrete error in 1 sentence>\\n3. <concrete error in 1 sentence>",
  "fixes": "Hook: <actionable fix>\\nStructure: <actionable fix>\\nTrust signal: <actionable fix>",
  "improved": "<complete rewritten post, ready to publish, with \\n for line breaks>"
}`;

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
    return res.status(500).json({ error: 'Clé API Gemini non configurée.' });
  }

  const profileBlock = profile
    ? `\nAUTHOR CONTEXT:\n- Profession: ${profile.profession || 'health professional'}\n- Specialty: ${profile.specialty || 'not specified'}\n- Ideal client: ${profile.client || 'not specified'}\n- Main offer: ${profile.offer || 'not specified'}`
    : '';

  let userMessage = '';

  if (mode === 'generate') {
    userMessage = `MODE: GENERATE FROM SCRATCH

The user wants a complete LinkedIn post based on these keywords/idea:
"${input.trim()}"

Objective: ${objective || 'attract qualified prospects'}${profileBlock}

Generate a complete, ready-to-publish LinkedIn post following all constraints.
Detect the language from the input and respond in that language.
Return ONLY valid JSON as specified.`;

  } else if (mode === 'analyze') {
    userMessage = `MODE: ANALYZE AND REWRITE

Existing LinkedIn post to analyze and rewrite:
---
${input.trim()}
---

Objective: ${objective || 'attract qualified prospects'}${profileBlock}

Score the post on 4 criteria, identify 3 critical errors, provide 3 direct fixes, and rewrite the post.
Detect the language from the post and respond in that language.
Return ONLY valid JSON as specified.`;
  } else {
    return res.status(400).json({ error: 'Mode invalide. Utilise "generate" ou "analyze".' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
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
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', err);
      return res.status(502).json({ error: 'Erreur API Gemini. Vérifie ta clé.' });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('Gemini empty response:', JSON.stringify(data));
      return res.status(502).json({ error: 'Réponse vide de Gemini.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('JSON parse error:', e, '\nRaw:', rawText);
      return res.status(502).json({ error: 'Réponse Gemini invalide. Réessaie.' });
    }

    // Validation & auto-correction
    if (parsed.mode === 'analyze') {
      parsed.scoreInitial = Math.max(0, Math.min(100, parseInt(parsed.scoreInitial) || 45));
      parsed.scoreOptimized = Math.max(0, Math.min(97, parseInt(parsed.scoreOptimized) || 75));
      if (parsed.scoreOptimized <= parsed.scoreInitial) {
        parsed.scoreOptimized = Math.min(parsed.scoreInitial + 18, 97);
      }
      const required = ['scoreInitial', 'scoreOptimized', 'diagnostic', 'errors', 'fixes', 'improved'];
      for (const f of required) {
        if (!(f in parsed)) return res.status(502).json({ error: `Champ manquant: ${f}` });
      }
    }

    if (parsed.mode === 'generate') {
      parsed.scoreGenerated = Math.max(75, Math.min(95, parseInt(parsed.scoreGenerated) || 82));
      if (!parsed.post) return res.status(502).json({ error: 'Post généré vide.' });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur interne. Réessaie.' });
  }
};
