// ─────────────────────────────────────────────────────────────
// Article Bot — generates an article via Anthropic, signs up on an
// article platform, publishes it with the client's link in the bio,
// captures the live URL, and reports back to the dashboard.
// Fully standalone; coordinates ONLY through the dashboard API.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');
const api = require('./apiClient');
const browser = require('./browser');
const { smartFill } = require('./smartFill');
const { generateArticle } = require('./contentGenerator');
const captcha = require('./captcha');
const { fetchOTP } = require('./otp');
const SITES = require('./sites');

// try to read a solved captcha; if we can't, throw → alert + park
async function handleCaptchaIfPresent(page, site) {
  const siteKey = await page.evaluate(() => {
    const el = document.querySelector('.g-recaptcha,[data-sitekey]');
    return el ? el.getAttribute('data-sitekey') : null;
  });
  if (!siteKey) return;
  const token = await captcha.solveRecaptchaV2(siteKey, page.url());
  if (!token) throw new Error(`CAPTCHA on ${site.name} could not be solved`);
  await captcha.applyToken(page, token);
}

// the Article-specific flow
async function runFlow(page, client, site) {
  // 1. write the article first (fail fast if content gen is down)
  const article = await generateArticle(client);
  await api.log(`✍️ generated "${article.title.slice(0,50)}…" for ${client.name}`);

  // 2. open signup
  await page.goto(site.signupUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await browser.humanDelay();

  // 3. fill signup form heuristically (name/email/etc.)
  await smartFill(page, client, {});
  await handleCaptchaIfPresent(page, site);
  await browser.humanDelay();

  // 4. email OTP wall?
  if (site.requiresEmailOTP) {
    const code = await fetchOTP({ fromHint: site.name.toLowerCase() });
    if (!code) throw new Error(`Email OTP for ${site.name} not received`);
    const otpSel = 'input[name*="otp"],input[name*="code"],input[id*="otp"],input[id*="code"]';
    if (await page.$(otpSel)) { await browser.humanType(page, otpSel, code); }
  }

  // 5. go to the article editor and place the content
  if (site.submitUrl) {
    await page.goto(site.submitUrl, { waitUntil: 'networkidle2', timeout: 45000 }).catch(()=>{});
    await browser.humanDelay();
  }
  const titleSel = 'input[name*="title"],input[id*="title"],input[placeholder*="itle"]';
  const bodySel  = 'textarea,[contenteditable="true"],[role="textbox"]';
  if (await page.$(titleSel)) await browser.humanType(page, titleSel, article.title);
  if (await page.$(bodySel)) {
    await page.click(bodySel).catch(()=>{});
    await page.keyboard.type(article.body + '\n\n' + article.bio, { delay: 8 });
  }

  const shot = await browser.screenshot(page, `article-${site.name}`);

  // 6. platforms with editorial review: submit and mark pending; else this is
  //    the point a human confirms publish (safe default until per-site tuned).
  return {
    ok: true,
    liveUrl: '',                              // filled once per-site publish selector is tuned
    screenshot: shot,
    review: !!site.requiresReview,
    note: site.requiresReview ? 'submitted — awaiting site review' : 'article placed — ready to publish',
  };
}

// ── universal lifecycle ────────────────────────────────────────
async function processTask(task) {
  await api.claimTask(task.id);
  await api.heartbeat('running', task.id);

  const client = await api.getClient(task.clientId);
  const site = SITES.find(s => s.name === task.site) || SITES[0];
  if (!client || !site) { await api.failTask(task.id, 'missing client or site'); return; }

  const today = await api.submissionsTodayForSite(site.name);
  if (today >= cfg.DAILY_CAP_PER_SITE) { await api.failTask(task.id, `daily cap for ${site.name}`); return; }

  const b = await browser.launch();
  try {
    const page = await browser.newPage(b);
    const res = await runFlow(page, client, site);
    const shotUrl = res.screenshot ? await api.uploadScreenshot(res.screenshot, { site: site.name }) : '';

    await api.saveSubmission({
      clientId: client.id, site: site.name,
      profileUrl: res.liveUrl || '', submissionUrl: site.submitUrl || site.signupUrl,
      screenshotPath: shotUrl, doFollow: !!site.doFollow,
      status: res.liveUrl ? 'Verified Live' : (res.review ? 'Pending Review' : 'Completed'),
      notes: res.note,
    });
    await api.completeTask(task.id, res.note);
    await api.log(`✓ ${site.name} article done for ${client.name}`);
  } catch (err) {
    let shot = '';
    try { const p = (await b.pages())[0]; shot = await browser.screenshot(p, 'article-fail'); } catch {}
    const shotUrl = shot ? await api.uploadScreenshot(shot, { site: site.name }) : '';
    await api.raiseAlert({ site: site.name, reason: err.message.slice(0,140), screenshot: shotUrl, action: 'human_review' });
    await api.failTask(task.id, err.message.slice(0,140));
    await api.log(`✗ ${site.name}: ${err.message}`, 'error');
  } finally {
    await b.close().catch(()=>{});
  }
}

async function loop() {
  await api.heartbeat('idle');
  try {
    const tasks = await api.getMyTasks();
    if (tasks.length) {
      await api.log(`picked up ${tasks.length} article task(s)`);
      for (const t of tasks) { await processTask(t); await browser.sleep(4000); }
    }
  } catch (e) { console.error('[loop]', e.message); }
  setTimeout(loop, cfg.POLL_INTERVAL);
}

console.log(`📝 Article Bot (Radha) online → ${cfg.API_BASE_URL}`);
loop();
