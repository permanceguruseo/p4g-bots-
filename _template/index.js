// ─────────────────────────────────────────────────────────────
// index.js — the bot's heartbeat. Polls the dashboard for its
// task type, runs the flow, reports back. This TEMPLATE version
// has a generic flow; each real bot replaces runFlow() with its
// own signup → fill → submit → verify steps.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');
const api = require('./apiClient');
const browser = require('./browser');
const { smartFill } = require('./smartFill');
const SITES = require('./sites');

// ── the part each bot overrides ────────────────────────────────
// Return: { ok, liveUrl, screenshot, note } or throws to fail.
async function runFlow(page, client, site) {
  await page.goto(site.signupUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await browser.humanDelay();

  const report = await smartFill(page, client, {
    title: `${client.name} — ${client.category || 'Business'}`,
    description: client.description || '',
  });
  await api.log(`Filled ${report.filled.length} fields on ${site.name}`);

  const shot = await browser.screenshot(page, `${cfg.BOT_TYPE}-${site.name}`);
  // TEMPLATE stops before final submit so a human confirms.
  // Real bots continue: click submit, wait, capture the live URL.
  return { ok: true, liveUrl: '', screenshot: shot, note: 'template dry-run (no submit)' };
}

// ── the universal lifecycle (same for every bot) ───────────────
async function processTask(task) {
  await api.claimTask(task.id);
  await api.heartbeat('running', task.id);

  const client = await api.getClient(task.clientId);
  const site = SITES.find(s => s.name === task.site) || SITES[0];
  if (!client || !site) { await api.failTask(task.id, 'missing client or site'); return; }

  // daily cap guard
  const today = await api.submissionsTodayForSite(site.name);
  if (today >= cfg.DAILY_CAP_PER_SITE) {
    await api.failTask(task.id, `daily cap reached for ${site.name}`);
    return;
  }

  const b = await browser.launch();
  try {
    const page = await browser.newPage(b);
    const res = await runFlow(page, client, site);
    const shotUrl = res.screenshot ? await api.uploadScreenshot(res.screenshot, { site: site.name }) : '';

    await api.saveSubmission({
      clientId: client.id, site: site.name,
      profileUrl: res.liveUrl || '', submissionUrl: site.signupUrl,
      screenshotPath: shotUrl, status: res.liveUrl ? 'Completed' : 'Completed',
      doFollow: site.doFollow !== false, notes: res.note || '',
    });
    await api.completeTask(task.id, res.note || 'done');
    await api.log(`✓ ${site.name} done for ${client.name}`);
  } catch (err) {
    // hit a wall → screenshot + alert, park the task
    let shot = '';
    try { const page = (await b.pages())[0]; shot = await browser.screenshot(page, `${cfg.BOT_TYPE}-fail`); } catch {}
    const shotUrl = shot ? await api.uploadScreenshot(shot, { site: site.name }) : '';
    await api.raiseAlert({ site: site.name, reason: err.message.slice(0, 140), screenshot: shotUrl, action: 'human_review' });
    await api.failTask(task.id, err.message.slice(0, 140));
    await api.log(`✗ ${site.name} failed: ${err.message}`, 'error');
  } finally {
    await b.close().catch(() => {});
  }
}

async function loop() {
  await api.heartbeat('idle');
  try {
    const tasks = await api.getMyTasks();
    if (tasks.length) {
      await api.log(`picked up ${tasks.length} task(s)`);
      for (const t of tasks) { await processTask(t); await browser.sleep(3000); }
    }
  } catch (e) { console.error('[loop]', e.message); }
  setTimeout(loop, cfg.POLL_INTERVAL);
}

console.log(`🤖 ${cfg.BOT_TYPE} bot online → ${cfg.API_BASE_URL}`);
loop();

module.exports = { runFlow, processTask }; // exported so real bots can reuse the lifecycle
