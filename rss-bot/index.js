// ─────────────────────────────────────────────────────────────
// RSS Bot — submits a client's RSS feed URL to feed aggregators /
// directories. Simplest flow: open submit page, drop the feed URL
// (+ site URL / email if asked), clear CAPTCHA, submit.
// Standalone; coordinates only through the dashboard.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');
const api = require('./apiClient');
const browser = require('./browser');
const { smartFill } = require('./smartFill');
const captcha = require('./captcha');
const SITES = require('./sites');

// best-guess feed URL for a client
function feedUrl(client){
  if (client.rssUrl) return client.rssUrl;
  const w = (client.website || '').replace(/\/+$/,'');
  return w ? w + '/feed' : '';
}

async function handleCaptcha(page, site){
  const key = await page.evaluate(()=>{const e=document.querySelector('.g-recaptcha,[data-sitekey]');return e?e.getAttribute('data-sitekey'):null;});
  if(!key) return;
  const token = await captcha.solveRecaptchaV2(key, page.url());
  if(!token) throw new Error(`CAPTCHA on ${site.name} unsolved`);
  await captcha.applyToken(page, token);
}

async function runFlow(page, client, site){
  const feed = feedUrl(client);
  if(!feed) throw new Error('no feed URL for client (set client.rssUrl or website)');

  await page.goto(site.submitUrl || site.signupUrl, { waitUntil:'networkidle2', timeout:45000 });
  await browser.humanDelay();

  // put the feed URL in the most likely field
  const feedSel = 'input[name*="feed"],input[name*="rss"],input[name*="url"],input[id*="feed"],input[id*="url"],input[type="url"]';
  if(await page.$(feedSel)){ await browser.humanType(page, feedSel, feed); }
  else { throw new Error('no feed/url field found on page'); }

  // fill anything else it wants (email, site name) heuristically
  await smartFill(page, client, {});
  await handleCaptcha(page, site);
  await browser.humanDelay();

  const shot = await browser.screenshot(page, `rss-${site.name}`);
  // submit button (best-effort; per-site tuned at test time)
  const btn = await page.$('button[type=submit],input[type=submit],button');
  if(btn){ await btn.click().catch(()=>{}); await browser.sleep(2500); }

  return { ok:true, liveUrl: feed, screenshot: shot, note:`feed submitted to ${site.name}` };
}

async function processTask(task){
  await api.claimTask(task.id); await api.heartbeat('running', task.id);
  const client = await api.getClient(task.clientId);
  const site = SITES.find(s=>s.name===task.site) || SITES[0];
  if(!client || !site){ await api.failTask(task.id,'missing client or site'); return; }
  const today = await api.submissionsTodayForSite(site.name);
  if(today >= cfg.DAILY_CAP_PER_SITE){ await api.failTask(task.id,`daily cap ${site.name}`); return; }

  const b = await browser.launch();
  try{
    const page = await browser.newPage(b);
    const res = await runFlow(page, client, site);
    const shotUrl = res.screenshot ? await api.uploadScreenshot(res.screenshot,{site:site.name}) : '';
    await api.saveSubmission({ clientId:client.id, site:site.name, profileUrl:res.liveUrl||'',
      submissionUrl:site.submitUrl||site.signupUrl, screenshotPath:shotUrl, doFollow:!!site.doFollow,
      status:'Completed', notes:res.note });
    await api.completeTask(task.id, res.note);
    await api.log(`✓ ${site.name} feed submitted for ${client.name}`);
  }catch(err){
    let shot=''; try{const p=(await b.pages())[0]; shot=await browser.screenshot(p,'rss-fail');}catch{}
    const shotUrl = shot ? await api.uploadScreenshot(shot,{site:site.name}) : '';
    await api.raiseAlert({ site:site.name, reason:err.message.slice(0,140), screenshot:shotUrl, action:'human_review' });
    await api.failTask(task.id, err.message.slice(0,140));
    await api.log(`✗ ${site.name}: ${err.message}`,'error');
  }finally{ await b.close().catch(()=>{}); }
}

async function loop(){
  await api.heartbeat('idle');
  try{ const tasks = await api.getMyTasks();
    if(tasks.length){ await api.log(`picked up ${tasks.length} rss task(s)`);
      for(const t of tasks){ await processTask(t); await browser.sleep(3000); } }
  }catch(e){ console.error('[loop]', e.message); }
  setTimeout(loop, cfg.POLL_INTERVAL);
}
console.log(`📡 RSS Bot online → ${cfg.API_BASE_URL}`); loop();
