/* =========================================================================
 * DADsync Admin Dashboard — js/views-settings.js
 * Settings view: Formspree endpoints, recipient email, demo-data reset,
 * localStorage export/import JSON.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  function render() {
    const state = A().load();
    const main = document.getElementById('main');
    const s = state.settings;
    const fb = A().getFirebaseStatus();
    const cfg = A().getFirebaseConfig() || {};

    const statusHtml = fb.live
      ? '<div class="fb-status live">' + A().ICONS.database +
        '<div>Connected to <strong>Firebase Realtime Database</strong> — reading <code class="code">contact_messages</code> and <code class="code">job_applications</code> live. Changes you make here (status, archive, delete) are written back to Firebase.</div></div>'
      : (fb.enabled
        ? '<div class="fb-status demo">' + A().ICONS.database +
          '<div>Firebase is configured but no records have loaded yet (empty database or permission error). Showing demo data — new records will appear automatically as soon as the website writes to the database.</div></div>'
        : '<div class="fb-status demo">' + A().ICONS.database +
          '<div>Firebase is <strong>not configured</strong> — the dashboard is running on demo data (localStorage). Paste your Firebase config below (the same config used by the dadsync_v7 website) to go live.</div></div>');

    main.innerHTML =
      '<div class="panel-head"><div><div class="panel-title">Settings</div>' +
      '<div class="panel-sub">Form endpoints, Firebase, delivery and data management</div></div></div>' +

      '<div class="info-banner amber">' + A().ICONS.alert +
      '<div><strong>Data flow:</strong> the dadsync_v7 website now writes each submission to Firebase Realtime Database (<code class="code">contact_messages</code> and <code class="code">job_applications</code>) <em>in addition to</em> the Formspree email. This dashboard reads the same nodes in real time. Without Firebase configured it falls back to demo data managed here (add sample, export/import JSON).</div>' +
      '</div>' +

      '<div class="panel">' +
      '<div class="panel-head"><div class="panel-title">Firebase — live data source</div>' +
      '<div class="panel-sub">Same project used by the dadsync_v7 website · nodes: contact_messages, job_applications</div></div>' +
      statusHtml +
      '<div class="config-grid">' +
      '<div class="full">' +
      '<label class="field-label" for="fb-api-key">API key</label>' +
      '<input class="field code" id="fb-api-key" type="text" value="' + A().esc(cfg.apiKey || '') + '" placeholder="AIzaSy...">' +
      '</div>' +
      '<div class="full">' +
      '<label class="field-label" for="fb-db-url">Database URL</label>' +
      '<input class="field code" id="fb-db-url" type="url" value="' + A().esc(cfg.databaseURL || '') + '" placeholder="https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com">' +
      '</div>' +
      '<div class="full">' +
      '<label class="field-label" for="fb-project-id">Project ID</label>' +
      '<input class="field code" id="fb-project-id" type="text" value="' + A().esc(cfg.projectId || '') + '" placeholder="your-project-id">' +
      '</div>' +
      '<div>' +
      '<label class="field-label" for="fb-auth-domain">Auth domain</label>' +
      '<input class="field code" id="fb-auth-domain" type="text" value="' + A().esc(cfg.authDomain || '') + '" placeholder="YOUR_PROJECT_ID.firebaseapp.com">' +
      '</div>' +
      '<div>' +
      '<label class="field-label" for="fb-app-id">App ID</label>' +
      '<input class="field code" id="fb-app-id" type="text" value="' + A().esc(cfg.appId || '') + '" placeholder="1:123456789:web:abcdef">' +
      '</div>' +
      '<div>' +
      '<label class="field-label" for="fb-storage-bucket">Storage bucket</label>' +
      '<input class="field code" id="fb-storage-bucket" type="text" value="' + A().esc(cfg.storageBucket || '') + '" placeholder="YOUR_PROJECT_ID.appspot.com">' +
      '</div>' +
      '<div>' +
      '<label class="field-label" for="fb-sender-id">Messaging sender ID</label>' +
      '<input class="field code" id="fb-sender-id" type="text" value="' + A().esc(cfg.messagingSenderId || '') + '" placeholder="123456789">' +
      '</div>' +
      '</div>' +
      '<div class="fb-hint">Only <code class="code">apiKey</code>, <code class="code">databaseURL</code> and <code class="code">projectId</code> are required. The config is stored in this browser (<code class="code">dadsync_admin_config_v2</code>) and overrides the constants in <code class="code">index.html</code>. Realtime Database rules must allow read for this dashboard (e.g. the same rules used by the website).</div>' +
      '<div class="form-actions">' +
      '<button class="btn btn-primary" id="fb-save">Save Firebase config</button>' +
      '<button class="btn btn-outline" id="fb-clear">Remove config (back to demo)</button>' +
      '</div>' +
      '</div>' +

      '<div class="panel">' +
      '<div class="panel-head"><div class="panel-title">Formspree endpoints</div>' +
      '<div class="panel-sub">Email-copy endpoints the dadsync.in website forms POST to (Firebase is the primary live store)</div></div>' +
      '<div class="form-grid">' +
      '<div>' +
      '<label class="field-label" for="set-contact-ep">Contact form endpoint</label>' +
      '<input class="field code" id="set-contact-ep" type="url" value="' + A().esc(s.formspreeContact) + '" placeholder="https://formspree.io/f/XXXXXXXX">' +
      '<div class="hint">Used by the <code class="code">#contact-form</code> on the website.</div>' +
      '</div>' +
      '<div>' +
      '<label class="field-label" for="set-careers-ep">Careers form endpoint</label>' +
      '<input class="field code" id="set-careers-ep" type="url" value="' + A().esc(s.formspreeCareers) + '" placeholder="https://formspree.io/f/XXXXXXXX">' +
      '<div class="hint">Used by the job-application modal on the website.</div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:16px">' +
      '<label class="field-label" for="set-recipient">Recipient email</label>' +
      '<input class="field" id="set-recipient" type="email" value="' + A().esc(s.recipientEmail) + '">' +
      '<div class="hint">The mailbox where Formspree delivers submissions (currently ' + A().esc(s.recipientEmail) + ').</div>' +
      '</div>' +
      '<div class="form-actions">' +
      '<button class="btn btn-primary" id="set-save">Save settings</button>' +
      '<button class="btn btn-outline" id="set-reset-ep">Restore defaults</button>' +
      '</div>' +
      '</div>' +

      '<div class="panel">' +
      '<div class="panel-head"><div class="panel-title">Data &amp; demo mode</div>' +
      '<div class="panel-sub">Local fallback store (localStorage) used when Firebase is not configured or empty. Export/import work for both sources.</div></div>' +

      '<div class="setting-row">' +
      '<div class="setting-info"><div class="setting-name">Reset demo data</div>' +
      '<div class="setting-desc">Restores the seeded sample messages and applications in the local fallback store. Firebase records are not touched.</div></div>' +
      '<button class="btn btn-danger btn-sm" id="set-reset-demo">Reset demo data</button>' +
      '</div>' +

      '<div class="setting-row">' +
      '<div class="setting-info"><div class="setting-name">Export data (JSON)</div>' +
      '<div class="setting-desc">Download all messages, applications and settings as a JSON backup.</div></div>' +
      '<button class="btn btn-outline btn-sm" id="set-export">' + A().ICONS.download + ' Export</button>' +
      '</div>' +

      '<div class="setting-row">' +
      '<div class="setting-info"><div class="setting-name">Import data (JSON)</div>' +
      '<div class="setting-desc">Load a previously exported JSON backup into this browser.</div></div>' +
      '<button class="btn btn-outline btn-sm" id="set-import">' + A().ICONS.upload + ' Import</button>' +
      '</div>' +

      '<div class="setting-row">' +
      '<div class="setting-info"><div class="setting-name">Storage keys</div>' +
      '<div class="setting-desc">Data: <code class="code">' + A().STORAGE_KEY + '</code> · Firebase config: <code class="code">' + A().CFG_STORAGE_KEY + '</code> · entries: ' +
      state.messages.length + ' messages, ' + state.applications.length + ' applications.</div></div>' +
      '</div>' +
      '</div>';

    /* ---- save ---- */
    document.getElementById('set-save').addEventListener('click', function () {
      const contactEp = document.getElementById('set-contact-ep').value.trim();
      const careersEp = document.getElementById('set-careers-ep').value.trim();
      const recipient = document.getElementById('set-recipient').value.trim();
      if (!/^https:\/\/formspree\.io\/f\//.test(contactEp)) {
        A().toast('Contact endpoint must start with https://formspree.io/f/', 'error');
        return;
      }
      if (!/^https:\/\/formspree\.io\/f\//.test(careersEp)) {
        A().toast('Careers endpoint must start with https://formspree.io/f/', 'error');
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
        A().toast('Please enter a valid recipient email', 'error');
        return;
      }
      state.settings.formspreeContact = contactEp;
      state.settings.formspreeCareers = careersEp;
      state.settings.recipientEmail = recipient;
      A().save(state);
      A().toast('Settings saved', 'success');
      render();
    });

    /* ---- Firebase config: save ---- */
    document.getElementById('fb-save').addEventListener('click', function () {
      const apiKey = document.getElementById('fb-api-key').value.trim();
      const databaseURL = document.getElementById('fb-db-url').value.trim();
      const projectId = document.getElementById('fb-project-id').value.trim();
      if (!apiKey || !databaseURL) {
        A().toast('API key and Database URL are required', 'error');
        return;
      }
      if (apiKey.indexOf('YOUR_') !== -1 || databaseURL.indexOf('YOUR_') !== -1) {
        A().toast('Please paste your real Firebase values, not the placeholders', 'error');
        return;
      }
      A().setFirebaseConfig({
        apiKey: apiKey,
        databaseURL: databaseURL,
        projectId: projectId || '',
        authDomain: document.getElementById('fb-auth-domain').value.trim() || '',
        storageBucket: document.getElementById('fb-storage-bucket').value.trim() || '',
        messagingSenderId: document.getElementById('fb-sender-id').value.trim() || '',
        appId: document.getElementById('fb-app-id').value.trim() || ''
      });
      A().toast('Firebase config saved — connecting…', 'success');
      render();
    });

    /* ---- Firebase config: clear (back to demo) ---- */
    document.getElementById('fb-clear').addEventListener('click', function () {
      A().setFirebaseConfig(null);
      A().toast('Firebase config removed — back to demo data', 'success');
      render();
    });

    /* ---- restore defaults ---- */
    document.getElementById('set-reset-ep').addEventListener('click', function () {
      state.settings.formspreeContact = 'https://formspree.io/f/XXXXXXXX';
      state.settings.formspreeCareers = 'https://formspree.io/f/XXXXXXXX';
      state.settings.recipientEmail = 'dharmanagaraidatasync@zohomail.in';
      A().save(state);
      A().toast('Endpoints restored to defaults', 'success');
      render();
    });

    /* ---- reset demo ---- */
    document.getElementById('set-reset-demo').addEventListener('click', async function () {
      const ok = await A().confirmDialog(
        'Reset demo data?',
        '<p style="font-size:13.5px;color:var(--slate-600)">All messages and applications currently in this browser will be <strong>replaced</strong> with the seeded demo data. This only affects this browser — nothing is sent anywhere.</p>',
        'Reset demo data', 'btn-danger'
      );
      if (!ok) return;
      A().resetDemo();
      A().toast('Demo data reset', 'success');
      render();
    });

    /* ---- export ---- */
    document.getElementById('set-export').addEventListener('click', function () {
      A().downloadJSON('dadsync-admin-backup.json', {
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        messages: state.messages,
        applications: state.applications
      });
      A().toast('Backup downloaded', 'success');
    });

    /* ---- import ---- */
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    document.getElementById('set-import').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.messages) || !Array.isArray(data.applications)) {
            throw new Error('Invalid backup shape');
          }
          if (data.settings) state.settings = Object.assign({}, state.settings, data.settings);
          state.messages = data.messages;
          state.applications = data.applications;
          A().save(state);
          A().toast('Backup imported (' + data.messages.length + ' messages, ' + data.applications.length + ' applications)', 'success');
          render();
        } catch (err) {
          A().toast('Import failed: invalid JSON backup', 'error');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderSettings = render;
})();
