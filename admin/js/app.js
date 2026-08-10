/* =========================================================================
 * DADsync Admin v3 — js/app.js
 * Bootstraps the app: Firebase Auth login gate (email/password + Google
 * OAuth, verified by Firebase Authentication), hash router
 * (#/dashboard, #/messages, #/applications, #/settings), sidebar and
 * topbar rendering, RBAC gating, logout.
 *
 * AUTH: the login form and Google button are REAL — credentials go to
 * Firebase Auth over TLS. No hardcoded password. Role comes from
 * /users/{uid}/role (ADMIN | TEAM_MEMBER | VIEWER). The clearly-labelled
 * "Explore with demo data" button stays as a read-only demo fallback.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'chart', href: '#/dashboard', route: '#/dashboard' },
    { id: 'messages', label: 'Contact Messages', icon: 'inbox', href: '#/messages', route: '#/messages' },
    { id: 'applications', label: 'Job Applications', icon: 'briefcase', href: '#/applications', route: '#/applications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '#/settings', route: '#/settings' }
  ];

  function unreadCount() {
    const s = A().load();
    return s.messages.filter(function (m) { return m.status === 'new' || m.status === 'unread'; }).length +
      s.applications.filter(function (a) { return a.status === 'new'; }).length;
  }

  /* ---------------------------------------------------------- sidebar */
  function renderSidebar(activeId) {
    const sidebar = document.getElementById('sidebar');
    const unread = unreadCount();
    const items = NAV.map(function (item) {
      const active = item.id === activeId;
      const badge = (item.id === 'messages' || item.id === 'applications') && unread > 0
        ? '<span class="nav-badge">' + unread + '</span>'
        : '';
      return '<a class="nav-item' + (active ? ' active' : '') + '" href="' + item.href + '" data-nav="' + item.id + '">' +
        A().ICONS[item.icon] + '<span class="nav-label">' + A().esc(item.label) + '</span>' + badge + '</a>';
    }).join('');

    sidebar.innerHTML =
      '<div class="brand">' +
      '<div class="brand-mark">D</div>' +
      '<div class="brand-text"><div class="brand-name">DADsync</div><div class="brand-sub">Admin</div></div>' +
      '</div>' +
      '<nav class="nav">' + items + '</nav>' +
      '<div class="sidebar-foot">' +
      '<a class="nav-item" href="https://www.dadsync.in" target="_blank" rel="noopener">' + A().ICONS.globe + '<span class="nav-label">dadsync.in</span></a>' +
      '</div>';
  }

  /* ---------------------------------------------------------- topbar */
  function srcChipHtml() {
    const st = A().getFirebaseStatus();
    let cls = 'demo';
    let label = 'Demo data \u00b7 localStorage';
    if (st.enabled && st.live) {
      cls = 'live';
      label = 'Firebase \u00b7 Live';
    } else if (st.enabled) {
      cls = 'demo';
      label = 'Firebase configured \u00b7 no data yet';
    }
    return '<span class="src-chip ' + cls + '" id="src-chip" title="Data source">' +
      '<span class="src-dot"></span>' + A().esc(label) + '</span>';
  }

  function renderTopbar(activeLabel, user) {
    const topbar = document.getElementById('topbar');
    const demo = user && user.demo;
    const name = demo ? 'Demo Owner' : ((user && user.name) || 'Owner');
    const role = user && user.role ? user.role : null;
    const roleChip = (role && !demo)
      ? '<span class="role-chip" style="--role-color:' + (A().ROLES[role] ? A().ROLES[role].color : '#64748b') + '">' +
        A().esc((A().ROLES[role] ? A().ROLES[role].label : role)) + '</span>'
      : '';
    topbar.innerHTML =
      '<div class="topbar-title">' +
      '<button class="menu-toggle" id="menu-toggle" aria-label="Menu">' + A().ICONS.menu + '</button>' +
      A().esc(activeLabel) +
      (demo ? '<span class="demo-chip">DEMO DATA</span>' : '') +
      '</div>' +
      '<div class="topbar-right">' +
      srcChipHtml() +
      '<div class="user-chip"><div class="avatar">' + A().esc(A().initials(name)) + '</div>' + A().esc(name) + roleChip + '</div>' +
      '<button class="link-btn" id="logout-btn">' + A().ICONS.logout + ' Sign out</button>' +
      '</div>';

    document.getElementById('logout-btn').addEventListener('click', logout);
    const toggle = document.getElementById('menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }
    // close mobile sidebar on nav
    document.querySelectorAll('.nav-item').forEach(function (el) {
      el.addEventListener('click', function () {
        document.getElementById('sidebar').classList.remove('open');
      });
    });
  }

  /* ------------------------------------------------------------- auth */
  function currentUser() {
    const auth = A().getAuthService();
    if (auth.user) return auth.user;
    // boot-time: honour a previously verified session (AuthService persists it)
    return auth.cachedSession() || null;
  }

  function logout() {
    const auth = A().getAuthService();
    auth.signOut().catch(function () {});
    showLogin();
    location.hash = '#/dashboard';
    A().toast('Signed out', 'success');
  }

  function showLogin() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  }

  function enterApp(user) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    route();
  }

  /* ------------------------------------------------------------ router */
  function parseHash() {
    const h = location.hash || '#/dashboard';
    return h.split('?')[0].replace(/^#/, '') || '/dashboard';
  }

  function route() {
    const auth = A().getAuthService();
    if (!auth.user) { showLogin(); return; }
    const path = parseHash();
    const user = auth.user;
    let view = 'dashboard';

    if (path === '/messages') view = 'messages';
    else if (path === '/applications') view = 'applications';
    else if (path === '/settings') view = 'settings';
    else if (path !== '/dashboard') { location.hash = '#/dashboard'; return; }

    renderSidebar(view);
    const navItem = NAV.find(function (n) { return n.id === view; });
    renderTopbar(navItem ? navItem.label : 'Dashboard', user);

    if (view === 'messages') A().renderMessages();
    else if (view === 'applications') A().renderApplications();
    else if (view === 'settings') A().renderSettings();
    else A().renderDashboard();
  }

  /* ---------------------------------------------------------- login UI */
  function note(msg, isError) {
    const el = document.getElementById('login-note');
    if (!msg) { el.classList.add('hidden'); el.textContent = ''; return; }
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.remove('hidden');
  }

  function setBusy(busy) {
    const submit = document.getElementById('login-submit');
    const google = document.getElementById('google-login');
    const demo = document.getElementById('demo-login');
    if (submit) { submit.disabled = busy; submit.textContent = busy ? 'Signing in…' : 'Sign in'; }
    if (google) google.disabled = busy;
    if (demo) demo.disabled = busy;
  }

  function wireLogin() {
    const form = document.getElementById('login-form');
    const demoBtn = document.getElementById('demo-login');
    const googleBtn = document.getElementById('google-login');
    const forgotBtn = document.getElementById('forgot-btn');
    const auth = A().getAuthService();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      if (!email || !pass) {
        note('Please enter an email and password.', true);
        return;
      }
      note('', false);
      setBusy(true);
      auth.signInWithEmail(email, pass)
        .then(function (user) {
          A().toast('Signed in as ' + user.email, 'success');
        })
        .catch(function (err) {
          const code = err && err.code;
          let msg = 'Sign-in failed. Please check your credentials.';
          if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
            msg = 'Invalid email or password.';
          } else if (code === 'auth/invalid-email') {
            msg = 'Please enter a valid email address.';
          } else if (code === 'auth/too-many-requests') {
            msg = 'Too many attempts. Please try again later.';
          } else if (code === 'auth/user-disabled') {
            msg = 'This account has been disabled.';
          } else if (code === 'auth/network-request-failed') {
            msg = 'Network error. Check your connection.';
          }
          note(msg, true);
        })
        .finally(function () { setBusy(false); });
    });

    googleBtn.addEventListener('click', function () {
      note('', false);
      setBusy(true);
      auth.signInWithGoogle()
        .then(function (user) {
          A().toast('Signed in with Google as ' + user.email, 'success');
        })
        .catch(function (err) {
          const code = err && err.code;
          let msg = 'Google sign-in failed.';
          if (code === 'auth/popup-closed-by-user') {
            msg = 'Google sign-in was cancelled.';
          } else if (code === 'auth/popup-blocked') {
            msg = 'Pop-up blocked. Allow pop-ups for this site and try again.';
          } else if (code === 'auth/account-exists-with-different-credential') {
            msg = 'An account with this email already exists. Sign in with your password instead.';
          } else if (code === 'auth/unauthorized-domain') {
            msg = 'This domain is not authorised for Google sign-in. Add it in Firebase Console (Authentication → Settings → Authorized domains).';
          }
          note(msg, true);
        })
        .finally(function () { setBusy(false); });
    });

    forgotBtn.addEventListener('click', function () {
      const email = document.getElementById('login-email').value.trim();
      if (!email) {
        note('Enter your email above, then click "Forgot password?" to send a reset link.', true);
        return;
      }
      note('Sending reset email…', false);
      auth.sendPasswordReset(email)
        .then(function () {
          note('Password reset email sent to ' + email + '. Check your inbox (and spam).', false);
        })
        .catch(function (err) {
          const code = err && err.code;
          let msg = 'Could not send the reset email.';
          if (code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
          else if (code === 'auth/user-not-found') msg = 'No account found for that email.';
          note(msg, true);
        });
    });

    demoBtn.addEventListener('click', function () {
      note('Demo mode active — all data is seeded sample data stored in this browser (localStorage).', false);
      auth.user = { name: 'Demo Owner', email: 'demo@dadsync.in', role: 'ADMIN', demo: true };
      A().onAuthChange && A().onAuthChange(auth.user);
    });
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    const auth = A().getAuthService();

    // Notify the shell whenever Firebase Auth state changes (login/logout).
    A().onAuthChange = function (user) {
      if (user && user.demo) { enterApp(user); return; }
      if (user) { enterApp(user); return; }
      showLogin();
    };

    wireLogin();
    window.addEventListener('hashchange', route);

    // Start Firebase realtime listeners (no-op when Firebase unconfigured).
    A().startListeners();
    // Re-render the header chip + current view whenever data changes
    // (e.g. a new Firebase snapshot arrives or the live flag flips).
    A().onDataChange(function () {
      if (!auth.user) return;
      const chip = document.getElementById('src-chip');
      if (chip) chip.outerHTML = srcChipHtml();
      route();
    });

    // Real session: initialise Firebase Auth (listens for existing session).
    try {
      auth.init();
    } catch (err) {
      console.warn('DADSync Admin v3: Firebase Auth init failed — login will not work.', err);
      note('Firebase Auth could not be initialised. Check the CDN scripts and config.', true);
    }
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderTopbar = renderTopbar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
