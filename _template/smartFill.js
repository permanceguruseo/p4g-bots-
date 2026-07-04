// ─────────────────────────────────────────────────────────────
// smartFill.js — heuristic form filler. Looks at every input on a
// page, guesses what it wants from its name/id/placeholder/label,
// and fills it from the client record. Each bot has its own copy.
// ─────────────────────────────────────────────────────────────

// map of client fields → keywords that identify a matching input
const FIELD_HINTS = {
  name:        ['name','fullname','yourname','contactname','firstname','fname'],
  bizname:     ['company','business','organisation','organization','bizname','brand'],
  email:       ['email','e-mail','mail'],
  phone:       ['phone','mobile','tel','contact','number'],
  website:     ['website','url','weburl','site','link','homepage'],
  address:     ['address','street','addr','location'],
  city:        ['city','town'],
  state:       ['state','province','region'],
  zip:         ['zip','postal','pincode','pin'],
  category:    ['category','industry','sector','type'],
  description: ['description','about','desc','message','details','bio','summary','comment'],
  title:       ['title','headline','subject'],
};

// Build the value a given input should get, from the client + extras.
function valueFor(field, client, extras = {}) {
  const map = {
    name:        client.name || client.bizname,
    bizname:     client.bizname || client.name,
    email:       client.email,
    phone:       client.phone,
    website:     client.website,
    address:     client.address,
    city:        client.city,
    state:       client.state,
    zip:         client.zip,
    category:    client.category,
    description: extras.description || client.description,
    title:       extras.title || '',
  };
  return map[field] || '';
}

// Fill everything we can. Returns a report of what got filled / skipped.
async function smartFill(page, client, extras = {}) {
  const filled = [], skipped = [];
  const inputs = await page.$$('input, textarea, select');

  for (const el of inputs) {
    const meta = await page.evaluate(node => {
      const label = node.labels && node.labels[0] ? node.labels[0].innerText : '';
      return {
        tag: node.tagName.toLowerCase(),
        type: (node.type || '').toLowerCase(),
        hint: [node.name, node.id, node.placeholder, label].join(' ').toLowerCase(),
        visible: !!(node.offsetParent),
      };
    }, el);

    if (!meta.visible) continue;
    if (['hidden', 'submit', 'button', 'password', 'file'].includes(meta.type)) continue;

    // find which field this input matches
    let field = null;
    for (const [f, hints] of Object.entries(FIELD_HINTS)) {
      if (hints.some(h => meta.hint.includes(h))) { field = f; break; }
    }
    if (!field) { skipped.push(meta.hint.slice(0, 30)); continue; }

    const val = valueFor(field, client, extras);
    if (!val) { skipped.push(field); continue; }

    try {
      if (meta.tag === 'select') {
        await el.select(String(val)).catch(() => {});
      } else {
        await el.click({ clickCount: 3 }).catch(() => {});
        await el.type(String(val), { delay: 40 });
      }
      filled.push(field);
    } catch { skipped.push(field); }
  }
  return { filled, skipped };
}

module.exports = { smartFill };
