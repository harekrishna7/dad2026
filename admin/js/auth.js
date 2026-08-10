/* =========================================================================
 * DADsync Admin v3 — js/auth.js
 * AuthService: the single, secure authentication facade for the dashboard.
 *
 *  - Email + Password sign-in (Firebase Authentication)
 *  - "Continue with Google" (Google OAuth via Firebase Auth, popup flow)
 *  - Forgot Password / Reset Password (sendPasswordResetEmail)
 *  - Persistent session via onAuthStateChanged
 *  - Role resolution from /users/{uid}/role (ADMIN / TEAM_MEMBER / ...)
 *  - Route-guard helpers (requireAuth / requireRole)
 *
 * SECURITY:
 *  - NO passwords are ever stored in this frontend or in source code.
 *  - Credentials go straight to Firebase Auth over TLS; the app never sees
 *    the password after signInWithEmailAndPassword resolves.
 *  - Data access is gated server-side by database.rules.json (auth + role).
 *  - The Owner account email is a constant (public identifier, not a
 *    secret); the password is set by the Owner in the Firebase Console.
 * ========================================================================= */
'use strict';

(function () {
  const K = () => window.DADsyncAdmin;
  const ROLE_KEY = 'dadsync_admin_role';
  const SESSION_KEY = 'dadsync_admin_session';

  const ROLES = Object.freeze({
    ADMIN:        { label: 'Admin',       level: 5, color: '#ef4444' },
    TEAM_MEMBER:  { label: 'Team Member', level: 2, color: '#0ea5e9' },
    VIEWER:       { label: 'Viewer',      level: 1, color: '#64748b' },
  });

  class AuthService {
    constructor() {
      this.auth = null;
      this.db = null;
      this.user = null;          // { uid, email, name, role, provider }
      this._rolePromise = null;
      this._unsubscribe = null;
    }

    /* ------------------------------------------------ lifecycle */
    init() {
      const { app, auth, db } = K().initFirebase();
      this.auth = auth;
      this.db = db;
      const { onAuthStateChanged } = K().firebaseAuthCompat();
      this._unsubscribe = onAuthStateChanged(auth, (fbUser) => this._onAuthState(fbUser));
      return this;
    }

    dispose() {
      if (this._unsubscribe) { this._unsubscribe(); this._unsubscribe = null; }
    }

    isLive() { return !!(this.auth && this.db); }

    get currentUser() { return this.user; }

    /* ---------------------------------------------------- auth state */
    async _onAuthState(fbUser) {
      if (!fbUser) {
        this.user = null;
        this._rolePromise = null;
        this._clearSession();
        K().onAuthChange && K().onAuthChange(null);
        return;
      }
      const profile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email || 'User',
        provider: (fbUser.providerData && fbUser.providerData[0] && fbUser.providerData[0].providerId) || 'password',
      };
      this.user = profile;
      // Resolve role from /users/{uid}/role (RBAC). Default for a signed-in
      // user with no record is VIEWER — never ADMIN implicitly.
      try {
        const role = await this._fetchRole(profile.uid);
        profile.role = role || 'VIEWER';
      } catch (_) {
        profile.role = 'VIEWER';
      }
      this._persistSession(profile);
      K().onAuthChange && K().onAuthChange(this.user);
    }

    async _fetchRole(uid) {
      if (!this.db) return null;
      try {
        const snap = await this.db.ref('users/' + uid + '/role').once('value');
        return snap.val();
      } catch (_) { return null; }
    }

    async getRole(uid) {
      if (!this._rolePromise || !this.user || this.user.uid !== uid) {
        this._rolePromise = this._fetchRole(uid);
      }
      return this._rolePromise;
    }

    /* ------------------------------------------------ sign-in methods */
    async signInWithEmail(email, password) {
      if (!this.isLive()) throw new Error('Firebase Auth is not connected.');
      const { signInWithEmailAndPassword } = K().firebaseAuthCompat();
      await signInWithEmailAndPassword(this.auth, email, password);
      await this._waitForUser();
      return this.user;
    }

    async signInWithGoogle() {
      if (!this.isLive()) throw new Error('Firebase Auth is not connected.');
      const c = K().firebaseAuthCompat();
      const provider = new c.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await c.signInWithPopup(this.auth, provider);
      await this._waitForUser();
      return this.user;
    }

    async sendPasswordReset(email) {
      if (!this.isLive()) throw new Error('Firebase Auth is not connected.');
      const { sendPasswordResetEmail } = K().firebaseAuthCompat();
      await sendPasswordResetEmail(this.auth, email);
    }

    async signOut() {
      if (this.isLive() && this.auth) {
        const { signOut } = K().firebaseAuthCompat();
        try { await signOut(this.auth); } catch (_) { /* already signed out */ }
      }
      this.user = null;
      this._clearSession();
      K().onAuthChange && K().onAuthChange(null);
    }

    _waitForUser(timeoutMs = 8000) {
      return new Promise((resolve, reject) => {
        const t0 = Date.now();
        const tick = () => {
          if (this.user) return resolve(this.user);
          if (Date.now() - t0 > timeoutMs) return reject(new Error('Sign-in timed out. Please try again.'));
          setTimeout(tick, 80);
        };
        tick();
      });
    }

    /* ------------------------------------------------ role / guards */
    isOwner(email) {
      return !!(email && String(email).toLowerCase() === String(K().OWNER_EMAIL).toLowerCase());
    }

    roleLevel(role) {
      const r = ROLES[role];
      return r ? r.level : 0;
    }

    can(permission) {
      const role = this.user && this.user.role ? this.user.role : null;
      const level = this.roleLevel(role);
      const perms = {
        view: level >= 1,
        updateStatus: level >= 2,
        deleteRecord: level >= 5,
        manageConfig: level >= 5,
      };
      return !!perms[permission];
    }

    requireAuth() {
      return !!this.user;
    }

    requireRole(minRole) {
      if (!this.user) return false;
      return this.roleLevel(this.user.role) >= this.roleLevel(minRole);
    }

    /* ------------------------------------------------ session cache */
    _persistSession(profile) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        localStorage.setItem(ROLE_KEY, profile.role || '');
      } catch (_) { /* storage unavailable */ }
    }

    _clearSession() {
      try {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ROLE_KEY);
      } catch (_) { /* storage unavailable */ }
    }

    cachedSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    }
  }

  let instance = null;
  function getAuthService() {
    if (!instance) instance = new AuthService();
    return instance;
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  Object.assign(window.DADsyncAdmin, {
    AuthService,
    getAuthService,
    ROLES,
    /** hook the app sets so auth.js can notify the shell (login/logout) */
    onAuthChange: null,
  });
})();
