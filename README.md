# P4G SEO Bot Fleet 🦚

11 independent backlink bots + a launcher. Each bot lives in its own folder,
runs in its own process, and talks **only** to your dashboard — never to each
other. One bot crashing never affects the rest.

```
p4g-bots/
├── _template/          copy this to make a new bot (not run directly)
├── bots/
│   ├── article-bot/    ✅ fully built (Radha) — generates + submits articles
│   ├── directory-bot/  ▢ scaffolded — ready to fill site flow
│   ├── rss-bot/        ▢ scaffolded
│   ├── microblog-bot/  ▢ scaffolded
│   ├── web2-bot/       ▢ scaffolded
│   ├── guestpost-bot/  ▢ scaffolded
│   ├── pptpdf-bot/     ▢ scaffolded
│   ├── image-bot/      ▢ scaffolded
│   ├── classified-bot/ ▢ scaffolded
│   ├── pressrelease-bot/▢ scaffolded
│   └── profile-bot/    ▢ scaffolded
├── launcher.js         runs all bots, each in its own process
├── render.yaml         one-click Render deploy
└── package.json
```

**"Scaffolded"** = the whole skeleton is there and it runs; it just needs that
bot's `sites.js` (verified targets) and its `runFlow()` submit steps tuned to
those sites. The Article Bot is the worked example every other bot copies.

---

## How a bot works (all the same)

1. Polls the dashboard: *"any pending task of my type?"*
2. Loads the client's details + its own target-site list.
3. Opens a stealth browser, signs up, fills the form, submits.
4. Hits a CAPTCHA → 2Captcha. Hits an email OTP → reads it over IMAP.
   Hits something it can't do → screenshots it, raises an alert, moves on.
5. Saves the backlink (live URL + screenshot) back to the dashboard.

The dashboard is the single source of truth. Bots share nothing else.

---

## Deploy in 3 steps (nothing technical)

### 1. Put this folder on GitHub
Create a repo (e.g. `p4g-bots`) and upload this folder. If you use the
GitHub website: *Add file → Upload files → drag the folder → Commit*.

### 2. One-click deploy on Render
- Render → **New → Blueprint** → pick your `p4g-bots` repo → **Apply**.
- `render.yaml` sets everything up as a Background Worker automatically.

### 3. Paste your keys (once)
In the new service → **Environment**, fill the blanks:

| Key | What it's for | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Article/blog writing | console.anthropic.com |
| `TWOCAPTCHA_API_KEY`| Solving CAPTCHAs | 2captcha.com |
| `IMAP_HOST/USER/PASS` | Reading email OTPs | your inbox (e.g. Gmail app password) |
| `API_KEY` | Talking to your dashboard | match your dashboard's key |

Save → Render redeploys → the fleet is live. Add the same env vars to your
dashboard for auth, and you're done.

> **Tip:** use the **Starter ($7/mo)** plan for the worker so it never sleeps.
> The free tier pauses after 15 min of inactivity.

---

## Run locally (optional, to watch it work)

```bash
npm install
cd bots/article-bot && cp .env.example .env   # paste your keys into .env
cd ../.. && node launcher.js article           # run just the Article Bot
# or: node launcher.js                          # run the whole fleet
```

Set `HEADLESS=false` in `.env` to watch the browser do its thing.

---

## Adding the next bot

1. `cp -r _template bots/<name>-bot`
2. Set `BOT_TYPE` in its `.env`.
3. Fill `sites.js` with that bot's verified targets.
4. Tune `runFlow()` for those sites (Article Bot is the reference).
5. It auto-joins the fleet on next launch. No other bot changes.
