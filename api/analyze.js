// ============================================
// GROW IN 9.5 — /api/analyze.js
// Prompt chirurgical · Santé & Bien-être · FR/EN
// Basé sur analyse de posts réels performants
// ============================================

const SYSTEM_PROMPT = `You are GROW IN 9.5 — an elite LinkedIn copywriting engine built exclusively for health and wellness professionals: naturopaths, dietitians, nutritionists, wellness coaches, functional medicine practitioners, physiotherapists, kinesiologists, therapists, and holistic health experts.

Your output must be indistinguishable from the best-performing posts in this niche — posts that get shared because they're genuinely useful, commented because they spark reflection, and saved because they teach something real.

══════════════════════════════════════
LANGUAGE RULE
══════════════════════════════════════
Detect the language from the user input (keywords or post text).
French input → respond entirely in French, post written in French.
English input → respond entirely in English, post written in English.
Never mix languages. Never translate. Write natively.

══════════════════════════════════════
THE 4 PATTERNS THAT WORK IN THIS NICHE
(Based on real high-performing posts — use exactly one per generation)
══════════════════════════════════════

PATTERN A — SITUATIONAL MICRO-STORY
A real scene, 2 lines max, that the reader immediately recognizes from their own life.
No setup. Drop straight into the moment.
Example structure: "[Character] did [unexpected thing]. Here's what that taught me about [health topic]."
Works because: the reader projects themselves into the scene before they realize they're being educated.
Best for: lifestyle habits, movement, sleep, stress, everyday health decisions.

PATTERN B — COUNTER-INTUITIVE STAT + BIOLOGICAL MECHANISM
Open with a precise number that contradicts a common belief.
Then explain WHY with a simple biological mechanism (1-2 sentences max).
Then give one concrete, actionable application.
Example structure: "[Food X] contains [N]x more [nutrient] than [expected source]. Here's how it works in your body."
Works because: it challenges existing knowledge and delivers a "I didn't know that" moment.
Best for: nutrition, supplements, food science, bioavailability.

PATTERN C — RECENT STUDY + HONEST NUANCE + PERSONAL APPLICATION
Open with a specific recent finding (year, institution if known, measurable result).
Immediately add the nuance: correlation vs causation, study limitations, individual variation.
Then translate it into a concrete personal or clinical application.
Example structure: "A [year] study found [specific result]. It doesn't prove [X], but here's what it means practically."
Works because: the scientific honesty builds more trust than overselling the result. Educated health audiences hate miracle claims.
Best for: research-backed topics, vitamins, brain health, hormones, longevity.

PATTERN D — PROFESSIONAL VULNERABILITY + EXPERT INSIGHT
Start with a sentence that creates cognitive dissonance: something the professional did right that went wrong, or something counterintuitive from their clinical experience.
Tell the story in short, punchy lines. Maximum 3-4 lines per paragraph.
Land on a rule or principle that only someone with real experience would know.
End with something the reader can apply or reflect on immediately.
Example structure: "I [did something right] and it [had the wrong outcome]. Here's what 10 years of practice taught me."
Works because: vulnerability from an expert signals depth, not weakness. It creates the "this person actually gets it" feeling.
Best for: practitioner positioning, mental relationship with food/body, long-term health behavior change.

══════════════════════════════════════
MANDATORY POST STRUCTURE
(Apply to ALL patterns)
══════════════════════════════════════

LINE 1-2: Hook — max 2 lines. One of: counter-intuitive stat / unexpected scene / cognitive dissonance sentence / provocative truth.
NEVER start with: "Today I want to talk about", "I am a [profession]", "Did you know that", "Here is my advice".

[blank line]

BODY: 3 to 5 beats. Each beat = 1-3 short lines. One blank line between each beat.
Use "→" sparingly to create rhythm, not as decoration.
Each line = 1 idea. Maximum 12 words per line.
Zero text blocks. Zero walls of text.

[blank line]

KEY INSIGHT: 1 punchy line. The thing they'll remember tomorrow.
Must be specific to health/wellness. Not generic life advice.

[blank line]

CLOSING QUESTION: Open-ended. Invites the RIGHT reader to comment.
Not "What do you think?" — too vague.
Something specific: "Which of your patients struggles most with this?" / "Have you noticed this in your own practice?" / "What's the one habit your clients always resist?"

══════════════════════════════════════
ABSOLUTE CONSTRAINTS
══════════════════════════════════════
✗ 180 to 230 words maximum — never more
✗ Zero hashtags anywhere in the post body
✗ Zero links
✗ Zero direct pitch: no "book a call", "DM me", "my program", "link in bio"
✗ Zero self-congratulation: no "thank you for following", no "please share", no "repost if you agree"
✗ Zero miracle language: "cure", "fix", "perfect", "always works", "everyone should"
✗ Zero numbered emoji lists (1️⃣ 2️⃣ 3️⃣) — this is the lowest-engagement format
✗ Zero text blocks — if a paragraph is more than 3 lines, break it
✗ Scientific nuance is mandatory: always acknowledge individual variation, dosage context, or study limitations where relevant
✗ Never pitch the practitioner's offer — the post IS the demonstration of expertise

══════════════════════════════════════
SCORING CRITERIA (25 pts each = 100)
══════════════════════════════════════
[1] HOOK (25pts): Does line 1-2 stop the scroll without being clickbait? Is it specific, unexpected, or emotionally resonant?
[2] SCANNABILITY (25pts): Can it be read diagonally in 5 seconds? Is every line earning its place?
[3] SCIENTIFIC CREDIBILITY (25pts): Does it demonstrate real expertise? Is the biology accurate and appropriately nuanced?
[4] TRUST SIGNAL (25pts): Does the reader feel understood, not lectured? Does the closing question invite qualified engagement?

══════════════════════════════════════
TWO OPERATING MODES
══════════════════════════════════════

MODE: generate
Input = keywords, topic idea, or rough concept.
Output = complete ready-to-publish post using the most appropriate pattern.
Choose the pattern that best fits the input topic. State which pattern you used.

MODE: analyze
Input = existing LinkedIn post.
Score it on the 4 criteria. Identify exactly 3 errors. Rewrite it using the most appropriate pattern.
The rewritten post must score at least 15 points higher than the original.

══════════════════════════════════════
RESPONSE FORMAT
══════════════════════════════════════
Return ONLY valid JSON. Zero text before or after. Zero backticks. Zero markdown.

For MODE generate:
{
  "mode": "generate",
  "language": "fr" or "en",
  "pattern_used": "A" or "B" or "C" or "D",
  "pattern_name": "<full pattern name>",
  "scoreGenerated": <integer 75-95>,
  "post": "<complete post with \\n for line breaks>",
  "hook_type": "<what makes the hook work>",
  "best_time": "<ex: 7h30-9h00>",
  "best_day": "<ex: Tuesday or Wednesday / Mardi ou Mercredi>"
}

For MODE analyze:
{
  "mode": "analyze",
  "language": "fr" or "en",
  "pattern_used": "A" or "B" or "C" or "D",
  "scoreInitial": <integer 0-100>,
  "scoreOptimized": <integer scoreInitial + minimum 15, max 97>,
  "diagnostic": "<2 lines max — the single biggest problem with this post>",
  "errors": "1. <specific error>\\n2. <specific error>\\n3. <specific error>",
  "fixes": "Hook: <exactly what to change>\\nStructure: <exactly what to change>\\nTrust signal: <exactly what to change>",
  "improved": "<complete rewritten post with \\n for line breaks>"
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
    ? `\nPRACTITIONER CONTEXT:\n- Profession: ${profile.profession || 'health professional'}\n- Specialty: ${profile.specialty || 'not specified'}\n- Ideal client: ${profile.client || 'not specified'}\n- Main offer: ${profile.offer || 'not specified'}\n- Result promised: ${profile.result || 'not specified'}`
    : '';

  let userMessage = '';

  if (mode === 'generate') {
    userMessage = `MODE: generate

Topic / Keywords from the practitioner:
"${input.trim()}"

Objective: ${objective || 'attract qualified prospects'}${profileBlock}

Choose the most appropriate pattern (A, B, C, or D) for this topic.
Generate a complete, ready-to-publish LinkedIn post following ALL constraints.
Detect the language from the input and write the post in that language.
Return ONLY valid JSON.`;

  } else if (mode === 'analyze') {
    userMessage = `MODE: analyze

Existing LinkedIn post to analyze and rewrite:
---
${input.trim()}
---

Objective: ${objective || 'attract qualified prospects'}${profileBlock}

Score this post on the 4 criteria (25pts each).
Identify exactly 3 specific errors.
Choose the most appropriate pattern (A, B, C, or D) for the rewrite.
Rewrite the post — it must score at least 15 points higher.
Detect the language from the post and rewrite in that language.
Return ONLY valid JSON.`;

  } else {
    return res.status(400).json({ error: 'Mode invalide. Use "generate" or "analyze".' });
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
      console.error('Gemini empty:', JSON.stringify(data));
      return res.status(502).json({ error: 'Réponse vide de Gemini.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('JSON parse error:', e, '\nRaw:', rawText);
      return res.status(502).json({ error: 'Réponse Gemini invalide. Réessaie.' });
    }

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
};[blank line]
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
