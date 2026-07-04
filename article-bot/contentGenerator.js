// ─────────────────────────────────────────────────────────────
// contentGenerator.js — writes the article via the Anthropic API.
// Returns { title, body, bio } — body is the article, bio holds
// the author bio with the client's backlink.
// ─────────────────────────────────────────────────────────────
const axios = require('axios');
const cfg = require('./config');

async function generateArticle(client) {
  if (!cfg.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set — cannot generate article');
  }

  const keywords = client.keywords || client.category || client.name;
  const prompt =
`Write a genuinely useful, original 600-750 word article for an article-submission site.

Business: ${client.name}
Website: ${client.website}
Industry: ${client.category || 'general'}
Topic keywords: ${keywords}
About: ${client.description || 'n/a'}

Rules:
- Informative and reader-first, NOT an ad. No hard selling.
- Natural, human tone. Short paragraphs, 2-3 subheadings.
- Do NOT insert links in the body.
- End with nothing promotional — the link goes only in the author bio.

Return STRICT JSON, no markdown, no preamble:
{"title":"...", "body":"full article text with \\n\\n between paragraphs", "bio":"2-sentence author bio mentioning ${client.name} with the website ${client.website} as a plain URL"}`;

  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 1600,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': cfg.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = text.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(clean);
    if (!parsed.title || !parsed.body) throw new Error('incomplete');
    return parsed;
  } catch {
    throw new Error('content generation returned unparseable output');
  }
}

module.exports = { generateArticle };
