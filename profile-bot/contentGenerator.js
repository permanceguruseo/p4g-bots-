// ─────────────────────────────────────────────────────────────
// contentGenerator.js — versatile writer via the Anthropic API.
// One function, many kinds. Each content bot calls it with its kind.
//   kinds: microblog | web2 | guestpost | pressrelease | bio
// Returns { title, body, bio } (fields vary by kind; body is main text).
// ─────────────────────────────────────────────────────────────
const axios = require('axios');
const cfg = require('./config');

const SPECS = {
  microblog: { words: '90-140', shape: 'a punchy micro-blog post (like a Tumblr/Plurk update)', wantTitle: false },
  web2:      { words: '450-600', shape: 'a friendly Web 2.0 blog post', wantTitle: true },
  guestpost: { words: '650-850', shape: 'an editorial-quality guest article', wantTitle: true },
  pressrelease: { words: '400-500', shape: 'a formal press release (dateline, quote, boilerplate)', wantTitle: true },
  bio:       { words: '40-60', shape: 'a short author/profile bio', wantTitle: false },
};

async function generate(kind, client) {
  if (!cfg.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set — cannot generate content');
  const spec = SPECS[kind] || SPECS.web2;
  const kw = client.keywords || client.category || client.name;

  const prompt =
`Write ${spec.shape}, ${spec.words} words, for this business.

Business: ${client.name}
Website: ${client.website}
Industry: ${client.category || 'general'}
Keywords: ${kw}
About: ${client.description || 'n/a'}

Rules:
- Reader-first and genuine, NOT a hard sell.
- Natural human tone, short paragraphs.
- No links inside the body. The link goes only in the bio field.
${kind === 'pressrelease' ? '- Include a dateline, one short quote, and a 2-line boilerplate at the end.' : ''}

Return STRICT JSON only, no markdown:
{${spec.wantTitle ? '"title":"...",' : '"title":"",'} "body":"text with \\n\\n between paragraphs", "bio":"1-2 sentence bio mentioning ${client.name} with ${client.website} as a plain URL"}`;

  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    { model: 'claude-sonnet-4-6', max_tokens: 1600, messages: [{ role: 'user', content: prompt }] },
    { headers: { 'x-api-key': cfg.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 60000 }
  );

  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  try {
    const p = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (!p.body) throw new Error('incomplete');
    return p;
  } catch { throw new Error('content generation returned unparseable output'); }
}

module.exports = { generate };
