// ─────────────────────────────────────────────────────────────
// captcha.js — solves reCAPTCHA v2 via 2Captcha when a site needs it.
// Only used by bots whose sites have requiresCaptcha:true.
// If no key is set, returns null and the caller raises a human alert.
// ─────────────────────────────────────────────────────────────
const axios = require('axios');
const cfg = require('./config');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Solve a reCAPTCHA v2 given the site key + page URL.
// Returns the g-recaptcha-response token, or null on failure.
async function solveRecaptchaV2(siteKey, pageUrl) {
  if (!cfg.TWOCAPTCHA_API_KEY) return null;

  // 1. submit the captcha
  const submit = await axios.get('https://2captcha.com/in.php', {
    params: {
      key: cfg.TWOCAPTCHA_API_KEY, method: 'userrecaptcha',
      googlekey: siteKey, pageurl: pageUrl, json: 1,
    },
  });
  if (submit.data.status !== 1) return null;
  const id = submit.data.request;

  // 2. poll for the answer (up to ~2 min)
  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const res = await axios.get('https://2captcha.com/res.php', {
      params: { key: cfg.TWOCAPTCHA_API_KEY, action: 'get', id, json: 1 },
    });
    if (res.data.status === 1) return res.data.request;
    if (res.data.request !== 'CAPCHA_NOT_READY') return null;
  }
  return null;
}

// Inject the solved token into the page and continue.
async function applyToken(page, token) {
  await page.evaluate(t => {
    let el = document.getElementById('g-recaptcha-response');
    if (!el) {
      el = document.createElement('textarea');
      el.id = 'g-recaptcha-response';
      el.name = 'g-recaptcha-response';
      el.style = 'display:none';
      document.body.appendChild(el);
    }
    el.value = t;
  }, token);
}

module.exports = { solveRecaptchaV2, applyToken };
