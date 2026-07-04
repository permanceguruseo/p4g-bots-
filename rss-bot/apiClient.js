// ─────────────────────────────────────────────────────────────
// apiClient.js — the ONLY way a bot talks to the outside world.
// Bots never talk to each other; they coordinate ONLY through the
// dashboard, via these HTTP calls. Each bot has its own copy.
// ─────────────────────────────────────────────────────────────
const axios = require('axios');
const fs = require('fs');
const cfg = require('./config');

const http = axios.create({
  baseURL: cfg.API_BASE_URL,
  timeout: 30000,
  headers: cfg.API_KEY ? { 'x-api-key': cfg.API_KEY } : {},
});

// ── READ: get work + the data needed to do it ──────────────────

// Find pending tasks for THIS bot type only.
async function getMyTasks() {
  const { data } = await http.get('/api/tasks');
  return (data || []).filter(
    t => t.botType === cfg.BOT_TYPE && t.status === 'Pending'
  );
}

// Full client record (bizname, email, phone, website, keywords, socials…).
async function getClient(clientId) {
  const { data } = await http.get(`/api/clients/${clientId}`);
  return data;
}

// How many submissions this site already got today (for the daily cap).
async function submissionsTodayForSite(site) {
  try {
    const { data } = await http.get('/api/submissions/today');
    return (data || []).filter(s => s.site === site && s.botType === cfg.BOT_TYPE).length;
  } catch { return 0; }
}

// ── WRITE: report everything back to the dashboard ─────────────

async function claimTask(id) {
  return http.put(`/api/tasks/${id}`, { status: 'Running', startedAt: new Date().toISOString() });
}
async function completeTask(id, notes = '') {
  return http.put(`/api/tasks/${id}`, { status: 'Completed', completedAt: new Date().toISOString(), notes });
}
async function failTask(id, notes = '') {
  return http.put(`/api/tasks/${id}`, { status: 'Failed', completedAt: new Date().toISOString(), notes });
}

// Record a finished backlink.
async function saveSubmission(sub) {
  return http.post('/api/submissions', { botType: cfg.BOT_TYPE, ...sub });
}

// Raise a "human help needed" alert (CAPTCHA/OTP/unknown wall).
async function raiseAlert(alert) {
  return http.post('/api/alerts/create', { botType: cfg.BOT_TYPE, ...alert });
}

// Push a screenshot file to the dashboard; returns the stored path/url.
async function uploadScreenshot(filePath, meta = {}) {
  try {
    const b64 = fs.readFileSync(filePath).toString('base64');
    const { data } = await http.post('/api/screenshot', {
      botType: cfg.BOT_TYPE, image: b64, filename: filePath.split('/').pop(), ...meta,
    });
    return data?.path || data?.url || '';
  } catch { return ''; }
}

// Central log line (also shows in dashboard log view).
async function log(message, level = 'info') {
  try { await http.post('/api/log', { botType: cfg.BOT_TYPE, level, message }); } catch {}
  console.log(`[${cfg.BOT_TYPE}] ${message}`);
}

// Heartbeat so the dashboard shows this bot as alive.
async function heartbeat(status = 'running', currentJob = null) {
  try { await http.post('/api/bot/status', { botType: cfg.BOT_TYPE, status, currentJob }); } catch {}
}

module.exports = {
  getMyTasks, getClient, submissionsTodayForSite,
  claimTask, completeTask, failTask,
  saveSubmission, raiseAlert, uploadScreenshot, log, heartbeat,
};
