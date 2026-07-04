// ─────────────────────────────────────────────────────────────
// Guest Post Bot — targets "write for us" / open-contribution pages.
// Generates a full guest article + a short pitch, then either fills
// the contribution form or (if it's an email-only page) parks an
// alert with the drafted pitch for a human to send. Semi-auto by
// nature — guest posting usually needs a human handshake. Standalone.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');
const api = require('./apiClient');
const browser = require('./browser');
const { smartFill } = require('./smartFill');
const { generate } = require('./contentGenerator');
const captcha = require('./captcha');
const SITES = require('./sites');

async function handleCaptcha(page, site){
  const key = await page.evaluate(()=>{const e=document.querySelector('.g-recaptcha,[data-sitekey]');return e?e.getAttribute('data-sitekey'):null;});
  if(!key) return;
  const token = await captcha.solveRecaptchaV2(key, page.url());
  if(!token) throw new Error(`CAPTCHA on ${site.name} unsolved`);
  await captcha.applyToken(page, token);
}

async function runFlow(page, client, site){
  const post = await generate('guestpost', client);
  await api.log(`drafted guest article for ${client.name}`);

  await page.goto(site.submitUrl || site.signupUrl, { waitUntil:'networkidle2', timeout:45000 });
  await browser.humanDelay();

  // is there an actual contribution form on this page?
  const hasForm = await page.$('form textarea, form input[type=email]');
  if(!hasForm){
    // email-only "write for us" page → hand the drafted pitch to a human
    const shot = await browser.screenshot(page, `guestpost-${site.name}`);
    const shotUrl = shot ? await api.uploadScreenshot(shot,{site:site.name}) : '';
    await api.raiseAlert({ site:site.name,
      reason:`Guest pitch ready to send. Title: ${post.title}`,
      screenshot:shotUrl, action:'send_outreach' });
    return { ok:true, liveUrl:'', screenshot:shot, review:true, note:`pitch drafted — needs manual send to ${site.name}` };
  }

  // form exists → fill contributor details + pitch
  await smartFill(page, client, { title: post.title, description: post.body.slice(0,900) });
  await handleCaptcha(page, site);
  const shot = await browser.screenshot(page, `guestpost-${site.name}`);
  const btn = await page.$('button[type=submit],input[type=submit]');
  if(btn){ await btn.click().catch(()=>{}); await browser.sleep(2500); }
  return { ok:true, liveUrl:'', screenshot:shot, review:true, note:`guest pitch submitted to ${site.name}` };
}

// ── universal lifecycle (identical across the fleet) ───────────
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
      status: res.liveUrl ? 'Verified Live' : (res.review ? 'Pending Review' : 'Completed'), notes:res.note });
    await api.completeTask(task.id, res.note);
    await api.log(`✓ ${site.name} done for ${client.name}`);
  }catch(err){
    let shot=''; try{const p=(await b.pages())[0]; shot=await browser.screenshot(p,`${cfg.BOT_TYPE}-fail`);}catch{}
    const shotUrl = shot ? await api.uploadScreenshot(shot,{site:site.name}) : '';
    await api.raiseAlert({ site:site.name, reason:err.message.slice(0,140), screenshot:shotUrl, action:'human_review' });
    await api.failTask(task.id, err.message.slice(0,140));
    await api.log(`✗ ${site.name}: ${err.message}`,'error');
  }finally{ await b.close().catch(()=>{}); }
}

async function loop(){
  await api.heartbeat('idle');
  try{ const tasks = await api.getMyTasks();
    if(tasks.length){ await api.log(`picked up ${tasks.length} guestpost task(s)`);
      for(const t of tasks){ await processTask(t); await browser.sleep(3500); } }
  }catch(e){ console.error('[loop]', e.message); }
  setTimeout(loop, cfg.POLL_INTERVAL);
}
console.log(`✍️ Guest Post Bot online → ${cfg.API_BASE_URL}`); loop();
