// ─────────────────────────────────────────────────────────────
// Image Bot — uploads a client image to image-sharing sites
// (Flickr / Imgur / Pinterest style) with the client's link in the
// caption/description. Reuses the shared file-upload handler.
// Needs client.imagePath (or a list in client.images). Standalone.
// ─────────────────────────────────────────────────────────────
const cfg = require('./config');
const api = require('./apiClient');
const browser = require('./browser');
const { smartFill } = require('./smartFill');
const { uploadFile } = require('./fileUpload');
const captcha = require('./captcha');
const { fetchOTP } = require('./otp');
const SITES = require('./sites');

async function handleCaptcha(page, site){
  const key = await page.evaluate(()=>{const e=document.querySelector('.g-recaptcha,[data-sitekey]');return e?e.getAttribute('data-sitekey'):null;});
  if(!key) return;
  const token = await captcha.solveRecaptchaV2(key, page.url());
  if(!token) throw new Error(`CAPTCHA on ${site.name} unsolved`);
  await captcha.applyToken(page, token);
}

async function runFlow(page, client, site){
  const image = client.imagePath || (Array.isArray(client.images) && client.images[0]);
  if(!image) throw new Error('no client image supplied (set client.imagePath)');

  await page.goto(site.signupUrl, { waitUntil:'networkidle2', timeout:45000 });
  await browser.humanDelay();
  await smartFill(page, client, {});
  await handleCaptcha(page, site);
  if(site.requiresEmailOTP){
    const code = await fetchOTP({ fromHint: site.name.toLowerCase() });
    if(!code) throw new Error(`OTP for ${site.name} not received`);
    const sel='input[name*="otp"],input[name*="code"],input[id*="otp"]';
    if(await page.$(sel)) await browser.humanType(page, sel, code);
  }

  if(site.submitUrl){ await page.goto(site.submitUrl,{waitUntil:'networkidle2',timeout:45000}).catch(()=>{}); await browser.humanDelay(); }
  await uploadFile(page, image, { triggerSelector: site.uploadTrigger, dropSelector: site.dropZone });
  await browser.sleep(4000);

  // caption / description with the link
  const capSel='textarea,input[name*="caption"],input[name*="desc"],input[name*="title"]';
  if(await page.$(capSel)){ await page.click(capSel).catch(()=>{}); await page.keyboard.type(`${client.name} — ${client.category||''} ${client.website}`,{delay:8}); }

  const shot = await browser.screenshot(page, `image-${site.name}`);
  const btn = await page.$('button[type=submit],button[aria-label*="ost"],button[aria-label*="pload"],input[type=submit]');
  if(btn){ await btn.click().catch(()=>{}); await browser.sleep(2500); }

  return { ok:true, liveUrl:'', screenshot:shot, note:`image uploaded to ${site.name}` };
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
    if(tasks.length){ await api.log(`picked up ${tasks.length} image task(s)`);
      for(const t of tasks){ await processTask(t); await browser.sleep(3500); } }
  }catch(e){ console.error('[loop]', e.message); }
  setTimeout(loop, cfg.POLL_INTERVAL);
}
console.log(`🖼️ Image Bot online → ${cfg.API_BASE_URL}`); loop();
