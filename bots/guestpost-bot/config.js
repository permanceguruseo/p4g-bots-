// ─────────────────────────────────────────────────────────────
// config.js — reads all environment variables in one place.
// Every bot gets its OWN copy of this file (bots are independent).
// ─────────────────────────────────────────────────────────────
require('dotenv').config();

module.exports = {
  // Dashboard this bot coordinates with (the single shared surface)
  API_BASE_URL: process.env.API_BASE_URL || 'https://p4g-seo-platform.onrender.com',

  // Sent on every request once the dashboard has API-key auth turned on.
  // Leave blank until then — requests still work.
  API_KEY: process.env.API_KEY || '',

  // Which task type THIS bot claims from the queue. Set per bot.
  BOT_TYPE: process.env.BOT_TYPE || 'guestpost',

  // How often (ms) to poll the dashboard for new work.
  POLL_INTERVAL: parseInt(process.env.POLL_INTERVAL || '15000', 10),

  // Run the browser visibly (false) or headless (true). Headless in prod.
  HEADLESS: process.env.HEADLESS !== 'false',

  // 2Captcha — only needed by bots hitting CAPTCHA sites.
  TWOCAPTCHA_API_KEY: process.env.TWOCAPTCHA_API_KEY || '',

  // Anthropic — only needed by bots that generate content (article, blog, PR).
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // IMAP inbox for email-OTP sites (optional).
  IMAP_HOST: process.env.IMAP_HOST || '',
  IMAP_PORT: parseInt(process.env.IMAP_PORT || '993', 10),
  IMAP_USER: process.env.IMAP_USER || '',
  IMAP_PASS: process.env.IMAP_PASS || '',

  // Safety: max submissions per site per day (anti-flag pacing).
  DAILY_CAP_PER_SITE: parseInt(process.env.DAILY_CAP_PER_SITE || '3', 10),

  // Random delay window between actions (ms) so behaviour looks human.
  MIN_DELAY: parseInt(process.env.MIN_DELAY || '2000', 10),
  MAX_DELAY: parseInt(process.env.MAX_DELAY || '6000', 10),
};
