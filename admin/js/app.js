/* =========================================================================
 * DADsync Admin Dashboard — js/app.js
 * Bootstraps the app: login gate (demo mode fallback), hash router
 * (#/dashboard, #/messages, #/applications, #/settings), sidebar and
 * topbar rendering, logout.
 *
 * AUTH NOTE: there is no backend auth yet. The email/password form is a
 * placeholder gate; the "Explore with demo data" button unlocks the app
 * in demo mode (clearly labelled). Wire Firebase Auth here when a backend
 * is added — see README.md.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;
  const SESSION_KEY = 'dadsync_admin_session';

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
    let label = 'Demo data · localStorage';
    if (st.enabled && st.live) {
      cls = 'live';
      label = 'Firebase · Live';
    } else if (st.enabled) {
      cls = 'demo';
      label = 'Firebase configured · no data yet';
    }
    return '<span class="src-chip ' + cls + '" id="src-chip" title="Data source">' +
      '<span class="src-dot"></span>' + A().esc(label) + '</span>';
  }

  function renderTopbar(activeLabel, session) {
    const topbar = document.getElementById('topbar');
    const demo = session && session.demo;
    const name = demo ? 'Demo Owner' : (session && session.name) || 'Owner';
    topbar.innerHTML =
      '<div class="topbar-title">' +
      '<button class="menu-toggle" id="menu-toggle" aria-label="Menu">' + A().ICONS.menu + '</button>' +
      A().esc(activeLabel) +
      (demo ? '<span class="demo-chip">DEMO DATA</span>' : '') +
      '</div>' +
      '<div class="topbar-right">' +
      srcChipHtml() +
      '<div class="user-chip"><div class="avatar">' + A().esc(A().initials(name)) + '</div>' + A().esc(name) + '</div>' +
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
  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setSession(sess) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
    location.hash = '#/dashboard';
    A().toast('Signed out', 'success');
  }

  function showLogin() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  }

  function enterApp(session) {
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
    if (!getSession()) { showLogin(); return; }
    const path = parseHash();
    const session = getSession();
    let view = 'dashboard';

    if (path === '/messages') view = 'messages';
    else if (path === '/applications') view = 'applications';
    else if (path === '/settings') view = 'settings';
    else if (path !== '/dashboard') { location.hash = '#/dashboard'; return; }

    renderSidebar(view);
    const navItem = NAV.find(function (n) { return n.id === view; });
    renderTopbar(navItem ? navItem.label : 'Dashboard', session);

    if (view === 'messages') A().renderMessages();
    else if (view === 'applications') A().renderApplications();
    else if (view === 'settings') A().renderSettings();
    else A().renderDashboard();
  }

  /* ---------------------------------------------------------- login UI */
  function wireLogin() {
    const form = document.getElementById('login-form');
    const demoBtn = document.getElementById('demo-login');
    const note = document.getElementById('login-note');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      if (!email || !pass) {
        note.textContent = 'Please enter an email and password.';
        return;
      }
      // Placeholder auth — no backend yet. Any credentials enter the app
      // in DEMO mode; connect Firebase Auth for real authentication.
      note.textContent = 'No backend auth configured yet — signing in with demo data. Connect Firebase Auth (see README) to enable real logins.';
      setSession({ name: 'Demo Owner', email: email, demo: true, at: Date.now() });
      enterApp({ name: 'Demo Owner', email: email, demo: true });
    });

    demoBtn.addEventListener('click', function () {
      note.textContent = 'Demo mode active — all data is seeded sample data stored in this browser (localStorage).';
      setSession({ name: 'Demo Owner', email: 'demo@dadsync.in', demo: true, at: Date.now() });
      enterApp({ name: 'Demo Owner', email: 'demo@dadsync.in', demo: true });
    });
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    wireLogin();
    window.addEventListener('hashchange', route);

    // Start Firebase realtime listeners (no-op when Firebase unconfigured).
    A().startListeners();
    // Re-render the header chip + current view whenever data changes
    // (e.g. a new Firebase snapshot arrives or the live flag flips).
    A().onDataChange(function () {
      const session = getSession();
      if (!session) return;
      const chip = document.getElementById('src-chip');
      if (chip) chip.outerHTML = srcChipHtml();
      route();
    });

    const session = getSession();
    if (session) enterApp(session);
    else showLogin();
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderTopbar = renderTopbar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
