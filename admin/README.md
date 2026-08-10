# DADsync Admin Dashboard v3

A self-contained, standalone **admin dashboard** for the DADSync website (www.dadsync.in).
**v3 adds REAL password + Google OAuth authentication** via Firebase Authentication
(Firebase project **dadsync2026-7e20f**), plus the v2 live Realtime Database reads
(`contact_messages` + `job_applications`) with a graceful fallback to the built-in
localStorage demo store.

Built as a hash-routed single-page app (no build step, no server): `index.html` +
`styles.css` + plain-vanilla JS modules under `js/`. Branding matches the DADSync
navy/cyan design system used across the website and the DADSync CRM.

---

## What changed in v3 (vs v2)

| Area | Change |
|---|---|
| **Real Firebase config** | `js/firebase-config.js` pins the REAL public config for project `dadsync2026-7e20f` (apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId) — provided by the Owner on 2026-08-09. No `YOUR_` placeholders remain. Web API keys are **public identifiers**, not secrets. |
| **Password sign-in (verified)** | The login form now calls `signInWithEmailAndPassword()` on Firebase Auth. **No hardcoded password, no demo auto-accept.** Wrong credentials are rejected with clear errors (invalid email/password, disabled account, too many attempts, network). |
| **Google OAuth (verified)** | New **"Continue with Google"** button using `GoogleAuthProvider` + `signInWithPopup`. Errors surfaced: popup cancelled/blocked, account exists with different credential, **unauthorised domain** (must add `www.dadsync.in` + `dadsync.in` to Firebase Console → Authentication → Settings → Authorized domains). |
| **Forgot password** | "Forgot password?" sends `sendPasswordResetEmail` to the entered email. |
| **AuthService** | New `js/auth.js`: single auth facade — email/password, Google popup, reset email, `onAuthStateChanged` persistent session, role resolution from `/users/{uid}/role`, route guards `requireAuth()` / `requireRole()`. |
| **RBAC** | Role from `/users/{uid}/role`: **ADMIN** (level 5, full access), **TEAM_MEMBER** (level 2, view + update status), **VIEWER** (level 1, read-only, default for users without a role record). Never implicitly ADMIN. Role chip shown in the topbar. |
| **Protected data** | Dashboard data (contact_messages / job_applications) remains gated server-side by `database.rules.json` (auth != null + role). Client-side, the router only renders the app shell when a verified Firebase user is signed in. |
| **Demo mode** | The clearly-labelled **"Explore with demo data"** button remains as a read-only fallback so the UI can be previewed without an account. It is NOT an authentication path. |
| **SDK** | `index.html` now loads `firebase-app-compat.js` + `firebase-auth-compat.js` + `firebase-database-compat.js` (v10.12.2, gstatic CDN). |

> The original `webpages/dadsync-admin-v2/` is untouched — v3 is a separate copy.

---

## One-time Firebase Console setup (Owner — required for live sign-in)

1. **Sign-in methods** — Firebase Console → project `dadsync2026-7e20f` → Build →
   Authentication → Sign-in method:
   - ✅ **Email/Password** — enable (required for password login + reset).
   - ✅ **Google** — enable (required for "Continue with Google").
2. **Authorized domains** — Authentication → Settings → Authorized domains — add
   `www.dadsync.in` and `dadsync.in` (GitHub Pages project URL is usually pre-added).
3. **Owner account** — Authentication → Users → **Add user**:
   - Email: `dharmaanagaraidatasync@zohomail.in` (constant `OWNER_EMAIL`)
   - A strong password (set it yourself — **never shared in chat**).
4. **Owner role** — Realtime Database → write at `/users/{UID}/role` = `"ADMIN"`
   (UID from the Authentication → Users row). Team members: `"TEAM_MEMBER"` or
   `"VIEWER"` at their `/users/{UID}/role`.
5. **Security rules** — publish `database.rules.json` (deny-by-default, `auth != null`
   with role gating) so data is only readable by signed-in users with a role.

> Live website side: `dadsync_v7` (repo root `index.html`) uses the same Firebase
> project to write `contact_messages` / `job_applications`. The dashboard reads those
> exact nodes.

---

## What's inside

```
admin/                  (deploy this folder to GitHub Pages)
├── index.html          SPA shell: login screen (password + Google + forgot) + app shell + Firebase SDK
├── styles.css          Full DADSync navy/cyan design system + Google/role-chip/error styles
├── js/
│   ├── firebase-config.js  REAL config (dadsync2026-7e20f) + initFirebase() + firebaseAuthCompat()
│   ├── auth.js             AuthService: email/password, Google popup, reset, RBAC, route guards
│   ├── data.js         Firebase listeners + localStorage fallback store, icons/constants
│   ├── ui.js           shared UI helpers (esc, dates, statuses, toasts, modals)
│   ├── views-dashboard.js
│   ├── views-messages.js
│   ├── views-applications.js
│   ├── views-settings.js   Formspree + Firebase config, demo-data reset, JSON export/import
│   └── app.js          bootstrap, hash router, Firebase-Auth login gate, sidebar/topbar, logout
└── README.md           this file
```

## Features

- **Secure sign-in**: password (Firebase Auth Email/Password) + **Continue with
  Google** (Google OAuth popup) + **Forgot password** (reset email). No hardcoded
  credentials; every login is verified by Firebase.
- **Role-based access**: role read from `/users/{uid}/role` — Admin (full), Team
  Member (update status), Viewer (read-only). Role chip in the topbar.
- **Dashboard** — KPI cards + recent-submissions feed, data-source note in the header.
- **Contact Messages** — searchable/filterable table, detail modal, mark read/archive/
  delete (status writes go to Firebase when live).
- **Job Applications** — filter by role *and* status, per-row status dropdown
  (reviewed / hired / rejected), detail modal with cover message, delete.
- **Settings** — Formspree endpoints + recipient email, Firebase config panel,
  demo-data reset, export/import JSON backup.
- Data is read live from Firebase when configured; otherwise it persists in
  **localStorage** (`dadsync_admin_v2`); deep links like `#/messages?view=m01` work.
