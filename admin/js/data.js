/* =========================================================================
 * DADsync Admin Dashboard v2 — js/data.js
 * Data layer: reads from Firebase Realtime Database (contact_messages +
 * job_applications nodes) with a graceful fallback to the localStorage
 * demo store when Firebase is not configured or empty.
 *
 * DATA SOURCES
 *   - FIREBASE (live): the main website (dadsync_v7) writes submissions to
 *     the Realtime Database nodes `contact_messages` and `job_applications`
 *     (record: name, phone, email, message, role for applications,
 *     timestamp, status:"new"). Realtime listeners keep this dashboard in
 *     sync automatically. Read AND status writes go to Firebase when live.
 *   - localStorage (demo): seeded demo data + manual entries persist under
 *     key `dadsync_admin_v2`. Used when Firebase is unconfigured, or merged
 *     underneath Firebase records when the database is empty.
 *
 * Firebase config priority:
 *   1. Settings UI -> Firebase (localStorage key `dadsync_admin_config_v2`)
 *   2. FIREBASE_CONFIG constants in index.html (fill in the placeholders)
 * FIREBASE_ENABLED is true only when a real (non-placeholder) config exists.
 * ========================================================================= */
'use strict';

(function () {
  const NS = 'dadsync_admin_v2';
  const CFG_NS = 'dadsync_admin_config_v2';

  /* ------------------------------------------------------------ icons */
  const ICONS = {
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
    inbox: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>',
    briefcase: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
    logout: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
    trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    archive: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8"/><path d="M10 12h4"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
    upload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    database: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'
  };

  /* ------------------------------------------------------ seed data */
  const JOB_ROLES = ['AI Engineer', 'Data Analyst', 'Full-Stack Developer', 'Cloud Architect', 'Business Development Executive'];

  function daysAgo(d) {
    const t = new Date();
    t.setDate(t.getDate() - d);
    t.setHours(9 + (d % 7), 15 + d, 0, 0);
    return t.toISOString();
  }

  const seedMessages = [
    { id: 'm01', type: 'contact', name: 'Rahul Dey', phone: '+91 98630 41258', email: 'rahul.dey@example.com', message: 'Hello, we are a logistics company in Agartala looking for an AI-powered demand-forecasting pilot. Can you share a proposal and pricing for a 3-month engagement?', date: daysAgo(0), status: 'new' },
    { id: 'm02', type: 'contact', name: 'Priyanka Das', phone: '+91 70050 99123', email: 'priyanka.das@example.com', message: 'Interested in your data-centre consulting for our new office in Guwahati. What does your cloud-migration assessment cover and what is the turnaround time?', date: daysAgo(0), status: 'new' },
    { id: 'm03', type: 'contact', name: 'Arun Sharma', phone: '+91 94361 22874', email: 'arun.sharma@example.com', message: 'Requesting a demo of your AI infrastructure monitoring suite. We run 40+ servers and want predictive alerting. Please share available slots next week.', date: daysAgo(1), status: 'unread' },
    { id: 'm04', type: 'contact', name: 'Manash Roy', phone: '+91 98640 55017', email: 'manash.roy@example.com', message: 'Can you provide references or case studies of similar AI/data projects delivered in Northeast India? We are evaluating vendors for a smart-city data platform.', date: daysAgo(2), status: 'unread' },
    { id: 'm05', type: 'contact', name: 'Sushmita Sen', phone: '+91 87948 31290', email: 'sushmita.sen@example.com', message: 'Please share your data-analytics service catalogue and indicative rates for a retail analytics engagement.', date: daysAgo(3), status: 'read' },
    { id: 'm06', type: 'contact', name: 'Bikash Nath', phone: '+91 97742 88315', email: 'bikash.nath@example.com', message: 'We need help building a real-time data pipeline (Kafka + warehouse). Do you provide managed services or staff augmentation?', date: daysAgo(5), status: 'read' },
    { id: 'm07', type: 'contact', name: 'Mitali Barman', phone: '+91 70023 66104', email: 'mitali.barman@example.com', message: 'Following up on my earlier enquiry about the AI chatbot for our customer support — has the scope been finalised?', date: daysAgo(7), status: 'archived' },
    { id: 'm08', type: 'contact', name: 'Deepak Choudhury', phone: '+91 98540 77261', email: 'deepak.choudhury@example.com', message: 'Do you offer training programmes for college graduates in data engineering? We would like to hire from your training cohort.', date: daysAgo(10), status: 'archived' }
  ];

  const seedApplications = [
    { id: 'a01', role: 'AI Engineer', name: 'Tanmay Saha', phone: '+91 70023 98452', email: 'tanmay.saha@example.com', message: '3 years building ML models with PyTorch and deploying on AWS SageMaker. Interested in the AI Engineer role — happy to relocate to Agartala.', date: daysAgo(0), status: 'new' },
    { id: 'a02', role: 'Data Analyst', name: 'Ritika Paul', phone: '+91 98631 22784', email: 'ritika.paul@example.com', message: 'MSc Statistics with strong SQL and Power BI skills. I can start immediately and am excited about DADSync’s regional data initiatives.', date: daysAgo(0), status: 'new' },
    { id: 'a03', role: 'Full-Stack Developer', name: 'Joydeep Nath', phone: '+91 87878 44123', email: 'joydeep.nath@example.com', message: 'Full-stack engineer (React + Node) with 4 years of experience building SaaS products. Attaching my portfolio and GitHub.', date: daysAgo(1), status: 'reviewed' },
    { id: 'a04', role: 'Cloud Architect', name: 'Sanjib Kar', phone: '+91 94021 55876', email: 'sanjib.kar@example.com', message: 'AWS-certified architect with 8 years in hybrid-cloud and Kubernetes. Led 3 large cloud-migration programmes in the region.', date: daysAgo(2), status: 'reviewed' },
    { id: 'a05', role: 'Business Development Executive', name: 'Ankita Ghosh', phone: '+91 70050 33891', email: 'ankita.ghosh@example.com', message: 'MBA (Marketing) with experience selling SaaS and cloud services to enterprise clients in East India.', date: daysAgo(3), status: 'hired' },
    { id: 'a06', role: 'AI Engineer', name: 'Partha Deb', phone: '+91 97740 11239', email: 'partha.deb@example.com', message: 'PhD candidate in NLP, strong research background, looking for a full-time AI engineering position.', date: daysAgo(4), status: 'rejected' },
    { id: 'a07', role: 'Data Analyst', name: 'Kangkan Das', phone: '+91 98637 66452', email: 'kangkan.das@example.com', message: 'Data analyst with Tableau, Python and Excel automation experience; currently based in Silchar.', date: daysAgo(6), status: 'rejected' },
    { id: 'a08', role: 'Full-Stack Developer', name: 'Nabanita Roy', phone: '+91 70022 90817', email: 'nabanita.roy@example.com', message: 'Recent CS graduate with a strong internship track record (MERN stack, Docker). Eager to grow with a local company.', date: daysAgo(9), status: 'hired' }
  ];

  /* ------------------------------------------------------ store */
  const DEFAULT_SETTINGS = {
    formspreeContact: 'https://formspree.io/f/XXXXXXXX',
    formspreeCareers: 'https://formspree.io/f/XXXXXXXX',
    recipientEmail: 'dharmanagaraidatasync@zohomail.in'
  };

  /* ----------------------------------------- runtime in-memory state */
  const state = { settings: null, messages: [], applications: [], seededAt: null };

  function defaultState() {
    return {
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      messages: JSON.parse(JSON.stringify(seedMessages)),
      applications: JSON.parse(JSON.stringify(seedApplications)),
      seededAt: new Date().toISOString()
    };
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(NS);
      if (!raw) {
        const s = defaultState();
        localStorage.setItem(NS, JSON.stringify(s));
        return s;
      }
      const parsed = JSON.parse(raw);
      const merged = defaultState();
      if (parsed.settings) merged.settings = Object.assign({}, DEFAULT_SETTINGS, parsed.settings);
      if (Array.isArray(parsed.messages)) merged.messages = parsed.messages;
      if (Array.isArray(parsed.applications)) merged.applications = parsed.applications;
      if (parsed.seededAt) merged.seededAt = parsed.seededAt;
      return merged;
    } catch (e) {
      const s = defaultState();
      localStorage.setItem(NS, JSON.stringify(s));
      return s;
    }
  }

  function saveLocal(stateObj) {
    try { localStorage.setItem(NS, JSON.stringify(stateObj)); } catch (e) { /* ignore quota */ }
  }

  function resetDemo() {
    const s = defaultState();
    saveLocal(s);
    return s;
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ------------------------------------------------ Firebase layer */
  /* Config: Settings UI (localStorage) overrides index.html constants. */
  function getFirebaseConfig() {
    let cfg = null;
    try {
      const raw = localStorage.getItem(CFG_NS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.apiKey && parsed.databaseURL) cfg = parsed;
      }
    } catch (e) { /* fall through to constants */ }

    if (!cfg && typeof window.FIREBASE_CONFIG === 'object' && window.FIREBASE_CONFIG) {
      cfg = window.FIREBASE_CONFIG;
    }
    return cfg;
  }

  function saveFirebaseConfigToStorage(cfg) {
    try { localStorage.setItem(CFG_NS, JSON.stringify(cfg || null)); } catch (e) { /* ignore */ }
  }

  function isPlaceholder(cfg) {
    if (!cfg) return true;
    const s = JSON.stringify(cfg);
    if (!cfg.apiKey || String(cfg.apiKey).indexOf('YOUR_') !== -1) return true;
    if (!cfg.databaseURL || String(cfg.databaseURL).indexOf('YOUR_') !== -1) return true;
    if (s.indexOf('YOUR_') !== -1) return true;
    return false;
  }

  function firebaseEnabled() {
    return !isPlaceholder(getFirebaseConfig());
  }

  /* Live flag: Firebase configured AND the app has loaded at least one
     snapshot from it (so "live" is only claimed when we are actually
     reading real records, not just configured). */
  let live = false;
  let db = null;

  function initDb() {
    if (db) return db;
    if (!firebaseEnabled()) return null;
    try {
      if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(getFirebaseConfig());
      }
      db = firebase.database();
      return db;
    } catch (err) {
      console.warn('DADSync Admin v2: Firebase init failed — falling back to demo data.', err);
      db = null;
      return null;
    }
  }

  function isLive() { return !!live && !!db; }

  /* Normalize a Firebase record into the dashboard shape.
     Firebase nodes are stored under push() keys; if a record somehow has a
     plain numeric index key it is kept as-is. */
  function normalizeMessage(key, rec) {
    return {
      id: rec.id || key,
      type: 'contact',
      name: rec.name || 'Unknown',
      phone: rec.phone || '',
      email: rec.email || '',
      message: rec.message || '',
      date: rec.timestamp || rec.date || new Date().toISOString(),
      status: rec.status || 'new',
      _fb: true,
      _key: key
    };
  }

  function normalizeApplication(key, rec) {
    return {
      id: rec.id || key,
      role: rec.role || 'General',
      name: rec.name || 'Unknown',
      phone: rec.phone || '',
      email: rec.email || '',
      message: rec.message || '',
      date: rec.timestamp || rec.date || new Date().toISOString(),
      status: rec.status || 'new',
      _fb: true,
      _key: key
    };
  }

  /* Persist a dashboard-side mutation back to Firebase. For records that
     came from Firebase (_key set) update the existing key; otherwise push
     a new record (e.g. "Add sample" while live). Returns the Firebase key. */
  function persistToFirebase(kind, item) {
    const dbi = initDb();
    if (!dbi) return null;
    try {
      const node = kind === 'application' ? 'job_applications' : 'contact_messages';
      const rec = {
        name: item.name,
        phone: item.phone || '',
        email: item.email,
        message: item.message,
        timestamp: item.date || new Date().toISOString(),
        status: item.status || 'new'
      };
      if (kind === 'application') rec.role = item.role;
      const ref = item._key ? dbi.ref(node + '/' + item._key) : dbi.ref(node).push();
      ref.set(rec);
      item._key = item._key || ref.key;
      item._fb = true;
      return item._key;
    } catch (err) {
      console.warn('DADSync Admin v2: Firebase write failed.', err);
      return null;
    }
  }

  function removeFromFirebase(kind, item) {
    const dbi = initDb();
    if (!dbi || !item._key) return;
    try {
      const node = kind === 'application' ? 'job_applications' : 'contact_messages';
      dbi.ref(node + '/' + item._key).remove();
    } catch (err) {
      console.warn('DADSync Admin v2: Firebase delete failed.', err);
    }
  }

  /* Merge strategy (snapshot -> state):
     - Firebase configured + snapshot non-empty  -> Firebase records win;
       localStorage data is kept aside (not shown) so the dashboard is a
       faithful mirror of the database.
     - Firebase configured + snapshot empty       -> demo localStorage data
       is shown, and "add sample"/manual writes push into Firebase.
     - Firebase unconfigured                      -> localStorage only. */
  function mergeSnapshot(kind, list) {
    const src = kind === 'application' ? 'applications' : 'messages';
    const dbi = initDb();
    if (dbi) {
      if (list.length) {
        live = true;
        state[src] = list;
      } else {
        // Database node empty -> show demo data, but do NOT mark live.
        state[src] = loadLocal()[src];
      }
    } else {
      state[src] = loadLocal()[src];
    }
    notify(kind);
  }

  /* ---- realtime listeners (fire once; auto-refresh on every change) ---- */
  let started = false;
  const notifiers = [];

  function onDataChange(fn) {
    if (typeof fn === 'function') notifiers.push(fn);
  }

  function notify(kind) {
    notifiers.forEach(function (fn) {
      try { fn(kind); } catch (e) { /* never let a listener break the loop */ }
    });
  }

  function startListeners() {
    if (started) return;
    started = true;
    if (!firebaseEnabled()) return;

    const dbi = initDb();
    if (!dbi) { started = false; return; }

    dbi.ref('contact_messages').on('value', function (snap) {
      const out = [];
      snap.forEach(function (child) {
        out.push(normalizeMessage(child.key, child.val() || {}));
      });
      out.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      mergeSnapshot('message', out);
    }, function () { /* permission denied etc. -> keep demo data */ });

    dbi.ref('job_applications').on('value', function (snap) {
      const out = [];
      snap.forEach(function (child) {
        out.push(normalizeApplication(child.key, child.val() || {}));
      });
      out.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      mergeSnapshot('application', out);
    }, function () { /* keep demo data on error */ });
  }

  /* -------------------------------------------------------- public API */
  function load() {
    // In-memory copy so views can mutate without touching the store until save().
    const src = defaultState();
    src.settings = Object.assign({}, DEFAULT_SETTINGS, state.settings || loadLocal().settings || {});
    src.messages = state.messages && state.messages.length ? state.messages.slice() : loadLocal().messages.slice();
    src.applications = state.applications && state.applications.length ? state.applications.slice() : loadLocal().applications.slice();
    src.seededAt = state.seededAt || loadLocal().seededAt;
    return src;
  }

  /* Commit mutations made by the views.
     - live: status edits / adds / deletes are pushed to Firebase; the
       merged localStorage copy is refreshed so the fallback stays current.
     - demo: everything persists to localStorage as before. */
  function save(stateObj) {
    const dbi = initDb();
    const src = stateObj || state;
    const local = loadLocal();

    if (dbi) {
      const merged = defaultState();
      merged.settings = Object.assign({}, DEFAULT_SETTINGS, src.settings || local.settings);
      merged.seededAt = src.seededAt || local.seededAt;

      if (live) {
        // Firebase is authoritative; write the delta back to the DB.
        merged.messages = src.messages.slice();
        merged.applications = src.applications.slice();
        saveLocal(merged);

        src.messages.forEach(function (m) {
          if (m._fb) persistToFirebase('message', m);
        });
        src.applications.forEach(function (a) {
          if (a._fb) persistToFirebase('application', a);
        });
        // Items removed from the Firebase list should be removed from the DB.
        local.messages.forEach(function (lm) {
          if (lm._fb && !src.messages.some(function (m) { return m.id === lm.id; })) {
            removeFromFirebase('message', lm);
          }
        });
        local.applications.forEach(function (la) {
          if (la._fb && !src.applications.some(function (a) { return a.id === la.id; })) {
            removeFromFirebase('application', la);
          }
        });
      } else {
        // Firebase configured but empty (or offline): store locally AND push
        // newly added entries into Firebase so they appear on the next load.
        merged.messages = src.messages.slice();
        merged.applications = src.applications.slice();
        saveLocal(merged);

        src.messages.forEach(function (m) {
          if (!m._fb) persistToFirebase('message', m);
        });
        src.applications.forEach(function (a) {
          if (!a._fb) persistToFirebase('application', a);
        });
      }
    } else {
      saveLocal(src.settings && src.messages && src.applications ? src : {
        settings: src.settings, messages: src.messages, applications: src.applications, seededAt: src.seededAt
      });
    }
    state.settings = src.settings;
    state.messages = src.messages.slice();
    state.applications = src.applications.slice();
    state.seededAt = src.seededAt;
    notify();
  }

  /* Settings UI support: persist a Firebase config entered in the UI. */
  function setFirebaseConfig(cfg) {
    saveFirebaseConfigToStorage(cfg);
    // If the config was removed/changed, reset runtime listeners.
    const wasLive = live;
    db = null;
    live = false;
    if (firebaseEnabled()) {
      started = false;
      startListeners();
    } else {
      // Back to demo data.
      const local = loadLocal();
      state.messages = local.messages;
      state.applications = local.applications;
      state.settings = local.settings;
      notify();
    }
    if (wasLive !== live) notify();
  }

  function getFirebaseStatus() {
    return { enabled: firebaseEnabled(), live: isLive() };
  }

  function storageKey() { return NS; }

  /* ------------------------------------------------------ exports */
  window.DADsyncAdmin = window.DADsyncAdmin || {};
  Object.assign(window.DADsyncAdmin, {
    ICONS,
    JOB_ROLES,
    load,
    save,
    resetDemo,
    uid,
    STORAGE_KEY: NS,
    CFG_STORAGE_KEY: CFG_NS,
    getFirebaseConfig,
    setFirebaseConfig,
    getFirebaseStatus,
    startListeners,
    onDataChange,
    isLive,
    normalizeMessage,
    normalizeApplication
  });
})();
