// ─────────────────────────────────────────────────────────────
// launcher.js — runs every bot from ONE place, but each in its OWN
// isolated OS process. If one bot crashes, only that one restarts;
// the others keep running untouched. This is the "one repo, folders
// independent" model — no bot shares memory with another.
//
//   node launcher.js            → run all bots
//   node launcher.js article rss → run only these
// ─────────────────────────────────────────────────────────────
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

const BOTS_DIR = path.join(__dirname, 'bots');
const only = process.argv.slice(2); // optional filter

const folders = fs.readdirSync(BOTS_DIR)
  .filter(f => fs.existsSync(path.join(BOTS_DIR, f, 'index.js')))
  .filter(f => only.length === 0 || only.some(o => f.includes(o)));

if (!folders.length) { console.log('No bots to run.'); process.exit(0); }

console.log(`🚀 Launching ${folders.length} bot(s): ${folders.join(', ')}\n`);

function start(folder) {
  const entry = path.join(BOTS_DIR, folder, 'index.js');
  const child = fork(entry, [], { cwd: path.join(BOTS_DIR, folder), stdio: 'inherit' });

  child.on('exit', (code) => {
    console.log(`⚠️  ${folder} exited (code ${code}) — restarting in 10s`);
    setTimeout(() => start(folder), 10000); // auto-restart, isolated
  });
}

folders.forEach(start);
