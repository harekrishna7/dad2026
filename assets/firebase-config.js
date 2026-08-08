/* ============================================================
   DADsync — Firebase configuration (contact form backend)
   ============================================================
   Live Firebase project: dadsync2026-7e20f
   -------------------------------------------------------------------
   Submissions from the Contact page are written to the Firestore
   collection named "contacts", one document per submission, with
   fields:
     first_name, last_name, email, interest, message, created_at
   -------------------------------------------------------------------
   NOTE: The Firebase SDKs (v9 compat) are loaded in contact.html
   from the gstatic CDN. This file must load BEFORE app.js so the
   window.DADSYNC_FIREBASE object exists at form-submit time.
   ============================================================ */
window.DADSYNC_FIREBASE = {
  apiKey: "AIzaSyAgPlafXGlDepGSPR6S2Prwf3GJy-Y6lc",
  authDomain: "dadsync2026-7e20f.firebaseapp.com",
  databaseURL: "https://dadsync2026-7e20f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dadsync2026-7e20f",
  storageBucket: "dadsync2026-7e20f.firebasestorage.app",
  messagingSenderId: "196883204226",
  appId: "1:196883204226:web:36c11373ff3731f9cccc9b",
  measurementId: "G-SGW3L0XNV6"
};

/* Whether the config above has been filled in with real values. */
window.DADSYNC_FIREBASE_READY = (function () {
  var c = window.DADSYNC_FIREBASE || {};
  return !!(c.apiKey && c.projectId &&
    c.apiKey.indexOf("YOUR_") === -1 &&
    c.projectId.indexOf("YOUR_") === -1);
})();
