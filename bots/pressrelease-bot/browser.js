// ─────────────────────────────────────────────────────────────
// browser.js — launches a stealth Chrome, gives helpers every bot
// needs: new page, human-like typing/delays, screenshot capture.
// Each bot has its OWN copy (bots never share a browser).
// ─────────────────────────────────────────────────────────────
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

puppeteer.use(StealthPlugin());

const SHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Random human-ish pause between actions.
function humanDelay() {
  const ms = Math.floor(Math.random() * (cfg.MAX_DELAY - cfg.MIN_DELAY)) + cfg.MIN_DELAY;
  return sleep(ms);
}

async function launch() {
  return puppeteer.launch({
    headless: cfg.HEADLESS ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1366,768',
    ],
    defaultViewport: { width: 1366, height: 768 },
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );
  return page;
}

// Type like a human — char by char with small random gaps.
async function humanType(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 20000 });
  await page.click(selector);
  for (const ch of String(text)) {
    await page.keyboard.type(ch);
    await sleep(40 + Math.random() * 90);
  }
}

// Full-page screenshot → returns local file path (uploaded to dashboard by caller).
async function screenshot(page, label) {
  const file = path.join(SHOT_DIR, `${label}-${Date.now()}.png`);
  try { await page.screenshot({ path: file, fullPage: true }); }
  catch { await page.screenshot({ path: file }); } // fallback if fullPage fails
  return file;
}

module.exports = { launch, newPage, humanType, screenshot, humanDelay, sleep };
