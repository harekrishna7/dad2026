/* =========================================================================
 * DADsync Admin v3 — js/firebase-config.js
 * Initialises the Firebase JS SDK (v10 compat API loaded from the gstatic
 * CDN in index.html) with the REAL PUBLIC project config for
 * dadsync2026-7e20f (provided by the Owner on 2026-08-09).
 *
 * SECURITY NOTE: Web API keys are PUBLIC client identifiers — they only
 * identify the project. Access control is enforced by Firebase Security
 * Rules (see database.rules.json) + Firebase Authentication. NEVER put
 * service account JSON, Admin SDK secrets or API tokens in the browser.
 *
 * Exports (on window.DADsyncAdmin):
 *   firebaseConfig        — the real config object
 *   OWNER_EMAIL           — official DADsync Owner email (public identifier)
 *   initFirebase()        — returns { app, auth, db }, initialises once
 *   firebaseAuthCompat()  — bound wrappers for the compat Auth SDK
 * ========================================================================= */
'use strict';

(function () {
  const firebaseConfig = {
    apiKey: 'AIzaSyAgPlafXglLDepGSPr6S2Prwf3GJy-Y6lc',
    authDomain: 'dadsync2026-7e20f.firebaseapp.com',
    databaseURL: 'https://dadsync2026-7e20f-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'dadsync2026-7e20f',
    storageBucket: 'dadsync2026-7e20f.firebasestorage.app',
    messagingSenderId: '196883204226',
    appId: '1:196883204226:web:36c11373ff3731f9cccc9b',
    measurementId: 'G-SGW3LXN0V6',
  };

  /** Official DADsync Owner email — the Owner/Admin account. */
  const OWNER_EMAIL = 'dharmaanagaraidatasync@zohomail.in';

  let app = null;
  let auth = null;
  let db = null;

  function initFirebase() {
    if (app) return { app, auth, db };
    const fb = window.firebase;
    if (!fb || !fb.initializeApp) {
      throw new Error('Firebase SDK not loaded. Check the gstatic CDN scripts in index.html.');
    }
    app = fb.initializeApp(firebaseConfig);
    auth = fb.auth(app);
    db = fb.database(app);
    return { app, auth, db };
  }

  /* ------------------------------------------------------------- compat */
  /* v10 compat SDK: the auth instance exposes the legacy instance methods.
   * These helpers return bound wrappers so callers stay consistent. */

  function firebaseAuthCompat() {
    const fb = window.firebase;
    if (!fb || !fb.auth) throw new Error('Firebase Auth SDK not loaded.');
    return {
      signInWithEmailAndPassword: (a, email, password) => a.signInWithEmailAndPassword(email, password),
      signInWithPopup: (a, provider) => a.signInWithPopup(provider),
      GoogleAuthProvider: fb.auth.GoogleAuthProvider,
      sendPasswordResetEmail: (a, email) => a.sendPasswordResetEmail(email),
      onAuthStateChanged: (a, cb) => a.onAuthStateChanged(cb),
      signOut: (a) => a.signOut(),
      updateProfile: (u, profile) => u.updateProfile(profile),
    };
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  Object.assign(window.DADsyncAdmin, {
    firebaseConfig,
    OWNER_EMAIL,
    initFirebase,
    firebaseAuthCompat,
  });
})();
