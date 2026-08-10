/* =========================================================================
 * DADsync Admin Dashboard — js/views-applications.js
 * Job applications view: filter by role + status, mark reviewed/hired/
 * rejected, delete, detail modal, optional ?view=<id> deep link.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  function render() {
    const state = A().load();
    const main = document.getElementById('main');
    const fb = A().getFirebaseStatus();
    const srcLine = fb.live
      ? 'Live from Firebase Realtime Database (<code class="code">job_applications</code>)'
      : (fb.enabled
        ? 'Firebase configured but no records loaded yet — showing demo data'
        : 'Demo data — connect Firebase in Settings to read live submissions');

    const roleOptions = ['all']
      .concat(A().JOB_ROLES)
      .map(function (r) {
        return '<option value="' + A().esc(r) + '"' + (r === 'all' ? ' selected' : '') + '>' +
          (r === 'all' ? 'All roles' : A().esc(r)) + '</option>';
      }).join('');

    main.innerHTML =
      '<div class="panel-head"><div><div class="panel-title">Job applications</div>' +
      '<div class="panel-sub">' + srcLine + ' · Formspree delivers copies to ' +
      A().esc(state.settings.recipientEmail) + '.</div></div></div>' +

      '<div class="panel">' +
      '<div class="toolbar">' +
      '<div class="search-box">' + A().ICONS.search +
      '<input type="text" id="app-search" placeholder="Search name, email, phone…"></div>' +
      '<select class="select" id="app-role">' + roleOptions + '</select>' +
      '<select class="select" id="app-status"><option value="all">All statuses</option>' +
      A().statusOptions('application') +
      '</select>' +
      '<button class="btn btn-outline btn-sm" id="app-add">' + A().ICONS.plus + ' Add sample</button>' +
      '<span class="count-note" id="app-count"></span>' +
      '</div>' +
      '<div class="table-wrap"><table><thead><tr>' +
      '<th>Candidate</th><th>Role</th><th>Contact</th><th>Date</th><th>Status</th><th></th>' +
      '</tr></thead><tbody id="app-body"></tbody></table></div>' +
      '<div id="app-empty" class="hidden"></div>' +
      '</div>';

    const searchEl = document.getElementById('app-search');
    const roleEl = document.getElementById('app-role');
    const statusEl = document.getElementById('app-status');

    function refresh() {
      const q = (searchEl.value || '').toLowerCase().trim();
      const role = roleEl.value;
      const st = statusEl.value;
      const list = state.applications
        .filter(function (a) {
          if (role !== 'all' && a.role !== role) return false;
          if (st !== 'all' && a.status !== st) return false;
          if (!q) return true;
          return (a.name + ' ' + a.email + ' ' + a.phone + ' ' + a.role + ' ' + a.message).toLowerCase().indexOf(q) !== -1;
        })
        .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      const body = document.getElementById('app-body');
      const empty = document.getElementById('app-empty');
      const count = document.getElementById('app-count');

      if (!list.length) {
        body.innerHTML = '';
        empty.classList.remove('hidden');
        empty.innerHTML = '<div class="empty-state"><div class="empty-icon">' + A().ICONS.briefcase + '</div>' +
          '<div class="empty-title">No applications found</div>' +
          '<div class="empty-sub">Try a different role, status or search, or add a sample entry.</div></div>';
      } else {
        body.innerHTML = list.map(function (a) {
          return '<tr data-id="' + a.id + '">' +
            '<td><div class="cell-main">' + A().esc(a.name) + '</div><div class="cell-sub">' + A().esc(a.email) + '</div></td>' +
            '<td><span class="chip cyan">' + A().esc(a.role) + '</span></td>' +
            '<td>' + A().esc(a.phone || '—') + '</td>' +
            '<td style="white-space:nowrap">' + A().esc(A().fmtDateTime(a.date)) + '</td>' +
            '<td>' + A().statusChip(a.status, 'application') + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="icon-btn" data-act="view" title="View">' + A().ICONS.eye + '</button>' +
            '<select class="select" data-act="status" style="padding:5px 8px;font-size:12px" title="Change status">' +
            A().statusOptions('application', a.status) +
            '</select>' +
            '<button class="icon-btn danger" data-act="delete" title="Delete">' + A().ICONS.trash + '</button>' +
            '</div></td></tr>';
        }).join('');
        empty.classList.add('hidden');
      }
      count.textContent = list.length + ' of ' + state.applications.length + ' applications';
    }

    function onRowClick(e) {
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      const id = row.getAttribute('data-id');
      const item = state.applications.find(function (a) { return a.id === id; });
      if (!item) return;

      const sel = e.target.closest('select[data-act="status"]');
      if (sel) {
        item.status = sel.value;
        A().save(state);
        A().renderTopbar && A().renderTopbar();
        A().toast('Status updated to ' + sel.value, 'success');
        render();
        return;
      }

      const btn = e.target.closest('[data-act]');
      if (btn) {
        const act = btn.getAttribute('data-act');
        if (act === 'view') openDetail(item, state);
        else if (act === 'delete') removeItem(item, state);
        return;
      }
      openDetail(item, state);
    }

    document.getElementById('app-body').addEventListener('click', onRowClick);
    searchEl.addEventListener('input', refresh);
    roleEl.addEventListener('change', refresh);
    statusEl.addEventListener('change', refresh);
    document.getElementById('app-add').addEventListener('click', function () { addSample(state); });

    refresh();

    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    const vid = qs.get('view');
    if (vid) {
      const item = state.applications.find(function (a) { return a.id === vid; });
      if (item) openDetail(item, state);
    }
  }

  function persist(state) {
    A().save(state);
    A().renderTopbar && A().renderTopbar();
  }

  async function removeItem(item, state) {
    const ok = await A().confirmDialog(
      'Delete application?',
      '<p style="font-size:13.5px;color:var(--slate-600)">Delete the application from <strong>' + A().esc(item.name) + '</strong> (' + A().esc(item.role) + ')? This cannot be undone.</p>',
      'Delete', 'btn-danger'
    );
    if (!ok) return;
    state.applications = state.applications.filter(function (a) { return a.id !== item.id; });
    persist(state);
    A().toast('Application deleted', 'success');
    render();
  }

  function addSample(state) {
    const id = A().uid('a');
    state.applications.unshift({
      id: id,
      role: A().JOB_ROLES[Math.floor(Math.random() * A().JOB_ROLES.length)],
      name: 'Sample Applicant',
      phone: '+91 90000 00000',
      email: 'applicant@example.com',
      message: 'This is a manually added sample application. When Firebase is connected this entry is also pushed to the job_applications node.',
      date: new Date().toISOString(),
      status: 'new'
    });
    persist(state);
    A().toast('Sample application added', 'success');
    render();
  }

  function openDetail(item, state) {
    const actionRow =
      '<button class="btn btn-outline btn-sm" data-modal-act="rejected">' + A().ICONS.x + ' Reject</button>' +
      '<button class="btn btn-outline btn-sm" data-modal-act="reviewed">' + A().ICONS.check + ' Mark reviewed</button>' +
      '<button class="btn btn-primary btn-sm" data-modal-act="hired">' + A().ICONS.check + ' Hire</button>';

    A().openModal(
      '<div class="modal-head"><div class="modal-title">Application — ' + A().esc(item.role) + '</div>' +
      '<button class="icon-btn" data-close="1" aria-label="Close">' + A().ICONS.x + '</button></div>' +
      '<div class="modal-body">' +
      '<div class="detail-grid">' +
      '<div class="detail-item"><div class="dt">Candidate</div><div class="dd">' + A().esc(item.name) + '</div></div>' +
      '<div class="detail-item"><div class="dt">Status</div><div class="dd">' + A().statusChip(item.status, 'application') + '</div></div>' +
      '<div class="detail-item"><div class="dt">Email</div><div class="dd">' + A().esc(item.email) + '</div></div>' +
      '<div class="detail-item"><div class="dt">Phone</div><div class="dd">' + A().esc(item.phone || '—') + '</div></div>' +
      '<div class="detail-item"><div class="dt">Applied</div><div class="dd">' + A().esc(A().fmtDateTime(item.date)) + '</div></div>' +
      '</div>' +
      '<div class="detail-full"><div class="dt">Cover message</div><div class="dd">' + A().esc(item.message) + '</div></div>' +
      '</div>' +
      '<div class="modal-foot">' +
      '<button class="btn btn-outline btn-sm" data-close="1">Close</button>' +
      actionRow +
      '</div>'
    );

    const modal = document.querySelector('#modal-root .modal');
    if (!modal) return;

    modal.addEventListener('click', function (e) {
      const act = e.target.closest('[data-modal-act]');
      const closeBtn = e.target.closest('[data-close]');
      if (act) {
        const actName = act.getAttribute('data-modal-act');
        A().closeModal();
        if (['reviewed', 'hired', 'rejected'].indexOf(actName) !== -1) {
          item.status = actName;
          persist(state);
          A().toast('Application marked as ' + actName, 'success');
          render();
        }
      } else if (closeBtn) {
        A().closeModal();
      }
    });
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderApplications = render;
})();
