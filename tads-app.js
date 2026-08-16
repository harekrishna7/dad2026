/* ============================================================
   DADSync · Tripura AI Transformation — APP (router + views)
   ------------------------------------------------------------
   Hash-based client-side router under #/tripura-ai/*
   Routes:
     #/tripura-ai                  landing
     #/tripura-ai/governance       AI Governance Co-Pilot
     #/tripura-ai/governance/:id   scheme/service detail
     #/tripura-ai/funding          Startup & Funding Intelligence
     #/tripura-ai/funding/:id      funding detail
     #/tripura-ai/problems         Citizen Problem Intelligence
     #/tripura-ai/problems/:id     problem detail
     #/tripura-ai/opportunities    Tripura Opportunity Map
     #/tripura-ai/opportunities/:id opportunity detail
     #/tripura-ai/knowledge        Northeast AI Knowledge Hub
     #/tripura-ai/knowledge/:id    article detail
     #/tripura-ai/dashboard        DADSync AI Insight Dashboard
     #/tripura-ai/search           AI Search & Discovery
     #/tripura-ai/admin            Admin / Content Management
   ============================================================ */
(function () {
  'use strict';
  var T = window.TADS;
  if (!T) { console.error('Tripura AI: data service missing.'); return; }

  var root = document.getElementById('tads-app');
  var topBar = document.getElementById('tads-topbar');

  /* ---------------------------- Security helpers ---------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escAttr(s) { return esc(s); }

  /* ---------------------------- Shared UI helpers ---------------------------- */
  function badge(status) {
    var map = {
      'VERIFIED': 'tads-badge-v', 'NEEDS VERIFICATION': 'tads-badge-nv',
      'USER SUBMITTED': 'tads-badge-us', 'AI GENERATED': 'tads-badge-ai', 'ARCHIVED': 'tads-badge-ar'
    };
    var cls = map[String(status || '').toUpperCase()] || 'tads-badge-status';
    return '<span class="tads-badge ' + cls + '"><span class="dot"></span>' + esc(status || 'Unknown') + '</span>';
  }
  function statusBadge(status) {
    var ok = ['Resolved', 'Verified'];
    var hot = ['In Progress', 'Assigned', 'Under Review', 'Submitted'];
    var bad = ['Rejected'];
    var extra = ok.indexOf(status) !== -1 ? ' ok' : (hot.indexOf(status) !== -1 ? ' hot' : (bad.indexOf(status) !== -1 ? ' bad' : ''));
    return '<span class="tads-badge tads-badge-status' + extra + '">' + esc(status) + '</span>';
  }
  function tag(t, cls) { return '<span class="tads-tag' + (cls ? ' ' + cls : '') + '">' + esc(t) + '</span>'; }
  function icon(name) {
    var paths = {
      gov: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 11h.01M15 11h.01"/>',
      fund: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      prob: '<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/>',
      opp: '<path d="M9 20l-5.4-5.4a2 2 0 0 1 0-2.8L16.2 1.2a2 2 0 0 1 2.8 0l3.8 3.8a2 2 0 0 1 0 2.8L10.2 20.4a2 2 0 0 1-1.2.6zM14 5l5 5"/><path d="M7 17l-5 5"/>',
      kb: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
      dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
      search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
      admin: '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8"/>',
      back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
      src: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
      check: '<path d="M20 6L9 17l-5-5"/>',
      warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
      cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
      pin: '<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      save: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      ai: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
      filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>'
    };
    var d = paths[name] || paths.gov;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('tads-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3600);
  }

  function go(hash) {
    window.location.hash = hash;
  }

  function loadingState(n) {
    var cards = '';
    for (var i = 0; i < (n || 6); i++) {
      cards += '<div class="tads-skeleton"><div class="sk-line w80"></div><div class="sk-line w60"></div><div class="sk-line w40"></div></div>';
    }
    return '<div class="tads-grid">' + cards + '</div>';
  }

  function emptyState(title, msg, actionHtml) {
    return '<div class="tads-empty"><div class="em">🔎</div><h3>' + esc(title) + '</h3><p>' + esc(msg) + '</p>' + (actionHtml || '') + '</div>';
  }

  function errorState(title, msg, retry) {
    return '<div class="tads-error"><div class="em">⚠️</div><h3>' + esc(title) + '</h3><p>' + esc(msg) + '</p>' +
      (retry ? '<button class="tads-btn tads-btn-ghost tads-btn-sm" onclick="location.reload()">Retry</button>' : '') + '</div>';
  }

  function pager(p, baseHash) {
    if (p.pages <= 1) return '';
    var html = '<div class="tads-pager">';
    html += '<button ' + (p.page === 1 ? 'disabled' : '') + ' onclick="location.hash=\'' + escAttr(baseHash + '&p=' + (p.page - 1)) + '\'">Prev</button>';
    for (var i = 1; i <= p.pages; i++) {
      if (p.pages > 9 && i !== 1 && i !== p.pages && Math.abs(i - p.page) > 2) {
        if (i === 2 || i === p.pages - 1) html += '<button disabled>…</button>';
        continue;
      }
      html += '<button class="' + (i === p.page ? 'active' : '') + '" onclick="location.hash=\'' + escAttr(baseHash + '&p=' + i) + '\'">' + i + '</button>';
    }
    html += '<button ' + (p.page === p.pages ? 'disabled' : '') + ' onclick="location.hash=\'' + escAttr(baseHash + '&p=' + (p.page + 1)) + '\'">Next</button></div>';
    return html;
  }

  function parseQS() {
    var hash = window.location.hash || '';
    var q = {};
    var qs = hash.split('?')[1];
    if (qs) {
      qs.split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return q;
  }

  /* ---------------------------- Router ---------------------------- */
  var routes = {
    '': landing,
    '/': landing,
    '/tripura-ai': landing,
    '/governance': governanceList,
    '/funding': fundingList,
    '/problems': problemsList,
    '/opportunities': opportunitiesList,
    '/knowledge': knowledgeList,
    '/dashboard': dashboard,
    '/search': searchPage,
    '/admin': admin
  };

  /* Strip the module prefix so routes map keys are suffix paths. */
  function stripPrefix(path) {
    var p = path || '';
    if (p.indexOf('/tripura-ai') === 0) p = p.slice('/tripura-ai'.length);
    return p || '/';
  }

  function currentRoute() {
    var hash = window.location.hash || '';
    var path = stripPrefix(hash.split('?')[0].replace(/^#/, ''));
    var m = path.match(/^\/([a-z-]+)\/([a-zA-Z0-9-]+)$/);
    if (!m) return null;
    var base = '/' + m[1];
    /* Only the five detail-capable bases are treated as detail routes —
       /tripura-ai/* list pages (dashboard, search, admin, etc.) must fall
       through to the routes map. */
    if (['/governance', '/funding', '/problems', '/opportunities', '/knowledge'].indexOf(base) === -1) return null;
    return { base: base, id: m[2] };
  }

  function setActiveNav() {
    if (!topBar) return;
    var hash = window.location.hash || '';
    var path = (hash.split('?')[0].replace(/^#/, '') || '/');
    var seg = path.split('/')[1] || '';
    topBar.querySelectorAll('a[data-route]').forEach(function (a) {
      var r = a.getAttribute('data-route');
      a.classList.toggle('active', r === path || (r !== '/tripura-ai' && r.indexOf('/' + seg) !== -1));
    });
  }

  function render() {
    if (!root) return;
    var hash = window.location.hash || '';
    var path = stripPrefix(hash.split('?')[0].replace(/^#/, ''));
    var cr = currentRoute();
    setActiveNav();

    if (cr) {
      var detailView = {
        '/governance': schemeDetail, '/funding': fundingDetail,
        '/problems': problemDetail, '/opportunities': opportunityDetail,
        '/knowledge': knowledgeDetail
      }[cr.base];
      if (detailView) {
        root.innerHTML = loadingState(4);
        try { root.innerHTML = detailView(cr.id); }
        catch (err) {
          console.error('Tripura AI detail render error:', err);
          root.innerHTML = errorState('Something went wrong', 'The module hit an unexpected error while rendering this record. Please reload.', true);
        }
        window.scrollTo({ top: 0 });
        return;
      }
    }

    var fn = routes[path] || notFound;
    root.innerHTML = loadingState(4);
    /* simulate an async boundary so loading states are visible */
    setTimeout(function () {
      try { root.innerHTML = fn(); }
      catch (err) {
        console.error('Tripura AI render error:', err);
        root.innerHTML = errorState('Something went wrong', 'The module hit an unexpected error while rendering. Please reload.', true);
      }
      window.scrollTo({ top: 0 });
    }, 220);
  }

  function notFound() {
    return emptyState('Route not found', 'The page you are looking for does not exist inside the Tripura AI module.',
      '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai">Back to Tripura AI</a>');
  }

  /* ---------------------------- LANDING ---------------------------- */
  function landing() {
    var counts = {
      schemes: T.getSchemes().length, funding: T.getFunding().length,
      problems: T.getProblems().length, opportunities: T.getOpportunities().length,
      knowledge: T.getKnowledge().length
    };
    var verified = T.getSchemes().concat(T.getFunding(), T.getKnowledge())
      .filter(function (r) { return r.dataStatus === 'VERIFIED'; }).length;

    return '' +
      '<section class="tads-hero">' +
      '<span class="tads-eyebrow"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block"></span> Problem → Intelligence → Opportunity → Solution</span>' +
      '<h1>Tripura AI <span class="grad">Transformation</span></h1>' +
      '<p class="tads-lede">A serious regional AI innovation platform — mapping real problems in Tripura, verifying what is true, and connecting citizens, entrepreneurs and government to opportunities that can actually solve them.</p>' +
      '<div class="tads-hero-cta">' +
      '<a class="tads-btn tads-btn-primary" href="#/tripura-ai/dashboard">' + icon('dash') + ' Explore the Dashboard</a>' +
      '<a class="tads-btn tads-btn-ghost" href="#/tripura-ai/search">' + icon('search') + ' Search everything</a>' +
      '</div>' +
      '</section>' +

      '<div class="tads-pipe">' +
      '<div class="step"><div class="num">1</div><b>Real-world problem</b><span>Citizens and data describe what is broken</span></div>' +
      '<div class="step"><div class="num">2</div><b>Data collection</b><span>Verified sources, user reports, official records</span></div>' +
      '<div class="step"><div class="num">3</div><b>AI analysis</b><span>Categorisation, prioritisation, matching</span></div>' +
      '<div class="step"><div class="num">4</div><b>Opportunity</b><span>Who can act, where, and with what</span></div>' +
      '<div class="step"><div class="num">5</div><b>Solution</b><span>Enterprises, government and citizens respond</span></div>' +
      '<div class="step"><div class="num">6</div><b>Measurable impact</b><span>Tracked, verified, improved</span></div>' +
      '</div>' +

      '<div class="tads-trust-row">' +
      tag('Every record carries a source + verification status', 'acc') +
      tag(verified + ' records verified by DADSync research desk') +
      tag('AI-generated content is always labelled — never presented as fact') +
      '</div>' +

      '<div class="tads-section-head"><h2>Core modules</h2><p>Six working modules, one data layer, one search.</p></div>' +
      '<div class="tads-cards">' +
      moduleCard('gov', 'AI Governance Co-Pilot', 'Find real government schemes, services and application steps — with eligibility, documents, official sources and verification status for every record.', '#/tripura-ai/governance', counts.schemes + ' schemes & services') +
      moduleCard('fund', 'Startup & Funding Intelligence', 'Grants, loans, incubators and competitions matched to your entrepreneur profile with a transparent AI Match Score.', '#/tripura-ai/funding', counts.funding + ' funding records') +
      moduleCard('prob', 'Citizen Problem Intelligence', 'Report local problems; get AI-assisted categorisation and prioritisation. Track status honestly — never claiming government action without integration.', '#/tripura-ai/problems', counts.problems + ' problem records') +
      moduleCard('opp', 'Tripura Opportunity Map', 'District-by-district, sector-by-sector opportunity intelligence for agriculture, tourism, digital services, bamboo, solar and more.', '#/tripura-ai/opportunities', '8 districts · 13 sectors') +
      moduleCard('kb', 'Northeast AI Knowledge Hub', 'Plain-language explainers and how-to guides on AI, governance, agritech and the startup ecosystem — expandable to the Northeast.', '#/tripura-ai/knowledge', counts.knowledge + ' articles') +
      moduleCard('dash', 'DADSync AI Insight Dashboard', 'One screen: opportunities, problems, resolved counts, district coverage, sector distribution and verification mix.', '#/tripura-ai/dashboard', 'Live analytics') +
      '</div>' +

      '<div class="tads-section-head"><h2>Data quality &amp; verification</h2><p>Trust is the product. Four explicit states so you always know what you can rely on.</p></div>' +
      '<div class="tads-cards">' +
      '<div class="tads-card"><div class="tads-ico" style="color:#34d399">' + icon('check') + '</div><h3>Verified</h3><p>Checked by the DADSync research desk against an official source (source URL + verified-by + date shown on every record).</p></div>' +
      '<div class="tads-card"><div class="tads-ico" style="color:#fbbf24">' + icon('warn') + '</div><h3>Needs Verification</h3><p>Plausible but not yet re-checked — treat amounts, deadlines and eligibility as unconfirmed until an official source is attached.</p></div>' +
      '<div class="tads-card"><div class="tads-ico" style="color:#7dd3fc">' + icon('user') + '</div><h3>User Submitted</h3><p>Community-reported. Useful signal, never presented as government fact.</p></div>' +
      '<div class="tads-card"><div class="tads-ico" style="color:#a5b4cb">' + icon('ai') + '</div><h3>AI Generated</h3><p>Hypotheses and drafts produced by AI — explicitly labelled, awaiting validation against real data.</p></div>' +
      '</div>';

    function moduleCard(ico, title, desc, href, meta) {
      var icons = { gov: icon('gov'), fund: icon('fund'), prob: icon('prob'), opp: icon('opp'), kb: icon('kb'), dash: icon('dash') };
      return '<div class="tads-card"><div class="tads-ico">' + (icons[ico] || icon('gov')) + '</div>' +
        '<h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p>' +
        '<div class="tads-meta">' + tag(meta || '') + '</div>' +
        '<a class="tads-link" href="' + escAttr(href) + '">Open module ' + icon('arrow') + '</a></div>';
    }
  }

  /* ---------------------------- GOVERNANCE ---------------------------- */
  function governanceList() {
    var q = parseQS();
    var query = q.q || '';
    var district = q.district || 'ALL';
    var cat = q.cat || 'ALL';
    var status = q.status || 'ALL';
    var page = parseInt(q.p, 10) || 1;

    var filters = { district: district, category: cat, dataStatus: status };
    var res = T.searchSchemes(query, filters, page, 6);

    var districtOpts = '<option value="ALL">All districts</option>' + T.DISTRICTS.map(function (d) {
      return '<option value="' + escAttr(d) + '"' + (d === district ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    var catOpts = '<option value="ALL">All categories</option>' + T.GOV_CATEGORIES.map(function (c) {
      return '<option value="' + escAttr(c) + '"' + (c === cat ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    var statusOpts = '<option value="ALL">Any status</option>' + T.STATUS.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === status ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var cards = res.items.length ? res.items.map(function (r) {
      return '<div class="tads-rec">' +
        '<div class="tads-rec-top"><h3>' + esc(r.title) + '</h3>' + badge(r.dataStatus) + '</div>' +
        '<p class="tads-rec-desc">' + esc(r.summary) + '</p>' +
        '<div class="tads-rec-meta">' + tag(r.category, 'acc') + tag(r.district) + tag(r.type === 'service' ? 'Public Service' : 'Scheme') + '</div>' +
        '<div class="tads-rec-meta">' + sourceLine(r) + '</div>' +
        '<a class="tads-link" href="#/tripura-ai/governance/' + escAttr(r.id) + '">View details ' + icon('arrow') + '</a>' +
        '</div>';
    }).join('') : emptyState('No schemes found', 'Try a different search term or clear the filters.');

    return '' +
      '<div class="tads-section-head"><h2>AI Governance Co-Pilot</h2><p>Government schemes, public services, eligibility, documents and application steps. Every record shows its source and verification status — nothing is invented.</p></div>' +
      '<div class="tads-trust-note info">' + icon('warn') + '<div><b>Verification rule:</b> schemes marked <b>Verified</b> link to an official source checked by the DADSync desk. <b>Needs Verification</b> and <b>User Submitted</b> records must be confirmed with the issuing department before relying on amounts or deadlines. <b>AI Generated</b> placeholders contain no asserted facts.</div></div>' +
      '<div class="tads-toolbar">' +
      '<div class="tads-search">' + icon('search') + '<input id="gov-q" type="search" placeholder="Search schemes, services, departments…" value="' + escAttr(query) + '" oninput="debouncedGovSearch(this.value)"></div>' +
      '<select class="tads-select" id="gov-district" onchange="applyGovFilters()">' + districtOpts + '</select>' +
      '<select class="tads-select" id="gov-cat" onchange="applyGovFilters()">' + catOpts + '</select>' +
      '<select class="tads-select" id="gov-status" onchange="applyGovFilters()">' + statusOpts + '</select>' +
      '</div>' +
      '<div class="tads-grid">' + cards + '</div>' +
      pager(res, '#/tripura-ai/governance?q=' + encodeURIComponent(query) + '&district=' + encodeURIComponent(district) + '&cat=' + encodeURIComponent(cat) + '&status=' + encodeURIComponent(status)) +
      '<div class="tads-note" style="margin-top:18px">Showing ' + res.total + ' records · ' + res.items.length + ' on this page. Want to add or correct a scheme? Use the <a href="#/tripura-ai/admin" style="color:var(--t-accent)">admin panel</a> (data is stored locally until a backend is connected).</div>';

    function sourceLine(r) {
      if (!r.source) return '';
      return '<span class="tads-source-line" style="font-size:0.72rem">' + icon('src') + ' ' + esc(r.source) +
        (r.verificationDate ? ' · verified ' + esc(r.verificationDate) : '') + '</span>';
    }
  }

  window.applyGovFilters = function () {
    var d = document.getElementById('gov-district').value;
    var c = document.getElementById('gov-cat').value;
    var s = document.getElementById('gov-status').value;
    var q = (document.getElementById('gov-q').value || '').trim();
    go('/tripura-ai/governance?q=' + encodeURIComponent(q) + '&district=' + encodeURIComponent(d) + '&cat=' + encodeURIComponent(c) + '&status=' + encodeURIComponent(s));
  };
  window.debouncedGovSearch = (function () {
    var t = null;
    return function (v) { clearTimeout(t); t = setTimeout(function () { window.applyGovFilters(); }, 400); };
  })();

  function schemeDetail(id) {
    var r = T.getRecord('schemes', id);
    if (!r) return emptyState('Scheme not found', 'This record may have been archived.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/governance">Back to Governance</a>');
    var list = function (arr) { return '<ul class="tads-list">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; };
    var trustNote = r.dataStatus === 'VERIFIED'
      ? '<div class="tads-trust-note ok">' + icon('check') + '<div><b>Verified record.</b> Checked by ' + esc(r.verifiedBy || 'DADSync research desk') + ' on ' + esc(r.verificationDate || '') + ' against the official source below.</div></div>'
      : '<div class="tads-trust-note">' + icon('warn') + '<div><b>' + esc(r.dataStatus) + '.</b> This record has not been fully verified against an official source. Do not rely on the details below for applications — confirm with the issuing department first.</div></div>';

    var related = T.getSchemes().filter(function (x) { return x.id !== r.id && (x.category === r.category || x.district === r.district); }).slice(0, 3);

    return '' +
      '<a class="tads-back" href="#/tripura-ai/governance">' + icon('back') + ' Back to Governance Co-Pilot</a>' +
      '<div class="tads-detail">' +
      '<div class="tads-rec-meta">' + tag(r.category, 'acc') + tag(r.district) + badge(r.dataStatus) + '</div>' +
      '<h1>' + esc(r.title) + '</h1>' +
      '<p class="tads-lede">' + esc(r.summary) + '</p>' +
      trustNote +
      '<div class="tads-panel"><h3>' + icon('user') + ' Who is eligible?</h3>' + list(r.eligible || ['Eligibility details to be verified']) + '</div>' +
      '<div class="tads-panel"><h3>' + icon('doc') + ' Documents required</h3>' + list(r.documents || ['Document list to be verified']) + '</div>' +
      '<div class="tads-panel"><h3>' + icon('gov') + ' How to apply</h3>' + list(r.howToApply || ['Application procedure to be verified']) + '</div>' +
      '<div class="tads-panel"><h3>' + icon('src') + ' Official source &amp; verification</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Source:</b> ' + (r.source ? esc(r.source) : 'Not attached') + '</span>' +
      (r.sourceUrl ? '<span><b>URL:</b> <a href="' + escAttr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.sourceUrl) + '</a></span>' : '') +
      '<span><b>Department:</b> ' + (r.dept ? esc(r.dept) : '—') + '</span>' +
      '<span><b>Verified by:</b> ' + (r.verifiedBy ? esc(r.verifiedBy) : 'Not yet verified') + '</span>' +
      '<span><b>Last verified:</b> ' + (r.verificationDate ? esc(r.verificationDate) : 'Not yet verified') + '</span>' +
      '</div>' +
      (r.notes ? '<p class="tads-note" style="margin-top:12px">' + esc(r.notes) + '</p>' : '') +
      '</div>' +
      (related.length ? '<div class="tads-section-head" style="margin-top:28px"><h2>Related schemes &amp; services</h2></div><div class="tads-cards">' + related.map(function (x) {
        return '<div class="tads-card"><div class="tads-rec-meta">' + tag(x.category, 'acc') + badge(x.dataStatus) + '</div><h3>' + esc(x.title) + '</h3><p>' + esc(x.summary) + '</p><a class="tads-link" href="#/tripura-ai/governance/' + escAttr(x.id) + '">View ' + icon('arrow') + '</a></div>';
      }).join('') + '</div>' : '') +
      '</div>';
  }

  /* ---------------------------- FUNDING ---------------------------- */
  function fundingList() {
    var q = parseQS();
    var query = q.q || '';
    var district = q.district || 'ALL';
    var sector = q.sector || 'ALL';
    var page = parseInt(q.p, 10) || 1;
    var profile = T.getProfile();
    var showScores = !!(profile && profile.sector);

    var res = T.searchFunding(query, { district: district, sector: sector }, page, 6);

    var districtOpts = '<option value="ALL">All districts</option>' + T.DISTRICTS.concat(['Urban areas']).map(function (d) {
      return '<option value="' + escAttr(d) + '"' + (d === district ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    var sectorOpts = '<option value="ALL">All sectors</option>' + T.SECTORS.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === sector ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var cards = res.items.length ? res.items.map(function (r) {
      var m = showScores ? T.matchScore(r, profile) : null;
      return '<div class="tads-rec">' +
        '<div class="tads-rec-top"><h3>' + esc(r.title) + '</h3>' + badge(r.dataStatus) + '</div>' +
        '<p class="tads-rec-desc">' + esc(r.summary) + '</p>' +
        '<div class="tads-rec-meta">' + tag(r.org || 'Issuer TBD', 'acc') + tag(r.type || 'Opportunity') + tag(r.amount || 'Amount TBD') + (r.deadline ? tag('Due ' + r.deadline) : tag('No deadline listed')) + '</div>' +
        (m ? '<div class="tads-score" style="margin:6px 0 0;padding:12px;gap:14px"><div class="tads-score-ring" style="width:58px;height:58px"><svg width="58" height="58"><circle cx="29" cy="29" r="25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/><circle cx="29" cy="29" r="25" fill="none" stroke="' + scoreColor(m.score) + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (157 * m.score / 100) + ' 157"/></svg><span class="num" style="font-size:0.95rem">' + m.score + '%</span></div><div style="font-size:0.76rem;color:var(--t-soft)"><b>AI Match Score</b> — ' + (m.reasons[0] || '') + '</div></div>' : '') +
        '<div class="tads-rec-meta">' + saveBtn(r.id) + '</div>' +
        '<a class="tads-link" href="#/tripura-ai/funding/' + escAttr(r.id) + '">View opportunity ' + icon('arrow') + '</a>' +
        '</div>';
    }).join('') : emptyState('No funding opportunities found', 'Try a different search or filter.', '<a class="tads-btn tads-btn-ghost tads-btn-sm" href="#/tripura-ai/funding">Clear filters</a>');

    return '' +
      '<div class="tads-section-head"><h2>Startup &amp; Funding Intelligence</h2><p>Grants, loans, incubators and competitions for Tripura entrepreneurs. Build your profile to get an AI Match Score on every opportunity.</p></div>' +
      '<div class="tads-trust-note info">' + icon('warn') + '<div><b>Honesty rule:</b> opportunities marked <b>Verified</b> have an official source. <b>Needs Verification</b> / <b>User Submitted</b> / <b>AI Generated</b> records show no fabricated amounts or deadlines — confirm terms with the issuing organisation.</div></div>' +
      '<div class="tads-toolbar">' +
      '<div class="tads-search">' + icon('search') + '<input id="fund-q" type="search" placeholder="Search grants, loans, incubators…" value="' + escAttr(query) + '" oninput="debouncedFundSearch(this.value)"></div>' +
      '<select class="tads-select" id="fund-district" onchange="applyFundFilters()">' + districtOpts + '</select>' +
      '<select class="tads-select" id="fund-sector" onchange="applyFundFilters()">' + sectorOpts + '</select>' +
      '<a class="tads-btn tads-btn-ghost tads-btn-sm" href="#/tripura-ai/funding?profile=1">' + icon('user') + (profile ? ' Edit profile' : ' Build my profile') + '</a>' +
      '</div>' +
      (profile && profile.sector
        ? '<div class="tads-panel" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><span style="font-size:0.85rem;color:var(--t-soft)"><b>Your profile:</b> ' + esc(profile.sector) + (profile.district ? ' · ' + esc(profile.district) : '') + (profile.stage ? ' · ' + esc(profile.stage) + ' stage' : '') + '</span><a class="tads-btn tads-btn-ghost tads-btn-sm" href="#/tripura-ai/funding?profile=1">Update</a></div>'
        : '<div class="tads-panel" style="padding:14px 18px;font-size:0.85rem;color:var(--t-soft)">' + icon('user') + ' <b>Tip:</b> ' + (showScores ? '' : 'Set up your entrepreneur profile to unlock AI Match Scores and personalised filtering. ') + '<a href="#/tripura-ai/funding?profile=1" style="color:var(--t-accent)">Build my profile →</a></div>') +
      '<div class="tads-grid">' + cards + '</div>' +
      pager(res, '#/tripura-ai/funding?q=' + encodeURIComponent(query) + '&district=' + encodeURIComponent(district) + '&sector=' + encodeURIComponent(sector));
  }

  function scoreColor(s) { return s >= 70 ? '#10b981' : (s >= 40 ? '#f59e0b' : '#f43f5e'); }

  window.applyFundFilters = function () {
    var d = document.getElementById('fund-district').value;
    var s = document.getElementById('fund-sector').value;
    var q = (document.getElementById('fund-q').value || '').trim();
    go('/tripura-ai/funding?q=' + encodeURIComponent(q) + '&district=' + encodeURIComponent(d) + '&sector=' + encodeURIComponent(s));
  };
  window.debouncedFundSearch = (function () {
    var t = null;
    return function (v) { clearTimeout(t); t = setTimeout(function () { window.applyFundFilters(); }, 400); };
  })();

  function saveBtn(id) {
    var on = T.isSaved(id);
    return '<button class="tads-saved-btn' + (on ? ' on' : '') + '" data-save="' + escAttr(id) + '" onclick="toggleSave(\'' + escAttr(id) + '\')">' + icon('save') + (on ? ' Saved' : ' Save') + '</button>';
  }
  window.toggleSave = function (id) {
    var on = T.toggleSaved(id);
    toast(on ? 'Opportunity saved to your list' : 'Removed from saved list');
    document.querySelectorAll('[data-save="' + id + '"]').forEach(function (b) {
      b.classList.toggle('on', on);
      b.innerHTML = icon('save') + (on ? ' Saved' : ' Save');
    });
  };

  function fundingDetail(id) {
    var r = T.getRecord('funding', id);
    if (!r) return emptyState('Opportunity not found', 'This opportunity may have been archived.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/funding">Back to Funding</a>');
    var profile = T.getProfile();
    var m = profile && profile.sector ? T.matchScore(r, profile) : null;
    var list = function (arr) { return '<ul class="tads-list">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; };

    return '' +
      '<a class="tads-back" href="#/tripura-ai/funding">' + icon('back') + ' Back to Funding Intelligence</a>' +
      '<div class="tads-detail">' +
      '<div class="tads-rec-meta">' + tag(r.type || 'Opportunity', 'acc') + tag(r.sector || 'General') + tag(r.district || 'All districts') + badge(r.dataStatus) + '</div>' +
      '<h1>' + esc(r.title) + '</h1>' +
      '<p class="tads-lede">' + esc(r.summary) + '</p>' +
      (r.dataStatus !== 'VERIFIED' ? '<div class="tads-trust-note">' + icon('warn') + '<div><b>' + esc(r.dataStatus) + '.</b> Terms (amounts, deadlines, eligibility) on this record are unconfirmed. Always verify with the issuing organisation before applying.</div></div>' : '') +
      (m ? '<div class="tads-score"><div class="tads-score-ring"><svg width="84" height="84"><circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/><circle cx="42" cy="42" r="36" fill="none" stroke="' + scoreColor(m.score) + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (226 * m.score / 100) + ' 226"/></svg><span class="num">' + m.score + '%</span></div><ul class="tads-score-reasons"><li><b>Why this match?</b> AI Match Score is a transparent, rule-based estimate of fit between your profile and this opportunity — it is an aid, not a guarantee of approval.</li>' + m.reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div class="tads-panel"><h3>' + icon('user') + ' Who can apply?</h3>' + list(r.eligible || ['Eligibility to be verified']) + '</div>' +
      '<div class="tads-panel"><h3>' + icon('fund') + ' Opportunity details</h3>' +
      '<div class="tads-source-line" style="flex-direction:column;gap:6px">' +
      '<span><b>Issuing organisation:</b> ' + (r.org ? esc(r.org) : 'To be confirmed') + '</span>' +
      '<span><b>Type:</b> ' + esc(r.type || '—') + '</span>' +
      '<span><b>Stage:</b> ' + esc(r.stage || '—') + '</span>' +
      '<span><b>Amount / support:</b> ' + esc(r.amount || 'Not disclosed') + '</span>' +
      '<span><b>Deadline:</b> ' + (r.deadline ? esc(r.deadline) : 'Not announced — check with the issuer') + '</span>' +
      '<span><b>Sector focus:</b> ' + esc(r.sector || '—') + '</span>' +
      '</div></div>' +
      '<div class="tads-panel"><h3>' + icon('src') + ' Source &amp; verification</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Source:</b> ' + (r.source ? esc(r.source) : 'Not attached') + '</span>' +
      (r.sourceUrl ? '<span><b>URL:</b> <a href="' + escAttr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.sourceUrl) + '</a></span>' : '') +
      '<span><b>Verified by:</b> ' + (r.verifiedBy ? esc(r.verifiedBy) : 'Not yet verified') + '</span>' +
      '<span><b>Last verified:</b> ' + (r.verificationDate ? esc(r.verificationDate) : 'Not yet verified') + '</span>' +
      '</div>' +
      (r.notes ? '<p class="tads-note" style="margin-top:12px">' + esc(r.notes) + '</p>' : '') +
      '</div>' +
      '<div class="tads-form-actions">' + saveBtn(r.id) + '</div>' +
      '</div>';
  }

  /* ---------------------------- PROBLEMS ---------------------------- */
  function problemsList() {
    var q = parseQS();
    var view = q.view || 'report';
    if (view === 'report') return problemReport();
    return problemBrowse(q);
  }

  function problemReport() {
    var districts = '<option value="">Select district</option>' + T.DISTRICTS.map(function (d) {
      return '<option value="' + escAttr(d) + '">' + esc(d) + '</option>';
    }).join('');
    var cats = '<option value="">Let AI suggest…</option>' + T.PROBLEM_CATEGORIES.map(function (c) {
      return '<option value="' + escAttr(c) + '">' + esc(c) + '</option>';
    }).join('');

    return '' +
      '<div class="tads-section-head"><h2>Citizen Problem Intelligence</h2><p>Report a local problem. AI suggests a category and priority — you stay in control. Your report is stored locally in this demo build; nothing is sent anywhere until a backend is connected.</p></div>' +
      '<div class="tads-tabs">' +
      '<a class="tads-tab active" href="#/tripura-ai/problems?view=report">' + icon('doc') + ' Report a problem</a>' +
      '<a class="tads-tab" href="#/tripura-ai/problems?view=browse">' + icon('search') + ' Browse &amp; track problems</a>' +
      '</div>' +
      '<div class="tads-panel tads-form tads-form-card">' +
      '<h3>Submit a problem</h3>' +
      '<div class="tads-field"><label for="p-title">Title *</label><input class="tads-input" id="p-title" type="text" maxlength="140" placeholder="e.g. Potholes on NH-8 near Dharmanagar market" required><div class="tads-error" id="p-title-err"></div></div>' +
      '<div class="tads-field"><label for="p-desc">Description *</label><textarea class="tads-textarea" id="p-desc" rows="4" maxlength="1000" placeholder="What is happening, since when, and how does it affect people?" required></textarea><div class="tads-error" id="p-desc-err"></div></div>' +
      '<div class="tads-row">' +
      '<div class="tads-field"><label for="p-cat">Category</label><select class="tads-select" id="p-cat">' + cats + '</select><span class="tads-hint" id="p-ai-suggest"></span></div>' +
      '<div class="tads-field"><label for="p-district">District *</label><select class="tads-select" id="p-district">' + districts + '</select><div class="tads-error" id="p-district-err"></div></div>' +
      '</div>' +
      '<div class="tads-row">' +
      '<div class="tads-field"><label for="p-loc">Location</label><input class="tads-input" id="p-loc" type="text" maxlength="120" placeholder="Ward / locality / landmark (optional)"></div>' +
      '<div class="tads-field"><label for="p-contact">Contact (optional)</label><input class="tads-input" id="p-contact" type="text" maxlength="60" placeholder="Email / phone if officials may follow up"></div>' +
      '</div>' +
      '<div class="tads-field"><label for="p-image">Photo (optional)</label><input class="tads-input" id="p-image" type="text" maxlength="400" placeholder="Paste an image URL (hosted image only — no uploads in this build)"></div>' +
      '<div class="tads-check"><input type="checkbox" id="p-consent"><span>I confirm this is a genuine local issue as best I know, and I understand the report is stored locally (demo build) and not yet sent to any government department.</span></div>' +
      '<div class="tads-form-actions"><button class="tads-btn tads-btn-primary" id="p-submit" onclick="submitProblem()">' + icon('arrow') + ' Submit problem</button></div>' +
      '</div>' +
      '<div class="tads-note" style="margin-top:16px">' + icon('warn') + ' DADSync does not claim any government department has received or acted on a complaint unless a real integration exists. Track status honestly in the browse view.</div>';

    /* AI suggestion is wired in problemReportJS() after render */
  }

  window.problemReportJS = function () {
    var desc = document.getElementById('p-desc');
    var cat = document.getElementById('p-cat');
    var suggest = document.getElementById('p-ai-suggest');
    if (!desc || !cat || !suggest) return;
    desc.addEventListener('input', function () {
      var title = (document.getElementById('p-title').value || '') + ' ' + desc.value;
      if (title.trim().length < 8) { suggest.textContent = 'AI will suggest a category as you type…'; return; }
      var a = T.aiAnalyse((document.getElementById('p-title').value || ''), desc.value);
      var has = false;
      for (var i = 0; i < cat.options.length; i++) { if (cat.options[i].value === a.category) { cat.selectedIndex = i; has = true; break; } }
      suggest.innerHTML = 'AI suggests: <b>' + esc(a.category) + '</b> · priority <b>' + esc(a.priority) + '</b> (confidence ' + Math.round(a.confidence * 100) + '%). Review and adjust if needed.';
    });
  };

  window.submitProblem = function () {
    var title = (document.getElementById('p-title').value || '').trim();
    var desc = (document.getElementById('p-desc').value || '').trim();
    var district = document.getElementById('p-district').value;
    var consent = document.getElementById('p-consent').checked;
    var errs = 0;

    function setErr(id, msg) { var el = document.getElementById(id); if (el) { el.textContent = msg || ''; } if (msg) errs++; }

    setErr('p-title-err', title.length < 8 ? 'Please enter a short, clear title (at least 8 characters).' : '');
    setErr('p-desc-err', desc.length < 20 ? 'Please describe the problem in at least 20 characters.' : '');
    setErr('p-district-err', district ? '' : 'Please select a district.');
    if (!consent) { toast('Please confirm the consent checkbox before submitting.'); return; }
    if (errs) { toast('Please fix the highlighted fields.'); return; }

    var ai = T.aiAnalyse(title, desc);
    var rec = T.addProblem({
      title: title, description: desc, district: district,
      location: (document.getElementById('p-loc').value || '').trim(),
      contact: (document.getElementById('p-contact').value || '').trim(),
      image: (document.getElementById('p-image').value || '').trim(),
      category: document.getElementById('p-cat').value || ai.category,
      priority: ai.priority, aiCategorisation: ai.category, aiPriority: ai.priority, aiConfidence: ai.confidence
    });
    toast('Problem submitted — tracked locally. Thank you for reporting.');
    go('/tripura-ai/problems?view=browse&highlight=' + rec.id);
  };

  function problemBrowse(q) {
    var query = q.q || '';
    var district = q.district || 'ALL';
    var status = q.status || 'ALL';
    var cat = q.cat || 'ALL';
    var page = parseInt(q.p, 10) || 1;
    var highlight = q.highlight || '';

    var res = T.searchProblems(query, { district: district, status: status, category: cat }, page, 8);

    var districtOpts = '<option value="ALL">All districts</option>' + T.DISTRICTS.map(function (d) {
      return '<option value="' + escAttr(d) + '"' + (d === district ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    var statusOpts = '<option value="ALL">All statuses</option>' + T.PROBLEM_STATUSES.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === status ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var catOpts = '<option value="ALL">All categories</option>' + T.PROBLEM_CATEGORIES.map(function (c) {
      return '<option value="' + escAttr(c) + '"' + (c === cat ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    var cards = res.items.length ? res.items.map(function (r) {
      var hl = r.id === highlight ? ' style="outline:2px solid var(--t-accent);outline-offset:2px"' : '';
      return '<div class="tads-rec"' + hl + '>' +
        '<div class="tads-rec-top"><h3>' + esc(r.title) + '</h3>' + statusBadge(r.status) + '</div>' +
        '<p class="tads-rec-desc">' + esc(r.description) + '</p>' +
        '<div class="tads-rec-meta">' + tag(r.category, 'acc') + tag(r.district) + tag(r.location || 'Location not specified') + (r.priority ? tag(r.priority + ' priority') : '') + '</div>' +
        '<div class="tads-rec-meta">' +
        '<span class="tads-mini">AI: ' + esc(r.aiCategorisation || '—') + ' · priority ' + esc(r.aiPriority || '—') + ' · conf. ' + (r.aiConfidence != null ? Math.round(r.aiConfidence * 100) + '%' : '—') + '</span>' +
        badge(r.dataStatus) +
        '</div>' +
        '<div class="tads-rec-meta"><span class="tads-mini">' + esc(fmtDate(r.submittedAt)) + ' · ' + esc(r.source || '') + '</span></div>' +
        '<a class="tads-link" href="#/tripura-ai/problems/' + escAttr(r.id) + '">View details ' + icon('arrow') + '</a>' +
        '</div>';
    }).join('') : emptyState('No problems match', 'Try different filters or report a new problem.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/problems?view=report">Report a problem</a>');

    return '' +
      '<div class="tads-section-head"><h2>Citizen Problem Intelligence</h2><p>Browse citizen-reported problems with honest statuses. Status changes here are demo/local — DADSync does not claim government acknowledgement without a real integration.</p></div>' +
      '<div class="tads-tabs">' +
      '<a class="tads-tab" href="#/tripura-ai/problems?view=report">' + icon('doc') + ' Report a problem</a>' +
      '<a class="tads-tab active" href="#/tripura-ai/problems?view=browse">' + icon('search') + ' Browse &amp; track</a>' +
      '<a class="tads-tab" href="#/tripura-ai/dashboard">' + icon('dash') + ' Problem dashboard</a>' +
      '</div>' +
      '<div class="tads-toolbar">' +
      '<div class="tads-search">' + icon('search') + '<input id="prob-q" type="search" placeholder="Search problems…" value="' + escAttr(query) + '" oninput="debouncedProbSearch(this.value)"></div>' +
      '<select class="tads-select" id="prob-district" onchange="applyProbFilters()">' + districtOpts + '</select>' +
      '<select class="tads-select" id="prob-status" onchange="applyProbFilters()">' + statusOpts + '</select>' +
      '<select class="tads-select" id="prob-cat" onchange="applyProbFilters()">' + catOpts + '</select>' +
      '</div>' +
      '<div class="tads-grid">' + cards + '</div>' +
      pager(res, '#/tripura-ai/problems?view=browse&q=' + encodeURIComponent(query) + '&district=' + encodeURIComponent(district) + '&status=' + encodeURIComponent(status) + '&cat=' + encodeURIComponent(cat));
  }

  window.applyProbFilters = function () {
    var d = document.getElementById('prob-district').value;
    var s = document.getElementById('prob-status').value;
    var c = document.getElementById('prob-cat').value;
    var q = (document.getElementById('prob-q').value || '').trim();
    go('/tripura-ai/problems?view=browse&q=' + encodeURIComponent(q) + '&district=' + encodeURIComponent(d) + '&status=' + encodeURIComponent(s) + '&cat=' + encodeURIComponent(c));
  };
  window.debouncedProbSearch = (function () {
    var t = null;
    return function (v) { clearTimeout(t); t = setTimeout(function () { window.applyProbFilters(); }, 400); };
  })();

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function problemDetail(id) {
    var r = T.getRecord('problems', id);
    if (!r) return emptyState('Problem not found', 'This report may have been removed.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/problems?view=browse">Back to problems</a>');

    var statusOptions = T.PROBLEM_STATUSES.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === r.status ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    return '' +
      '<a class="tads-back" href="#/tripura-ai/problems?view=browse">' + icon('back') + ' Back to problems</a>' +
      '<div class="tads-detail">' +
      '<div class="tads-rec-meta">' + tag(r.category, 'acc') + tag(r.district) + tag(r.location || 'Location not specified') + statusBadge(r.status) + '</div>' +
      '<h1>' + esc(r.title) + '</h1>' +
      '<p class="tads-lede">' + esc(r.description) + '</p>' +
      '<div class="tads-panel"><h3>' + icon('ai') + ' AI-assisted analysis</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Suggested category:</b> ' + esc(r.aiCategorisation || '—') + '</span>' +
      '<span><b>Suggested priority:</b> ' + esc(r.aiPriority || '—') + '</span>' +
      '<span><b>Confidence:</b> ' + (r.aiConfidence != null ? Math.round(r.aiConfidence * 100) + '%' : '—') + '</span>' +
      '</div>' +
      '<p class="tads-note" style="margin-top:10px">AI categorisation is a keyword-based heuristic (offline, no external call). It helps triage but does not replace human review.</p>' +
      '</div>' +
      '<div class="tads-panel"><h3>' + icon('cal') + ' Status &amp; timeline</h3>' +
      '<div class="tads-field"><label>Update status (demo/admin control — local only)</label><select class="tads-select" id="prob-status-edit" onchange="updateProblemStatus(\'' + escAttr(r.id) + '\', this.value)">' + statusOptions + '</select></div>' +
      '<div class="tads-source-line" style="margin-top:10px">' +
      '<span><b>Submitted:</b> ' + esc(fmtDate(r.submittedAt)) + '</span>' +
      '<span><b>Last verified:</b> ' + (r.verificationDate ? esc(r.verificationDate) : 'Not yet verified') + '</span>' +
      '</div>' +
      '<p class="tads-note" style="margin-top:10px">' + icon('warn') + ' Statuses are managed locally in this build. A "Resolved" status here does NOT mean any department confirmed a fix — that would require a real government integration.</p>' +
      '</div>' +
      '<div class="tads-panel"><h3>' + icon('src') + ' Source &amp; verification</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Source:</b> ' + esc(r.source || '—') + '</span>' +
      '<span><b>Data status:</b> ' + esc(r.dataStatus || '—') + '</span>' +
      (r.contact ? '<span><b>Contact on file:</b> provided by reporter (not displayed publicly)</span>' : '') +
      '</div>' +
      (r.image ? '<p class="tads-note" style="margin-top:12px">' + icon('pin') + ' <a href="' + escAttr(r.image) + '" target="_blank" rel="noopener noreferrer" style="color:var(--t-accent)">View attached photo</a></p>' : '') +
      (r.resolutionNote ? '<p class="tads-note" style="margin-top:12px"><b>Note:</b> ' + esc(r.resolutionNote) + '</p>' : '') +
      '</div>' +
      '</div>';
  }

  window.updateProblemStatus = function (id, status) {
    T.updateRecord('problems', id, { status: status });
    toast('Status updated to "' + status + '" (local only)');
  };

  /* ---------------------------- OPPORTUNITIES (MAP) ---------------------------- */
  function opportunitiesList() {
    var q = parseQS();
    var district = q.district || 'ALL';
    var sector = q.sector || 'ALL';
    var page = parseInt(q.p, 10) || 1;

    var res = T.searchOpportunities(q.q || '', { district: district, sector: sector }, page, 6);

    var districtCards = '<button class="tads-district' + (district === 'ALL' ? ' active' : '') + '" onclick="location.hash=\'#/tripura-ai/opportunities?district=ALL' + (sector !== 'ALL' ? '&sector=' + encodeURIComponent(sector) : '') + '\'"><b>All districts</b><span>' + T.getOpportunities().length + ' opportunities</span></button>' +
      T.DISTRICTS.map(function (d) {
        var n = T.getOpportunities().filter(function (o) { return o.district === d; }).length;
        return '<button class="tads-district' + (d === district ? ' active' : '') + '" onclick="location.hash=\'#/tripura-ai/opportunities?district=' + encodeURIComponent(d) + (sector !== 'ALL' ? '&sector=' + encodeURIComponent(sector) : '') + '\'"><b>' + esc(d) + '</b><span>' + n + ' opportunities</span></button>';
      }).join('');

    var sectorOpts = '<option value="ALL">All sectors</option>' + T.SECTORS.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === sector ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var cards = res.items.length ? res.items.map(function (o) {
      return '<div class="tads-rec">' +
        '<div class="tads-rec-top"><h3>' + esc(o.title) + '</h3>' + badge(o.dataStatus) + '</div>' +
        '<div class="tads-rec-meta">' + tag(o.sector, 'acc') + tag(o.district) + tag('Difficulty: ' + o.difficulty) + tag('Impact: ' + o.impact) + '</div>' +
        '<p class="tads-rec-desc"><b>Problem:</b> ' + esc(o.problem) + '</p>' +
        '<p class="tads-rec-desc"><b>Opportunity:</b> ' + esc(o.solution) + '</p>' +
        '<div class="tads-rec-meta"><span class="tads-mini">' + esc(o.stakeholders || '') + '</span></div>' +
        '<a class="tads-link" href="#/tripura-ai/opportunities/' + escAttr(o.id) + '">View opportunity ' + icon('arrow') + '</a>' +
        '</div>';
    }).join('') : emptyState('No opportunities match', 'Try another district or sector.', '<button class="tads-btn tads-btn-ghost tads-btn-sm" onclick="location.hash=\'#/tripura-ai/opportunities\'">Reset filters</button>');

    return '' +
      '<div class="tads-section-head"><h2>Tripura Opportunity Map</h2><p>District-by-district, sector-by-sector opportunity intelligence. Select a district or sector to focus the map. All opportunity records are <b>AI-generated hypotheses</b> until validated with district-level data — clearly labelled, never presented as official analysis.</p></div>' +
      '<div class="tads-districts">' + districtCards + '</div>' +
      '<div class="tads-toolbar">' +
      '<select class="tads-select" id="opp-sector" onchange="applyOppFilters()">' + sectorOpts + '</select>' +
      '<span class="tads-mini" style="margin-left:auto">' + res.total + ' opportunities shown</span>' +
      '</div>' +
      '<div class="tads-grid">' + cards + '</div>' +
      pager(res, '#/tripura-ai/opportunities?district=' + encodeURIComponent(district) + '&sector=' + encodeURIComponent(sector));
  }

  window.applyOppFilters = function () {
    var s = document.getElementById('opp-sector').value;
    var q = parseQS();
    go('/tripura-ai/opportunities?district=' + encodeURIComponent(q.district || 'ALL') + '&sector=' + encodeURIComponent(s));
  };

  function opportunityDetail(id) {
    var o = T.getRecord('opportunities', id);
    if (!o) return emptyState('Opportunity not found', 'This opportunity may have been archived.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/opportunities">Back to the map</a>');

    return '' +
      '<a class="tads-back" href="#/tripura-ai/opportunities">' + icon('back') + ' Back to Opportunity Map</a>' +
      '<div class="tads-detail">' +
      '<div class="tads-rec-meta">' + tag(o.sector, 'acc') + tag(o.district) + tag('Difficulty: ' + o.difficulty) + tag('Potential impact: ' + o.impact) + badge(o.dataStatus) + '</div>' +
      '<h1>' + esc(o.title) + '</h1>' +
      '<div class="tads-trust-note">' + icon('warn') + '<div><b>' + esc(o.dataStatus) + '.</b> This is an AI-drafted hypothesis for discussion — it is not an official study or government data. Validate with district-level data and stakeholders before any investment.</div></div>' +
      '<div class="tads-panel"><h3>' + icon('prob') + ' Problem / opportunity</h3>' +
      '<div class="tads-source-line" style="flex-direction:column;gap:8px">' +
      '<span><b>Problem:</b> ' + esc(o.problem) + '</span>' +
      '<span><b>Potential solution:</b> ' + esc(o.solution) + '</span>' +
      '</div></div>' +
      '<div class="tads-panel"><h3>' + icon('doc') + ' Required resources</h3><ul class="tads-list">' + (o.resources ? String(o.resources).split(',').map(function (x) { return '<li>' + esc(x.trim()) + '</li>'; }).join('') : '<li>To be scoped during validation</li>') + '</ul></div>' +
      '<div class="tads-panel"><h3>' + icon('user') + ' Potential stakeholders</h3><ul class="tads-list">' + (o.stakeholders ? String(o.stakeholders).split(',').map(function (x) { return '<li>' + esc(x.trim()) + '</li>'; }).join('') : '<li>To be identified</li>') + '</ul></div>' +
      '<div class="tads-panel"><h3>' + icon('dash') + ' Assessment &amp; verification</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Estimated difficulty:</b> ' + esc(o.difficulty) + '</span>' +
      '<span><b>Potential impact:</b> ' + esc(o.impact) + '</span>' +
      '<span><b>Source / data reference:</b> ' + (o.source ? esc(o.source) : 'None attached') + '</span>' +
      '<span><b>Verified by:</b> ' + (o.verifiedBy ? esc(o.verifiedBy) : 'Not yet verified') + '</span>' +
      '<span><b>Verification date:</b> ' + (o.verificationDate ? esc(o.verificationDate) : '—') + '</span>' +
      '</div>' +
      (o.notes ? '<p class="tads-note" style="margin-top:12px">' + esc(o.notes) + '</p>' : '') +
      '</div>' +
      '</div>';
  }

  /* ---------------------------- KNOWLEDGE ---------------------------- */
  function knowledgeList() {
    var q = parseQS();
    var cat = q.cat || 'ALL';
    var page = parseInt(q.p, 10) || 1;
    var res = T.searchKnowledge(q.q || '', { category: cat }, page, 6);

    var catOpts = '<option value="ALL">All categories</option>' + T.KNOWLEDGE_CATEGORIES.map(function (c) {
      return '<option value="' + escAttr(c) + '"' + (c === cat ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    var cards = res.items.length ? res.items.map(function (a) {
      return '<div class="tads-rec tads-kb-card">' +
        '<span class="tads-kb-cat">' + esc(a.category) + '</span>' +
        '<div class="tads-rec-top"><h3>' + esc(a.title) + '</h3>' + badge(a.dataStatus) + '</div>' +
        '<p class="tads-rec-desc">' + esc(a.summary) + '</p>' +
        '<div class="tads-kb-tags">' + (a.tags || []).map(function (t) { return tag(t); }).join('') + '</div>' +
        '<div class="tads-rec-meta"><span class="tads-mini">Published ' + esc(a.publishedDate || '—') + (a.verificationDate ? ' · verified ' + esc(a.verificationDate) : '') + '</span></div>' +
        '<a class="tads-link" href="#/tripura-ai/knowledge/' + escAttr(a.id) + '">Read article ' + icon('arrow') + '</a>' +
        '</div>';
    }).join('') : emptyState('No articles found', 'Try another category or search term.');

    return '' +
      '<div class="tads-section-head"><h2>Northeast AI Knowledge Hub</h2><p>Explaners, how-to guides and explainers on AI, governance, agritech and the startup ecosystem — Tripura-first, expandable to the whole Northeast. No fake news, stats or citations: every article carries a source and verification status.</p></div>' +
      '<div class="tads-toolbar">' +
      '<div class="tads-search">' + icon('search') + '<input id="kb-q" type="search" placeholder="Search articles…" value="' + escAttr(q.q || '') + '" oninput="debouncedKbSearch(this.value)"></div>' +
      '<select class="tads-select" id="kb-cat" onchange="applyKbFilters()">' + catOpts + '</select>' +
      '</div>' +
      '<div class="tads-grid">' + cards + '</div>' +
      pager(res, '#/tripura-ai/knowledge?cat=' + encodeURIComponent(cat));
  }

  window.applyKbFilters = function () {
    var c = document.getElementById('kb-cat').value;
    var q = (document.getElementById('kb-q').value || '').trim();
    go('/tripura-ai/knowledge?q=' + encodeURIComponent(q) + '&cat=' + encodeURIComponent(c));
  };
  window.debouncedKbSearch = (function () {
    var t = null;
    return function (v) { clearTimeout(t); t = setTimeout(function () { window.applyKbFilters(); }, 400); };
  })();

  function knowledgeDetail(id) {
    var a = T.getRecord('knowledge', id);
    if (!a) return emptyState('Article not found', 'This article may have been removed.', '<a class="tads-btn tads-btn-primary tads-btn-sm" href="#/tripura-ai/knowledge">Back to Knowledge Hub</a>');

    var related = T.getKnowledge().filter(function (x) { return x.id !== a.id && (x.category === a.category || (x.tags || []).some(function (t) { return (a.tags || []).indexOf(t) !== -1; })); }).slice(0, 3);

    return '' +
      '<a class="tads-back" href="#/tripura-ai/knowledge">' + icon('back') + ' Back to Knowledge Hub</a>' +
      '<div class="tads-detail">' +
      '<span class="tads-kb-cat">' + esc(a.category) + '</span>' +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="tads-rec-meta" style="margin-bottom:14px">' + badge(a.dataStatus) + (a.tags || []).map(function (t) { return tag(t); }).join('') + '</div>' +
      (a.dataStatus === 'AI GENERATED' ? '<div class="tads-trust-note">' + icon('warn') + '<div><b>AI-drafted content.</b> This article was generated by AI and has not been verified. Do not quote figures or cite it without replacing them with verified sources.</div></div>' : '') +
      '<p class="tads-lede">' + esc(a.summary) + '</p>' +
      '<div class="tads-panel"><h3>' + icon('doc') + ' Article</h3><p style="color:var(--t-soft);font-size:0.92rem;line-height:1.8;white-space:pre-line">' + esc(a.body || '') + '</p></div>' +
      '<div class="tads-panel"><h3>' + icon('src') + ' Source &amp; verification</h3>' +
      '<div class="tads-source-line">' +
      '<span><b>Source:</b> ' + (a.source ? esc(a.source) : 'Not attached') + '</span>' +
      (a.sourceUrl ? '<span><b>URL:</b> <a href="' + escAttr(a.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(a.sourceUrl) + '</a></span>' : '') +
      '<span><b>Published:</b> ' + esc(a.publishedDate || '—') + '</span>' +
      '<span><b>Verified by:</b> ' + (a.verifiedBy ? esc(a.verifiedBy) : 'Not yet verified') + '</span>' +
      '<span><b>Last verified:</b> ' + (a.verificationDate ? esc(a.verificationDate) : '—') + '</span>' +
      '</div></div>' +
      (related.length ? '<div class="tads-section-head" style="margin-top:28px"><h2>Related resources</h2></div><div class="tads-cards">' + related.map(function (x) {
        return '<div class="tads-card"><span class="tads-kb-cat">' + esc(x.category) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.summary) + '</p><a class="tads-link" href="#/tripura-ai/knowledge/' + escAttr(x.id) + '">Read ' + icon('arrow') + '</a></div>';
      }).join('') + '</div>' : '') +
      '</div>';
  }

  /* ---------------------------- DASHBOARD ---------------------------- */
  function barChart(title, rows, color) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; }).concat([1]));
    return '<div class="tads-panel"><h3 class="tads-chart-title">' + esc(title) + '</h3>' +
      rows.map(function (r) {
        var w = Math.round((r.n / max) * 100);
        return '<div class="tads-bar-row"><span class="lb" title="' + escAttr(r.lb) + '">' + esc(r.lb) + '</span><div class="track"><div class="fill" style="width:' + w + '%;' + (color ? 'background:' + color : '') + '"></div></div><span class="vl">' + r.n + '</span></div>';
      }).join('') +
      '</div>';
  }

  function donutChart(title, data) {
    var total = data.reduce(function (s, d) { return s + d.n; }, 0) || 1;
    var R = 54, C = 2 * Math.PI * R;
    var offset = 0;
    var segs = data.map(function (d) {
      var frac = d.n / total;
      var seg = '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + d.color + '" stroke-width="16" stroke-dasharray="' + (frac * C) + ' ' + C + '" stroke-dashoffset="' + (-offset * C) + '"/>';
      offset += frac;
      return seg;
    }).join('');
    return '<div class="tads-panel"><h3 class="tads-chart-title">' + esc(title) + '</h3><div class="tads-donut-wrap">' +
      '<div class="tads-donut"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + R + '" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="16"/>' + segs + '</svg>' +
      '<div class="mid"><b>' + total + '</b><span>records</span></div></div>' +
      '<div class="tads-legend">' + data.map(function (d) {
        return '<span class="lg"><span class="sw" style="background:' + d.color + '"></span>' + esc(d.lb) + '<b>' + d.n + '</b></span>';
      }).join('') + '</div></div></div>';
  }

  function dashboard() {
    var schemes = T.getSchemes();
    var funding = T.getFunding();
    var problems = T.getProblems();
    var opps = T.getOpportunities();
    var kb = T.getKnowledge();

    var verifiedCount = schemes.concat(funding, kb).filter(function (r) { return r.dataStatus === 'VERIFIED'; }).length;
    var resolved = problems.filter(function (p) { return p.status === 'Resolved'; }).length;
    var activeFunding = funding.filter(function (f) { return f.dataStatus !== 'ARCHIVED'; }).length;
    var activeServices = schemes.filter(function (s) { return s.dataStatus !== 'ARCHIVED'; }).length;
    var districtsCovered = {};
    opps.forEach(function (o) { districtsCovered[o.district] = true; });
    var problemsDistricts = {};
    problems.forEach(function (p) { problemsDistricts[p.district] = true; });

    var sectorRows = T.SECTORS.map(function (s) {
      return { lb: s, n: opps.filter(function (o) { return o.sector === s; }).length };
    }).filter(function (r) { return r.n > 0; }).sort(function (a, b) { return b.n - a.n; });

    var districtRows = T.DISTRICTS.map(function (d) {
      return { lb: d, n: opps.filter(function (o) { return o.district === d; }).length };
    });

    var catRows = T.PROBLEM_CATEGORIES.map(function (c) {
      return { lb: c, n: problems.filter(function (p) { return p.category === c; }).length };
    }).filter(function (r) { return r.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 8);

    var statusRows = T.PROBLEM_STATUSES.map(function (s) {
      return { lb: s, n: problems.filter(function (p) { return p.status === s; }).length };
    });

    var mix = [
      { lb: 'Verified', n: verifiedCount, color: '#10b981' },
      { lb: 'Needs Verification', n: schemes.concat(funding, kb).filter(function (r) { return r.dataStatus === 'NEEDS VERIFICATION'; }).length, color: '#f59e0b' },
      { lb: 'User Submitted', n: schemes.concat(funding, problems, kb).filter(function (r) { return r.dataStatus === 'USER SUBMITTED'; }).length, color: '#38bdf8' },
      { lb: 'AI Generated', n: schemes.concat(funding, opps, kb).filter(function (r) { return r.dataStatus === 'AI GENERATED'; }).length, color: '#94a3b8' }
    ];

    return '' +
      '<div class="tads-section-head"><h2>DADSync AI Insight Dashboard</h2><p>One screen across all modules. Verified vs unverified vs user-submitted vs AI-generated is always kept separate.</p></div>' +
      '<div class="tads-kpis">' +
      kpi('Total opportunities', opps.length, 'kpi-accent') +
      kpi('Citizen problems', problems.length, '') +
      kpi('Resolved problems', resolved, 'kpi-green') +
      kpi('Active funding records', activeFunding, 'kpi-amber') +
      kpi('Gov services & schemes', activeServices, '') +
      kpi('Districts covered', Object.keys(districtsCovered).length + '/' + T.DISTRICTS.length, 'kpi-accent') +
      kpi('Knowledge articles', kb.length, '') +
      kpi('Verified records', verifiedCount, 'kpi-green') +
      '</div>' +
      '<div class="tads-chart-grid">' +
      barChart('Opportunities by sector', sectorRows, 'linear-gradient(90deg, #2563eb, #38bdf8)') +
      barChart('Opportunities by district', districtRows, 'linear-gradient(90deg, #0ea5e9, #22d3ee)') +
      '</div>' +
      '<div class="tads-chart-grid">' +
      barChart('Problems by category (top 8)', catRows, 'linear-gradient(90deg, #f43f5e, #fb923c)') +
      barChart('Problems by status', statusRows, 'linear-gradient(90deg, #10b981, #38bdf8)') +
      '</div>' +
      '<div class="tads-chart-grid">' +
      donutChart('Data verification mix', mix) +
      '<div class="tads-panel"><h3 class="tads-chart-title">Recently verified information</h3>' +
      '<ul class="tads-list">' + schemes.concat(funding, kb).filter(function (r) { return r.dataStatus === 'VERIFIED'; }).sort(function (a, b) { return String(b.verificationDate || '').localeCompare(String(a.verificationDate || '')); }).slice(0, 6).map(function (r) {
        return '<li style="font-size:0.84rem"><b>' + esc(r.title) + '</b><br><span class="tads-mini">' + esc(r.source || '') + ' · verified ' + esc(r.verificationDate || '—') + '</span></li>';
      }).join('') + '</ul></div>' +
      '</div>' +
      '<div class="tads-panel" style="margin-top:4px"><h3 class="tads-chart-title">Honest data policy</h3><p class="tads-note" style="margin:0">' + icon('check') + ' Charts count records in this build. <b>Verified</b> = checked by DADSync against official sources. <b>User Submitted</b> problems are citizen reports stored locally — DADSync never claims government action without a real integration. <b>AI Generated</b> opportunity and knowledge records are labelled hypotheses awaiting validation.</p></div>';

    function kpi(v, lb, cls) {
      return '<div class="tads-kpi"><b class="' + cls + '">' + v + '</b><span>' + esc(lb) + '</span></div>';
    }
  }

  /* ---------------------------- SEARCH ---------------------------- */
  function searchPage() {
    var q = parseQS();
    var query = q.q || '';
    var status = q.status || 'ALL';
    var results = query ? T.searchAll(query, { dataStatus: status }) : null;

    var statusOpts = '<option value="ALL">Any verification status</option>' + T.STATUS.map(function (s) {
      return '<option value="' + escAttr(s) + '"' + (s === status ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var body = '';
    if (!query) {
      body = emptyState('Search the whole module', 'Type a query above to search government services, schemes, funding, citizen problems, opportunities and knowledge articles together.', '');
    } else if (!results.total) {
      body = emptyState('No results for "' + query + '"', 'Try fewer keywords, or clear the verification filter. Check spelling — the search matches exact words.', '<button class="tads-btn tads-btn-ghost tads-btn-sm" onclick="location.hash=\'#/tripura-ai/search\'">Clear search</button>');
    } else {
      var groups = [
        { key: 'schemes', lb: 'Government schemes & services', cls: 'schemes', href: '#/tripura-ai/governance/' },
        { key: 'funding', lb: 'Funding opportunities', cls: 'funding', href: '#/tripura-ai/funding/' },
        { key: 'problems', lb: 'Citizen problems', cls: 'problems', href: '#/tripura-ai/problems/' },
        { key: 'opportunities', lb: 'Opportunities', cls: 'opportunities', href: '#/tripura-ai/opportunities/' },
        { key: 'knowledge', lb: 'Knowledge articles', cls: 'knowledge', href: '#/tripura-ai/knowledge/' }
      ];
      body = '<div class="tads-note" style="margin-bottom:16px">' + results.total + ' results for <b>"' + esc(query) + '"</b></div>';
      groups.forEach(function (g) {
        var items = results[g.key];
        if (!items.length) return;
        body += '<div class="tads-section-head" style="margin:26px 0 14px"><h2 style="font-size:1.15rem"><span class="tads-result-type ' + g.cls + '">' + esc(g.lb) + '</span> <span class="tads-chip">' + items.length + '</span></h2></div>';
        body += '<div class="tads-grid">' + items.map(function (r) {
          var title = r.title || 'Untitled';
          var desc = r.summary || r.description || r.solution || r.body || '';
          var meta = [r.category || r.sector || r.type, r.district].filter(Boolean).map(function (m) { return tag(m); }).join('');
          return '<div class="tads-rec"><div class="tads-rec-top"><h3>' + esc(title) + '</h3>' + badge(r.dataStatus) + '</div>' +
            '<p class="tads-rec-desc">' + esc(String(desc).slice(0, 180)) + '</p>' +
            '<div class="tads-rec-meta">' + meta + '</div>' +
            '<a class="tads-link" href="' + escAttr(g.href + r.id) + '">Open ' + icon('arrow') + '</a></div>';
        }).join('') + '</div>';
      });
    }

    return '' +
      '<div class="tads-section-head"><h2>AI Search &amp; Discovery</h2><p>One search across government services, funding, problems, opportunities and knowledge. Filter by verification status to see only trusted data.</p></div>' +
      '<div class="tads-toolbar">' +
      '<div class="tads-search">' + icon('search') + '<input id="gs-q" type="search" placeholder="e.g. loan, water, bamboo, startup…" value="' + escAttr(query) + '" onkeydown="if(event.key===\'Enter\')applyGlobalSearch()"></div>' +
      '<select class="tads-select" id="gs-status" onchange="applyGlobalSearch()">' + statusOpts + '</select>' +
      '<button class="tads-btn tads-btn-primary" onclick="applyGlobalSearch()">Search</button>' +
      '</div>' +
      '<div id="gs-results">' + body + '</div>';
  }

  window.applyGlobalSearch = function () {
    var q = (document.getElementById('gs-q').value || '').trim();
    var s = document.getElementById('gs-status').value;
    go('/tripura-ai/search?q=' + encodeURIComponent(q) + '&status=' + encodeURIComponent(s));
  };

  /* ---------------------------- ADMIN ---------------------------- */
  function admin() {
    var q = parseQS();
    var type = q.type || 'schemes';
    var list = {
      schemes: T.getSchemes(), funding: T.getFunding(), problems: T.getProblems(),
      opportunities: T.getOpportunities(), knowledge: T.getKnowledge()
    }[type] || [];

    var tabs = [
      { k: 'schemes', lb: 'Schemes & services' }, { k: 'funding', lb: 'Funding' },
      { k: 'problems', lb: 'Problems' }, { k: 'opportunities', lb: 'Opportunities' },
      { k: 'knowledge', lb: 'Knowledge' }
    ];

    var rows = list.map(function (r) {
      return '<tr>' +
        '<td class="cell-title">' + esc(r.title || 'Untitled') + '<div class="tads-mini">' + esc(r.id) + '</div></td>' +
        '<td>' + (r.district || '—') + '</td>' +
        '<td>' + (r.category || r.sector || r.type || '—') + '</td>' +
        '<td>' + badge(r.dataStatus) + '</td>' +
        '<td class="tads-mini">' + esc(r.verifiedBy || '—') + '<br>' + esc(r.verificationDate || '—') + '</td>' +
        '<td><div class="tads-act">' +
        '<select class="tads-select" style="padding:5px 8px;font-size:0.75rem" onchange="adminSetStatus(\'' + escAttr(type) + '\',\'' + escAttr(r.id) + '\',this.value)">' +
        T.STATUS.map(function (s) { return '<option value="' + escAttr(s) + '"' + (s === r.dataStatus ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') +
        '</select>' +
        '<button class="tads-btn tads-btn-ghost tads-btn-sm" onclick="adminEditRecord(\'' + escAttr(type) + '\',\'' + escAttr(r.id) + '\')">Edit</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    return '' +
      '<div class="tads-section-head"><h2>Admin / Content Management</h2><p>Auth-ready architecture: manage records, sources and verification status. In this build data lives in your browser (localStorage). When a backend and authentication are connected, these exact controls will write to the API — the UI stays the same.</p></div>' +
      '<div class="tads-trust-note info">' + icon('user') + '<div><b>Access control:</b> this panel is open in the demo build. In production it must sit behind authentication (e.g. Firebase Auth / your existing auth) and server-side permissions. Never expose secrets in frontend code — use environment variables on the backend.</div></div>' +
      '<div class="tads-tabs">' + tabs.map(function (t) {
        return '<a class="tads-tab' + (t.k === type ? ' active' : '') + '" href="#/tripura-ai/admin?type=' + t.k + '">' + esc(t.lb) + '</a>';
      }).join('') + '</div>' +
      '<div class="tads-table-wrap"><table class="tads-table">' +
      '<thead><tr><th>Title</th><th>District</th><th>Category</th><th>Status</th><th>Verified by / date</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="tads-form-actions" style="margin-top:16px">' +
      '<button class="tads-btn tads-btn-primary" onclick="adminNewRecord(\'' + escAttr(type) + '\')">+ Add new record</button>' +
      '<button class="tads-btn tads-btn-ghost" onclick="if(confirm(\'Reset all demo data to the original seed? Your locally submitted problems will be removed.\')){TADS.resetData();location.hash=\'#/tripura-ai/admin\';}">Reset demo data</button>' +
      '</div>' +
      '<div id="tads-edit-modal"></div>';
  }

  window.adminSetStatus = function (type, id, status) {
    var verifiedBy = status === 'VERIFIED' ? (prompt('Verified by (name/role):') || 'DADSync research desk') : '';
    var verifiedDate = status === 'VERIFIED' ? new Date().toISOString().slice(0, 10) : '';
    T.updateRecord(type, id, { dataStatus: status, verifiedBy: verifiedBy, verificationDate: verifiedDate });
    toast('Status updated to ' + status + ' (local)');
    go('/tripura-ai/admin?type=' + type);
  };

  window.adminEditRecord = function (type, id) {
    var r = T.getRecord(type, id);
    if (!r) return;
    var modal = document.getElementById('tads-edit-modal');
    var title = prompt('Title:', r.title || '');
    var source = prompt('Source (organisation/portal):', r.source || '');
    var url = prompt('Source URL (official):', r.sourceUrl || '');
    var district = prompt('District (or "All districts"):', r.district || '');
    if (title === null) return;
    T.updateRecord(type, id, { title: title, source: source, sourceUrl: url, district: district });
    toast('Record updated (local)');
    go('/tripura-ai/admin?type=' + type);
  };

  window.adminNewRecord = function (type) {
    var title = prompt('Title:');
    if (!title) return;
    var rec = T.addRecord(type, { title: title, district: 'All districts', category: 'General', summary: 'New record added via admin panel — set source and verification details.' });
    toast('Added ' + rec.id + ' (USER SUBMITTED, awaiting source)');
    go('/tripura-ai/admin?type=' + type);
  };

  /* ---------------------------- Wire up ---------------------------- */
  function wireTopBar() {
    if (!topBar) return;
    topBar.innerHTML =
      '<div class="tads-top-inner">' +
      '<a class="tads-brand" href="#/tripura-ai"><span class="tads-logo">◆</span><span>Tripura AI</span></a>' +
      '<nav class="tads-nav">' +
      '<a href="#/tripura-ai/dashboard" data-route="/dashboard">' + icon('dash') + '<span>Dashboard</span></a>' +
      '<a href="#/tripura-ai/governance" data-route="/governance">' + icon('gov') + '<span>Governance</span></a>' +
      '<a href="#/tripura-ai/funding" data-route="/funding">' + icon('fund') + '<span>Funding</span></a>' +
      '<a href="#/tripura-ai/problems" data-route="/problems">' + icon('prob') + '<span>Problems</span></a>' +
      '<a href="#/tripura-ai/opportunities" data-route="/opportunities">' + icon('opp') + '<span>Opportunities</span></a>' +
      '<a href="#/tripura-ai/knowledge" data-route="/knowledge">' + icon('kb') + '<span>Knowledge</span></a>' +
      '<a href="#/tripura-ai/search" data-route="/search">' + icon('search') + '<span>Search</span></a>' +
      '<a href="#/tripura-ai/admin" data-route="/admin">' + icon('admin') + '<span>Admin</span></a>' +
      '</nav>' +
      '</div>';
  }

  window.addEventListener('hashchange', function () {
    var hash = window.location.hash || '';
    if (hash.indexOf('/tripura-ai') !== -1) {
      render();
      if (window.problemReportJS) window.problemReportJS();
    }
  });

  /* Entry: only act when the hash points into the module */
  (function init() {
    wireTopBar();
    var hash = window.location.hash || '';
    if (hash.indexOf('/tripura-ai') !== -1) {
      document.body.classList.add('tads-view');
      render();
      window.problemReportJS();
    }
  })();

  /* Expose a way for the core site to open the module */
  window.openTripuraAI = function (sub) {
    window.location.hash = '#/tripura-ai' + (sub || '');
  };
})();
