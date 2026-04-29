// ============================================
// POSTDECODER — Backend Serverless (Vercel)
// /api/analyze.js
// ============================================

const SYSTEM_PROMPT = `Tu es "The Hook Clinic", un expert mondial en copywriting LinkedIn spécialisé dans la santé métabolique et la nutrition de précision. Ton but est de transformer des brouillons en posts viraux, hautement crédibles et orientés conversion.

LES 4 PILIERS DE L'ANALYSE (Score sur 100)
1. Hook (25 pts) : Court, universel, sans jargon, crée un gap de curiosité immédiat.
2. Scannabilité (25 pts) : Lecture "diagonale" fluide, formatage ultra-aéré.
3. Actionnabilité (25 pts) : Valeur concrète, mécanisme biologique clair.
4. Signal de Conversation (25 pts) : CTA qui engage ou convertit vers le Food Index.

STRUCTURE OBLIGATOIRE DU POST
1. Hook : 1 à 3 lignes max, impactant, sans exagération.
2. Mise en contexte : Pourquoi ce sujet est une priorité maintenant.
3. 2-3 Mécanismes Biologiques : Expliqués simplement (ex: précurseurs, inflammation, enzymes).
4. Limite / Nuance d'expert : Préciser le contexte, la qualité ou le dosage (pas de solution miracle).
5. Conclusion : Synthèse rapide et positionnement du Food Index comme filtre de décision.
6. Question engageante : Alignée sur l'objectif pour générer du commentaire qualifié.

RÈGLES DE FORMATAGE (STRICT)
- 1 phrase = 1 idée.
- Maximum 12 mots par ligne.
- Sauts de ligne fréquents (zéro bloc de texte).
- Utiliser "→" pour créer du rythme et guider l'œil.
- Zéro lien externe dans le corps du texte.
- Zéro tag massif (maximum 2 personnes si pertinent).

ÉTHIQUE ET TON
- Ton Expert-Scientifique : Vulgarise mais reste précis.
- Nuance systématique : Pas de termes absolus ("parfait", "indispensable", "miracle").
- Crédibilité > Marketing : La précision biologique prime sur l'effet d'annonce.

IMPORTANT : Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte autour. Structure exacte requise :
{
  "scoreInitial": <nombre entre 0 et 100>,
  "scoreOptimized": <nombre entre 0 et 100>,
  "diagnostic": "<2 lignes max sur le problème principal>",
  "errors": "<3 erreurs numérotées 1. 2. 3. expliquées clairement, séparées par des sauts de ligne>",
  "fixes": "<corrections concrètes sur le Hook, la Structure et le CTA, bien lisibles>",
  "improved": "<réécriture complète du post, prête à publier, respectant toutes les règles de formatage>"
}`;

module.exports = async (req, res) => {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { post, objective } = req.body || {};

  if (!post || typeof post !== 'string' || post.trim().length < 10) {
    return res.status(400).json({ error: 'Post manquant ou trop court.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API Gemini non configurée sur le serveur.' });
  }

  const userMessage = `Voici le post LinkedIn à analyser :

---
${post.trim()}
---

Objectif de l'auteur : ${objective || 'visibilité'}

Applique ton analyse complète et renvoie le JSON structuré.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', errBody);
      return res.status(502).json({ error: 'Erreur de l\'API Gemini. Vérifie ta clé API.' });
    }

    const geminiData = await geminiRes.json();

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error('Gemini response empty:', JSON.stringify(geminiData));
      return res.status(502).json({ error: 'Réponse vide de Gemini.' });
    }

    // Parse JSON safely
    let parsed;
    try {
      // Strip potential markdown fences if present
      const clean = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, '\nRaw:', rawText);
      return res.status(502).json({ error: 'La réponse de Gemini n\'est pas du JSON valide. Réessaie.' });
    }

    // Validate required fields
    const required = ['scoreInitial', 'scoreOptimized', 'diagnostic', 'errors', 'fixes', 'improved'];
    for (const field of required) {
      if (!(field in parsed)) {
        return res.status(502).json({ error: `Champ manquant dans la réponse : ${field}` });
      }
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur. Réessaie.' });
  }
}
