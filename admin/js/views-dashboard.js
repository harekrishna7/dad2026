/* =========================================================================
 * DADsync Admin Dashboard — js/views-dashboard.js
 * Dashboard view: KPI cards, recent submissions feed, quick actions.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  function counts(state) {
    const msgs = state.messages;
    const apps = state.applications;
    const now = Date.now();
    const newMsgs = msgs.filter(function (m) { return m.status === 'new'; }).length;
    const newApps = apps.filter(function (a) { return a.status === 'new'; }).length;
    const weekMsgs = msgs.filter(function (m) { return A().isThisWeek(m.date); }).length;
    const weekApps = apps.filter(function (a) { return A().isThisWeek(a.date); }).length;
    const unreadMsgs = msgs.filter(function (m) { return m.status === 'new' || m.status === 'unread'; }).length;
    return {
      totalMsgs: msgs.length,
      totalApps: apps.length,
      newThisWeek: weekMsgs + weekApps,
      unread: unreadMsgs + newApps,
      newMsgs: newMsgs,
      newApps: newApps
    };
  }

  function feedItem(item, kind) {
    const isMsg = kind === 'message';
    const name = item.name;
    const date = item.date;
    const unread = isMsg ? (item.status === 'new' || item.status === 'unread') : item.status === 'new';
    const line = isMsg ? item.message : (item.role + ' — ' + item.message);
    const avatarCls = isMsg ? 'cyan' : 'blue';
    const chip = isMsg ? A().statusChip(item.status, 'message') : A().statusChip(item.status, 'application');
    const sub = isMsg ? item.email : (item.email + ' · ' + item.phone);
    const route = isMsg ? '#/messages?view=' + item.id : '#/applications?view=' + item.id;
    return '<div class="feed-item' + (unread ? ' unread' : '') + '" data-feed="' + kind + '" data-id="' + item.id + '" data-route="' + route + '">' +
      '<div class="feed-avatar ' + avatarCls + '">' + A().esc(A().initials(name)) + '</div>' +
      '<div class="feed-body">' +
      '<div class="feed-top"><span class="feed-name">' + A().esc(name) + '</span>' +
      '<span class="feed-time">' + A().esc(A().timeAgo(date)) + '</span></div>' +
      '<div class="feed-line">' + A().esc(line) + '</div>' +
      '<div class="feed-meta">' + chip + '<span class="cell-sub">' + A().esc(sub) + '</span></div>' +
      '</div></div>';
  }

  function render() {
    const state = A().load();
    const c = counts(state);
    const main = document.getElementById('main');
    const fb = A().getFirebaseStatus();

    const srcNote = fb.live
      ? 'Live — reading <strong>contact_messages</strong> and <strong>job_applications</strong> from Firebase Realtime Database'
      : (fb.enabled
        ? 'Firebase configured but no records loaded yet — showing demo data'
        : 'Demo data — connect Firebase in Settings to read live submissions');

    const recent = []
      .concat(state.messages.map(function (m) { return { item: m, kind: 'message' }; }))
      .concat(state.applications.map(function (a) { return { item: a, kind: 'application' }; }))
      .sort(function (x, y) { return new Date(y.item.date) - new Date(x.item.date); })
      .slice(0, 6);

    main.innerHTML =
      '<div class="panel-head"><div><div class="panel-title">Overview</div>' +
      '<div class="panel-sub">Website inbox &amp; careers — submissions overview · ' + srcNote + '</div></div></div>' +

      '<div class="kpi-grid">' +
      kpi('Contact messages', c.totalMsgs, 'inbox', 'cyan', c.newMsgs + ' new') +
      kpi('Job applications', c.totalApps, 'briefcase', 'blue', c.newApps + ' new') +
      kpi('New this week', c.newThisWeek, 'chart', 'amber', 'across both') +
      kpi('Unread / new', c.unread, 'alert', 'red', 'needs attention') +
      '</div>' +

      '<div class="two-col">' +

      '<div class="panel">' +
      '<div class="panel-head"><div class="panel-title">Recent submissions</div>' +
      '<a class="link-btn" href="#/messages">View all</a></div>' +
      '<div class="feed" id="feed-recent">' +
      (recent.length
        ? recent.map(function (r) { return feedItem(r.item, r.kind); }).join('')
        : '<div class="empty-state"><div class="empty-title">No submissions yet</div>' +
          '<div class="empty-sub">New website submissions will appear here automatically once the dadsync.v7 site (Firebase) is deployed and this dashboard is connected.</div></div>') +
      '</div></div>' +

      '<div class="panel">' +
      '<div class="panel-head"><div class="panel-title">Quick actions</div></div>' +
      '<div class="feed">' +
      '<div class="feed-item" data-goto="#/messages"><div class="feed-avatar cyan">' + A().ICONS.inbox + '</div>' +
      '<div class="feed-body"><div class="feed-top"><span class="feed-name">Contact messages</span></div>' +
      '<div class="feed-line">Review, search and manage website contact enquiries.</div></div></div>' +
      '<div class="feed-item" data-goto="#/applications"><div class="feed-avatar blue">' + A().ICONS.briefcase + '</div>' +
      '<div class="feed-body"><div class="feed-top"><span class="feed-name">Job applications</span></div>' +
      '<div class="feed-line">Filter by role and move candidates through the hiring funnel.</div></div></div>' +
      '<div class="feed-item" data-goto="#/settings"><div class="feed-avatar amber">' + A().ICONS.settings + '</div>' +
      '<div class="feed-body"><div class="feed-top"><span class="feed-name">Settings</span></div>' +
      '<div class="feed-line">Configure Formspree endpoints, recipient email and demo data.</div></div></div>' +
      '</div></div>' +

      '</div>';

    // wire feed clicks
    const feed = document.getElementById('feed-recent');
    if (feed) {
      feed.querySelectorAll('[data-feed]').forEach(function (el) {
        el.addEventListener('click', function () { location.hash = el.getAttribute('data-route'); });
      });
    }
    main.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () { location.hash = el.getAttribute('data-goto'); });
    });
  }

  function kpi(label, value, icon, cls, trend) {
    return '<div class="kpi-card"><div class="kpi-icon ' + cls + '">' + A().ICONS[icon] + '</div>' +
      '<div><div class="kpi-value">' + value + '</div>' +
      '<div class="kpi-label">' + A().esc(label) + '</div>' +
      '<div class="kpi-trend ' + (cls === 'red' ? 'warn' : 'up') + '">' + A().esc(trend) + '</div></div></div>';
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderDashboard = render;
})();
