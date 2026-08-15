# DADsync — Deployment & Firebase Setup Guide

This folder is the complete, self-contained **static site** for
https://www.dadsync.in (GitHub Pages). Every audit issue found in
the comprehensive error-fix pass is fixed in this version (v14).

---

## 0. Changelog

- **v11** — Removed placeholder GSC token from all pages; added `news` route to `404.html` SPA fallback; cleaned Firebase placeholder comments in `app.js`.
- **v12/v14** — Added a defensive responsive safeguard to `assets/styles.css`:
  `img, svg, iframe, video, canvas { max-width: 100%; height: auto; }`,
  `table { max-width: 100%; }` and `overflow-x: auto` on `.region-table`, `pre`, `code`, `.conn-flow`
  so the Regional Connectivity Diagram, images and the OSM map can never overflow their containers on any screen size.
  No HTML markup was changed — a full audit confirmed all 13 pages render correctly at 1280px and 375px.

---

## 1. What's in this folder

| File | Purpose |
|---|---|
| `index.html`, `about.html`, `services.html`, `hub.html`, `connection.html`, `industries.html`, `careers.html`, `investors.html`, `contact.html`, `privacy.html`, `terms.html`, `news.html`, `404.html` | All 13 pages (SEO meta, OG tags, canonical, JSON-LD included) |
| `404.html` | **GitHub Pages SPA fallback** — maps `/about`, `/services`, `/investors`, `/news`, etc. to their `.html` files so deep links never 404 on refresh/direct load/share |
| `robots.txt`, `sitemap.xml` | SEO crawl directives (sitemap lists all 13 URLs) |
| `assets/styles.css` | Design system (light/dark) |
| `assets/app.js` | Dark mode, mobile menu, scroll reveal (content visible by default), FAQ, **contact form → Firebase Firestore** |
| `assets/firebase-config.js` | ✅ **Live Firebase config already filled in** (project `dadsync2026-7e20f`) — no action needed |
| `assets/favicon.svg`, `assets/icons.svg` | Brand assets |
| `assets/downloads/*.pdf` | Hub Proposal / Brochure / Executive Summary (real files, not dead links) |
| `images/*.jpg` | Site imagery |

---

## 2. ✅ Firebase — already configured (contact form backend)

The contact form on `contact.html` writes every submission to the
**Firestore collection `contacts`** of the live project
`dadsync2026-7e20f`. The real keys are already in
`assets/firebase-config.js` and the site auto-detects them
(`DADSYNC_FIREBASE_READY` is `true`).

**If you ever need to point the form at a different project:**

### Step 1 — Create / open your Firebase project
1. Go to https://console.firebase.google.com → **Add project**
   (or open an existing one).
2. **Project settings** (gear icon) → **General** → **Your apps** →
   click the **`</>` (Web)** icon → register an app (name: `dadsync-web`).
3. Copy the `firebaseConfig` object it shows.

### Step 2 — Paste the keys
Open **`assets/firebase-config.js`** and replace the values:

```js
window.DADSYNC_FIREBASE = {
  apiKey: "AIza...your-real-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

The site auto-detects real keys and switches the form to Firestore
mode automatically. **No other code changes needed.**

### Step 3 — Create Firestore database
1. Left sidebar → **Build** → **Firestore Database** → **Create
   database** → **Start in production mode** (or test mode while
   developing) → choose a region (e.g. `asia-south1`).
2. **Rules** tab → replace with the rules below → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can ADD a contact message; only signed-in admins can read/list.
    match /contacts/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

3. **Indexes**: none needed — `contacts.add()` uses auto-generated
   document IDs.

### Step 4 — Test
Open `contact.html`, fill the form, submit. You should see
**"Message Sent!"** and a new document (with `created_at`,
`first_name`, `last_name`, `email`, `interest`, `message`) appear in
Firestore → **contacts**.

> 💡 The Firebase SDKs (v9 compat, `10.12.2`) are loaded only on
> `contact.html` from Google's CDN — no build step, no npm install.
> If the SDK fails to load (offline CDN), the form falls back to
> opening the visitor's email app with a pre-filled message and a
> clear notice — it never fakes success.

---

## 3. Google Search Console verification

The previous placeholder token (`REPLACE_WITH_GSC_TOKEN`) was
**removed** from all pages — a fake token would fail Google's
verification check. To verify the site:

1. Add your site to https://search.google.com/search-console
2. Choose the **HTML tag** method → copy the token (e.g. `abc123...`)
3. Add this line to **every page's `<head>`** (or use the DNS
   method instead):
```html
<meta name="google-site-verification" content="YOUR_REAL_TOKEN" />
```
4. Re-deploy, then click **Verify** in Search Console.

---

## 4. ⚠️ Live-site diagnosis (2026-08-08) — the site is serving STUB files

Checked `main` (HEAD `fc19acb0`, pushed 2026-08-08T03:50Z) and
`https://www.dadsync.in` directly. Even though recent commit messages
claim "REAL assets", the actual files on `main` are **placeholder
stubs**, so the live site is currently **unstyled and non-functional**:

| File on `main` (live) | Content | Expected (this folder) |
|---|---|---|
| `assets/styles.css` | **`TODO_CSS`** (8 B) | 39,102 B real design system |
| `assets/app.js` | **`TODO_APPJS`** (10 B) | 9,592 B real JS (dark mode, menu, form) |
| `index.html` | 25,770 B (older build) | 32,319 B v14 homepage |
| `connection.html` | 29,664 B (older build) | 32,716 B v14 page |
| `news.html` | 17,911 B (older build) | 19,595 B v14 page |
| `404.html` | 8 B placeholder | 2,877 B SPA fallback |
| `assets/firebase-config.js` | ✅ real (ok) | same — live config |
| `CNAME` | ✅ `www.dadsync.in` | same |
| `.github/workflows/main.yml` | ✅ fixed workflow | same |

The workflow (`actions/deploy-pages@v4` + `environment: github-pages`)
is correct and present, so **the only thing missing is the real
content**. Pushing this folder's files over the stubs will auto-deploy
the correct site in ~1 minute — no Pages settings changes needed.

---

## 5. Deploy the REAL build (one-time fix)

```bash
# From this folder (dadsync-ghpages-deploy-v14):

# 1. Clone (or use your existing clone of harekrishna7/dad2026)
git clone https://github.com/harekrishna7/dad2026.git
cd 11dad

# 2. Replace ALL site files with the real v14 build
#    (copy the entire contents of this folder into the repo root,
#     overwriting the stubs; keep .github/, CNAME, remove old files)
rsync -a --delete \
  ../dadsync-ghpages-deploy-v14/ ./   # or copy/paste manually
rm -f .push_batches                    # scratch, not needed

# 3. Commit + push (triggers the Pages workflow)
git add -A
git commit -m "DADsync v14: deploy REAL production build (fixes TODO_CSS/TODO_APPJS stubs on main)"
git push origin main

# 4. Verify (see checklist §6)
```

**Alternative if you can't use git locally:** provide a GitHub PAT
(repo scope) or use GitHub's web UI → upload files, replacing the
stubbed `assets/styles.css`, `assets/app.js`, `index.html`,
`connection.html`, `news.html`, `404.html` etc. with the real files
from this package.

---

## 6. Verification checklist after deploy

- [ ] `https://www.dadsync.in/` loads **styled** (dark-mode design system, not unstyled text)
- [ ] `curl -s https://www.dadsync.in/assets/styles.css` returns ~39 KB (NOT `TODO_CSS`)
- [ ] `curl -s https://www.dadsync.in/assets/app.js` returns ~9.6 KB (NOT `TODO_APPJS`)
- [ ] Title: **"DADsync — Powering Northeast India's AI Future"** on `/`
- [ ] `/connection.html` (32,716 B) and `/news.html` (19,595 B) serve the NEW v14 versions
- [ ] All pages load (no 404) thanks to real `404.html` fallback
- [ ] Hub "Downloads" PDFs actually download
- [ ] Contact form writes to Firestore `contacts` (live config already in place)
- [ ] No `TODO_` or `REPLACE_WITH_*` placeholder anywhere in served HTML/CSS/JS
- [ ] `https://harekrishna7.github.io/11dad/` matches the custom domain content

---

## 7. Anything not done?

- **GSC token** — removed by design (placeholder would fail verification).
  Add your real token per §3 when you have it.
- **Social profile URLs** — point at intended handles; verify each
  profile exists / is public.
- **The push itself** — this sandbox has no GitHub credentials
  (no gh CLI, no token, no SSH), so the actual push must be done by
  you (exact commands in §5) or with a PAT you provide.