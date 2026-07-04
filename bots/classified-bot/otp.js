// ─────────────────────────────────────────────────────────────
// otp.js — fetches an email OTP code from an IMAP inbox.
// Only used by bots whose sites have requiresEmailOTP:true.
// If IMAP creds aren't set, returns null → caller raises a human alert.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Waits for a fresh email containing a numeric OTP, extracts and returns it.
// `fromHint` narrows the search (e.g. 'tradeindia'); optional.
async function fetchOTP({ fromHint = '', waitMs = 90000 } = {}) {
  if (!cfg.IMAP_USER || !cfg.IMAP_PASS || !cfg.IMAP_HOST) return null;

  let imaps;
  try { imaps = require('imap-simple'); }
  catch { console.warn('[otp] imap-simple not installed — skipping OTP'); return null; }

  const config = {
    imap: {
      user: cfg.IMAP_USER, password: cfg.IMAP_PASS,
      host: cfg.IMAP_HOST, port: cfg.IMAP_PORT, tls: true,
      authTimeout: 10000, tlsOptions: { rejectUnauthorized: false },
    },
  };

  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    try {
      const conn = await imaps.connect(config);
      await conn.openBox('INBOX');
      const since = new Date(Date.now() - 10 * 60 * 1000); // last 10 min
      const criteria = ['UNSEEN', ['SINCE', since]];
      const messages = await conn.search(criteria, { bodies: ['HEADER', 'TEXT'], markSeen: true });

      for (const m of messages.reverse()) {
        const textPart = m.parts.find(p => p.which === 'TEXT');
        const headerPart = m.parts.find(p => p.which === 'HEADER');
        const from = (headerPart?.body?.from || []).join(' ').toLowerCase();
        if (fromHint && !from.includes(fromHint.toLowerCase())) continue;

        const body = textPart?.body || '';
        const match = body.match(/\b(\d{4,8})\b/); // 4–8 digit code
        if (match) { conn.end(); return match[1]; }
      }
      conn.end();
    } catch (e) { console.warn('[otp] imap error:', e.message); }
    await sleep(5000);
  }
  return null;
}

module.exports = { fetchOTP };
