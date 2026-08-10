# DADsync Admin Dashboard v2

A self-contained, standalone **admin dashboard** for the DADSync website (www.dadsync.in).
**v2 reads submissions live from Firebase Realtime Database** (`contact_messages` +
`job_applications` nodes written by the dadsync_v7 website), with a graceful fallback
to the built-in localStorage demo store when Firebase is not configured or empty.

Built as a hash-routed single-page app (no build step, no server): `index.html` +
`styles.css` + plain-vanilla JS modules under `js/`. Branding matches the DADSync
navy/cyan design system used across the website and the DADSync CRM.

---

## What changed in v2 (vs the original dadsync-admin)

| Area | Change |
|---|---|
| **Firebase SDK** | `index.html` loads Firebase v10.12.2 **compat** SDK via CDN (`firebase-app-compat.js` + `firebase-database-compat.js`) — the same SDK version the dadsync_v7 website uses. |
| **Config** | Clearly-marked placeholder `FIREBASE_CONFIG` constants (`apiKey`, `databaseURL`, `projectId`, …) at the top of `index.html`. **No real secrets are hardcoded.** `FIREBASE_ENABLED` flips on only when the placeholders are replaced with real values. |
| **Live reads** | `js/data.js` attaches **realtime listeners**: `db.ref('contact_messages').on('value', …)` and `db.ref('job_applications').on('value', …)`. New website submissions appear in the dashboard automatically (no refresh needed). |
| **Graceful fallback** | If Firebase is unconfigured (`FIREBASE_ENABLED=false` / placeholders) **or** the database node is empty, the dashboard falls back to the existing seeded localStorage demo data — it still works fully standalone. When Firebase is configured and has records, Firebase wins and the dashboard mirrors the database. |
| **Write-back** | While live, status changes (mark read/archive/reviewed/hired/rejected), deletes and "Add sample" entries are written back to the matching Firebase node (`contact_messages` / `job_applications`), so the database stays the source of truth. |
| **Data source indicator** | A chip in the topbar (and a status banner in Settings) shows **"Firebase · Live"** (green, pulsing dot) when connected, **"Firebase configured · no data yet"** or **"Demo data · localStorage"** (amber) otherwise. |
| **Settings → Firebase panel** | New "Firebase — live data source" panel: paste your config (API key, Database URL, Project ID required) directly in the UI. Saved to localStorage key `dadsync_admin_config_v2`, which **overrides** the constants in `index.html`. A "Remove config" button drops back to demo mode. |
| **All existing features kept** | Login screen (email/password + demo-mode fallback), Dashboard KPI cards (total messages, total applications, new this week, unread), Contact Messages view (search/filter, detail modal, mark read/archive/delete), Job Applications view (role + status filters, status dropdown, detail modal, delete), Settings (Formspree endpoints, recipient email, demo-data reset, JSON export/import) — all unchanged in behavior. |

> The original `webpages/dadsync-admin/` is untouched — v2 is a separate copy.

---

## Firebase setup steps (one-time, ~15 minutes)

1. **Create a Firebase project** at https://console.firebase.google.com
   (e.g. `dadsync`). Free Spark plan is enough for this traffic.
2. **Enable Realtime Database**: Build → Realtime Database → **Create database**.
   Pick a location near your users (e.g. `asia-south1`). Start in **test mode**
   (open read/write for 30 days) or locked mode with rules like:

   ```json
   {
     "rules": {
       "contact_messages": { ".read": true, ".write": true },
       "job_applications": { ".read": true, ".write": true }
     }
   }
   ```

   > 🔐 These rules make the data readable by anyone with the database URL. For a
   > real deployment, add **Firebase Auth** (email/password) to the website and
   > admin dashboard and lock the rules down (e.g. `"auth != null"`). The dashboard
   > login screen is already wired as a placeholder gate — hooking up Firebase Auth
   > is the natural next step.
3. **Get the web config**: Project settings → *Your apps* → `</>` (Web) → register
   app → copy the `firebaseConfig` object (apiKey, authDomain, databaseURL,
   projectId, storageBucket, messagingSenderId, appId).
4. **Configure the dashboard** — pick ONE of:
   - **(a) In the UI (recommended):** open the dashboard → Settings → **Firebase —
     live data source** → paste `apiKey`, `databaseURL`, `projectId` (+ the rest if
     you like) → **Save Firebase config**. Stored in this browser
     (`dadsync_admin_config_v2`); no code edits needed.
   - **(b) In code:** replace the `FIREBASE_CONFIG` placeholders in `index.html`
     with your values. Works for every visitor of the dashboard.
5. **The dadsync_v7 website must use the SAME Firebase project/config.** The v7
   site writes submissions to `contact_messages` and `job_applications` (record:
   `name`, `phone`, `email`, `message`, `role` for applications, `timestamp`,
   `status:"new"`). The dashboard reads those exact nodes.

---

## What's inside

```
admin/                  (deploy this folder to GitHub Pages)
├── index.html          SPA shell: login screen + app shell + Firebase SDK/config
├── styles.css          Full DADSync navy/cyan design system + v2 source-chip/Firebase styles
├── js/
│   ├── data.js         Firebase listeners + localStorage fallback store, icons/constants
│   ├── ui.js           shared UI helpers (esc, dates, statuses, toasts, modals)
│   ├── views-dashboard.js
│   ├── views-messages.js
│   ├── views-applications.js
│   ├── views-settings.js   Formspree + Firebase config, demo-data reset, JSON export/import
│   └── app.js          bootstrap, hash router, login gate, sidebar/topbar + source chip
└── README.md           this file
```

## Features

- **Login screen** with email/password *and* a clearly-labelled **"Explore with demo
  data"** fallback (no backend auth yet — the form is a placeholder gate).
- **Dashboard** — KPI cards + recent-submissions feed, data-source note in the header.
- **Contact Messages** — searchable/filterable table, detail modal, mark read/archive/
  delete, add sample entry (pushed to Firebase when live).
- **Job Applications** — filter by role *and* status, per-row status dropdown
  (reviewed / hired / rejected), detail modal with cover message, delete.
- **Settings** — Formspree endpoints + recipient email, **Firebase config panel**,
  demo-data reset, export/import JSON backup.
- Data is read live from Firebase when configured; otherwise it persists in
  **localStorage** (`dadsync_admin_v2`); deep links like `#/messages?view=m01` work.

---

## Deploy to GitHub Pages (harekrishna7/dad2026)

The repo `harekrishna7/dad2026` publishes to GitHub Pages with the custom domain
`www.dadsync.in`. To deploy this dashboard under `/admin`:

```bash
# 1. clone (or pull) the repo
git clone https://github.com/harekrishna7/dad2026.git
cd dad2026
git checkout main && git pull

# 2. create the admin folder and copy the dashboard files
mkdir -p admin
# copy index.html, styles.css, js/ and README.md from webpages/dadsync-admin-v2/ into admin/

# 3. commit and push
git add admin/
git commit -m "Add DADSync admin dashboard v2 (Firebase live data)"
git push origin main

# 4. verify
# Pages rebuilds automatically. The dashboard will be live at:
#   https://www.dadsync.in/admin/
#   https://harekrishna7.github.io/dad2026/admin/
```

> The main website (`index.html` at the repo root) is **unchanged by this deploy** —
> the admin dashboard lives in its own `admin/` folder.

### ⚠️ Both halves must be deployed for the full flow to work

1. **Deploy the main website v7** (`webpages/dadsync_v7/index.html` → repo root
   `index.html`) — v7 contains the Firebase write logic (`pushRecord` → nodes
   `contact_messages` / `job_applications`) and the Formspree endpoints. The
   current live site still serves the old index.html (81,654 bytes) with **no**
   Firebase writes.
2. **Deploy this admin dashboard v2** (→ `admin/`) — reads those same nodes.
3. Optionally deploy the CRM (`webpages/dadsync-crm/`) too.

Real submissions flow only after **both** are live and Firebase is configured on
both sides with the same project.

---

## Honest status

**This dashboard v2 is PREPARED but NOT deployed.** I (the Webpage Developer agent)
cannot push to your GitHub repository — I have no credentials for
`harekrishna7/dad2026`. The live site www.dadsync.in is currently **unchanged**
(still serving the old 81,654-byte index.html, MD5
`1bfedcb90b259801c5342eff54420a17`; no Firebase writes). No push or deployment was
performed. Use the git commands above to deploy, then re-verify. Formspree endpoints
in Settings still show placeholder `https://formspree.io/f/XXXXXXXX` — replace them
with your real form IDs once your Formspree forms exist.
