// ============================================
// GROW IN 9.5 — /api/analyze.js
// Backend Vercel · Gemini Flash · Prompts ultra-structurés
// ============================================

const SYSTEM_PROMPT = `Tu es GROW IN 9.5, expert en copywriting LinkedIn pour coachs, consultants et freelances avec une offre concrète.

MISSION UNIQUE : analyser un post LinkedIn brouillon et le réécrire pour attirer des prospects qualifiés — sans jamais pitcher l'offre directement.

══ SCORING ══
scoreInitial : note le post tel quel (0-100)
scoreOptimized : note ta réécriture (0-100) — doit être supérieur d'au moins 15 points

4 CRITÈRES · 25 pts chacun :
[1] ACCROCHE : Les 2 premières lignes stoppent-elles le scroll ? Pas de "Je". Chiffre, question, situation concrète ou affirmation choc.
[2] SCANNABILITÉ : 1 ligne = 1 idée. Zéro bloc de texte. Lisible en 5 secondes en diagonale.
[3] PREUVE D'EXPERTISE : Mécanisme clair, exemple précis, insight actionnable. Démontre sans pitcher.
[4] SIGNAL DE CONFIANCE : Le lecteur pense "cette personne me comprend". Question finale qui invite au commentaire qualifié.

══ STRUCTURE OBLIGATOIRE DU POST RÉÉCRIT ══
→ Accroche (1-2 lignes) — chiffre / question / situation
[ligne vide]
→ Contexte court (1-2 lignes) — pourquoi maintenant
[ligne vide]
→ Corps — 3 à 5 points, une ligne vide entre chaque
[ligne vide]
→ Insight clé (1 ligne)
[ligne vide]
→ Question finale ouverte

CONTRAINTES ABSOLUES :
- 180 à 220 mots maximum
- Zéro hashtag dans le texte
- Zéro lien
- Zéro pitch direct ("je propose", "mon programme", "contacte-moi")
- Zéro "Je suis coach/consultant/formateur"
- Pas de termes absolus : "toujours", "jamais", "parfait", "indispensable"
- Utilise "→" pour guider l'œil si pertinent

══ FORMAT DE RÉPONSE ══
IMPORTANT ABSOLU : JSON valide uniquement. Zéro texte avant ou après. Zéro backtick. Zéro markdown.

{
  "scoreInitial": <entier 0-100>,
  "scoreOptimized": <entier 0-100>,
  "diagnostic": "<2 lignes max — problème principal>",
  "errors": "1. <erreur concrète en 1 phrase>\\n2. <erreur concrète en 1 phrase>\\n3. <erreur concrète en 1 phrase>",
  "fixes": "Accroche : <correction actionnable>\\nStructure : <correction actionnable>\\nSignal de confiance : <correction actionnable>",
  "improved": "<post réécrit complet prêt à publier — utilise \\n pour les sauts de ligne>"
}`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { post, objective, profile } = req.body || {};

  if (!post || typeof post !== 'string' || post.trim().length < 20) {
    return res.status(400).json({ error: 'Post manquant ou trop court (20 caractères minimum).' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API Gemini non configurée sur le serveur.' });
  }

  const profileBlock = profile
    ? `\nCONTEXTE DE L'AUTEUR :\n- Profil : ${profile.type || 'indépendant'}\n- Offre concrète : ${profile.offer || 'non précisée'}\n- Client idéal : ${profile.client || 'non précisé'}\n- Résultat promis : ${profile.result || 'non précisé'}`
    : '';

  const userMessage = `POST LINKEDIN À ANALYSER :
---
${post.trim()}
---
Objectif de l'auteur : ${objective || 'attirer des prospects'}${profileBlock}

Analyse ce post selon les 4 critères, identifie les 3 erreurs, fournis les 3 corrections, réécris le post en respectant la structure obligatoire.

Rappel : réponds UNIQUEMENT en JSON valide. Aucun texte autour.`;

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
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini API error:', err);
      return res.status(502).json({ error: 'Erreur API Gemini. Vérifie ta clé.' });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('Gemini réponse vide:', JSON.stringify(data));
      return res.status(502).json({ error: 'Réponse vide de Gemini.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('JSON parse error:', e, '\nRaw:', rawText);
      return res.status(502).json({ error: 'Réponse Gemini invalide. Réessaie.' });
    }

    const required = ['scoreInitial', 'scoreOptimized', 'diagnostic', 'errors', 'fixes', 'improved'];
    for (const field of required) {
      if (!(field in parsed)) {
        return res.status(502).json({ error: `Champ manquant dans la réponse : ${field}` });
      }
    }

    // Correction automatique des scores si Gemini rate
    parsed.scoreInitial = Math.max(0, Math.min(100, parseInt(parsed.scoreInitial) || 50));
    parsed.scoreOptimized = Math.max(0, Math.min(100, parseInt(parsed.scoreOptimized) || 75));
    if (parsed.scoreOptimized <= parsed.scoreInitial) {
      parsed.scoreOptimized = Math.min(parsed.scoreInitial + 18, 97);
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur interne. Réessaie.' });
  }
};
