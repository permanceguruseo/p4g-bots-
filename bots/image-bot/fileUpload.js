// ─────────────────────────────────────────────────────────────
// fileUpload.js — puts a local file into a page's upload control.
// Handles the two common cases: a real <input type=file> (direct)
// and a drag-drop zone that hides an <input> behind a button.
// Shared by the PPT/PDF bot and the Image bot.
// ─────────────────────────────────────────────────────────────
const fs = require('fs');

// Try to attach `filePath` to whatever file input the page exposes.
async function uploadFile(page, filePath, opts = {}) {
  if (!fs.existsSync(filePath)) throw new Error(`file not found: ${filePath}`);

  // 1. direct file input
  let input = await page.$('input[type=file]');

  // 2. some sites reveal the input only after clicking an "upload" button
  if (!input && opts.triggerSelector) {
    await page.click(opts.triggerSelector).catch(() => {});
    await page.waitForSelector('input[type=file]', { timeout: 8000 }).catch(() => {});
    input = await page.$('input[type=file]');
  }

  // 3. drag-drop zones that use the native chooser
  if (!input) {
    const [chooser] = await Promise.all([
      page.waitForFileChooser({ timeout: 8000 }).catch(() => null),
      opts.dropSelector ? page.click(opts.dropSelector).catch(() => {}) : Promise.resolve(),
    ]);
    if (chooser) { await chooser.accept([filePath]); return true; }
  }

  if (!input) throw new Error('no file upload control found on page');
  await input.uploadFile(filePath);
  return true;
}

module.exports = { uploadFile };
