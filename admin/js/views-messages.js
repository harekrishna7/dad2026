/* =========================================================================
 * DADsync Admin Dashboard — js/views-messages.js
 * Contact messages view: searchable/filterable table, detail modal,
 * mark read / archive / delete, optional ?view=<id> deep link.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  function render() {
    const state = A().load();
    const main = document.getElementById('main');
    const fb = A().getFirebaseStatus();
    const srcLine = fb.live
      ? 'Live from Firebase Realtime Database (<code class="code">contact_messages</code>)'
      : (fb.enabled
        ? 'Firebase configured but no records loaded yet — showing demo data'
        : 'Demo data — connect Firebase in Settings to read live submissions');

    main.innerHTML =
      '<div class="panel-head"><div><div class="panel-title">Contact messages</div>' +
      '<div class="panel-sub">' + srcLine + ' · Formspree delivers copies to ' +
      A().esc(state.settings.recipientEmail) + '.</div></div></div>' +

      '<div class="panel">' +
      '<div class="toolbar">' +
      '<div class="search-box">' + A().ICONS.search +
      '<input type="text" id="msg-search" placeholder="Search name, email, phone, message…"></div>' +
      '<select class="select" id="msg-status"><option value="all">All statuses</option>' +
      A().statusOptions('message') +
      '</select>' +
      '<button class="btn btn-outline btn-sm" id="msg-add">' + A().ICONS.plus + ' Add sample</button>' +
      '<span class="count-note" id="msg-count"></span>' +
      '</div>' +
      '<div class="table-wrap"><table><thead><tr>' +
      '<th>Name</th><th>Contact</th><th>Message</th><th>Date</th><th>Status</th><th></th>' +
      '</tr></thead><tbody id="msg-body"></tbody></table></div>' +
      '<div id="msg-empty" class="hidden"></div>' +
      '</div>';

    const searchEl = document.getElementById('msg-search');
    const statusEl = document.getElementById('msg-status');

    function refresh() {
      const q = (searchEl.value || '').toLowerCase().trim();
      const st = statusEl.value;
      const list = state.messages
        .filter(function (m) {
          if (st !== 'all' && m.status !== st) return false;
          if (!q) return true;
          return (m.name + ' ' + m.email + ' ' + m.phone + ' ' + m.message).toLowerCase().indexOf(q) !== -1;
        })
        .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      const body = document.getElementById('msg-body');
      const empty = document.getElementById('msg-empty');
      const count = document.getElementById('msg-count');

      if (!list.length) {
        body.innerHTML = '';
        empty.classList.remove('hidden');
        empty.innerHTML = '<div class="empty-state"><div class="empty-icon">' + A().ICONS.inbox + '</div>' +
          '<div class="empty-title">No messages found</div>' +
          '<div class="empty-sub">Try a different search or status filter, or add a sample entry.</div></div>';
      } else {
        body.innerHTML = list.map(function (m) {
          const unread = m.status === 'new' || m.status === 'unread';
          return '<tr class="' + (unread ? 'unread' : '') + '" data-id="' + m.id + '">' +
            '<td><div class="cell-main">' + A().esc(m.name) + '</div><div class="cell-sub">' + A().esc(m.email) + '</div></td>' +
            '<td>' + A().esc(m.phone || '—') + '</td>' +
            '<td style="max-width:280px"><div class="cell-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + A().esc(m.message) + '</div></td>' +
            '<td style="white-space:nowrap">' + A().esc(A().fmtDateTime(m.date)) + '</td>' +
            '<td>' + A().statusChip(m.status, 'message') + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="icon-btn" data-act="view" title="View">' + A().ICONS.eye + '</button>' +
            '<button class="icon-btn" data-act="read" title="Mark as read">' + A().ICONS.check + '</button>' +
            '<button class="icon-btn" data-act="archive" title="Archive">' + A().ICONS.archive + '</button>' +
            '<button class="icon-btn danger" data-act="delete" title="Delete">' + A().ICONS.trash + '</button>' +
            '</div></td></tr>';
        }).join('');
        empty.classList.add('hidden');
      }
      count.textContent = list.length + ' of ' + state.messages.length + ' messages';
    }

    function onRowClick(e) {
      const btn = e.target.closest('[data-act]');
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      const id = row.getAttribute('data-id');
      const item = state.messages.find(function (m) { return m.id === id; });
      if (!item) return;

      if (btn) {
        const act = btn.getAttribute('data-act');
        if (act === 'view') openDetail(item, state);
        else if (act === 'read') setStatus(item, state, 'read');
        else if (act === 'archive') setStatus(item, state, 'archived');
        else if (act === 'delete') removeItem(item, state);
        return;
      }
      openDetail(item, state);
    }

    document.getElementById('msg-body').addEventListener('click', onRowClick);
    searchEl.addEventListener('input', refresh);
    statusEl.addEventListener('change', refresh);
    document.getElementById('msg-add').addEventListener('click', function () { addSample(state); });

    refresh();

    // deep link ?view=<id>
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    const vid = qs.get('view');
    if (vid) {
      const item = state.messages.find(function (m) { return m.id === vid; });
      if (item) openDetail(item, state);
    }
  }

  function persist(state) {
    A().save(state);
    A().renderTopbar && A().renderTopbar();
  }

  function setStatus(item, state, status) {
    item.status = status;
    persist(state);
    A().toast('Message marked as ' + status, 'success');
    render();
  }

  async function removeItem(item, state) {
    const ok = await A().confirmDialog(
      'Delete message?',
      '<p style="font-size:13.5px;color:var(--slate-600)">Delete the message from <strong>' + A().esc(item.name) + '</strong> (' + A().esc(item.email) + ')? This cannot be undone.</p>',
      'Delete', 'btn-danger'
    );
    if (!ok) return;
    state.messages = state.messages.filter(function (m) { return m.id !== item.id; });
    persist(state);
    A().toast('Message deleted', 'success');
    render();
  }

  function addSample(state) {
    const id = A().uid('m');
    state.messages.unshift({
      id: id,
      type: 'contact',
      name: 'Sample Enquiry',
      phone: '+91 90000 00000',
      email: 'sample@example.com',
      message: 'This is a manually added sample entry. When Firebase is connected this entry is also pushed to the contact_messages node.',
      date: new Date().toISOString(),
      status: 'new'
    });
    persist(state);
    A().toast('Sample message added', 'success');
    render();
  }

  function openDetail(item, state) {
    const actionRow = item.status === 'archived'
      ? ''
      : '<button class="btn btn-outline btn-sm" data-modal-act="archive">' + A().ICONS.archive + ' Archive</button>' +
        '<button class="btn btn-primary btn-sm" data-modal-act="read">' + A().ICONS.check + ' Mark as read</button>';

    A().openModal(
      '<div class="modal-head"><div class="modal-title">Contact message</div>' +
      '<button class="icon-btn" data-close="1" aria-label="Close">' + A().ICONS.x + '</button></div>' +
      '<div class="modal-body">' +
      '<div class="detail-grid">' +
      '<div class="detail-item"><div class="dt">Name</div><div class="dd">' + A().esc(item.name) + '</div></div>' +
      '<div class="detail-item"><div class="dt">Status</div><div class="dd">' + A().statusChip(item.status, 'message') + '</div></div>' +
      '<div class="detail-item"><div class="dt">Email</div><div class="dd">' + A().esc(item.email) + '</div></div>' +
      '<div class="detail-item"><div class="dt">Phone</div><div class="dd">' + A().esc(item.phone || '—') + '</div></div>' +
      '<div class="detail-item"><div class="dt">Received</div><div class="dd">' + A().esc(A().fmtDateTime(item.date)) + '</div></div>' +
      '</div>' +
      '<div class="detail-full"><div class="dt">Message</div><div class="dd">' + A().esc(item.message) + '</div></div>' +
      '</div>' +
      '<div class="modal-foot">' +
      '<button class="btn btn-outline btn-sm" data-close="1">Close</button>' +
      actionRow +
      '</div>'
    );

    const modal = document.querySelector('#modal-root .modal');
    if (!modal) return;

    function handle(e) {
      const act = e.target.closest('[data-modal-act]');
      const closeBtn = e.target.closest('[data-close]');
      if (act) {
        const actName = act.getAttribute('data-modal-act');
        A().closeModal();
        if (actName === 'read') setStatus(item, state, 'read');
        else if (actName === 'archive') setStatus(item, state, 'archived');
      } else if (closeBtn) {
        A().closeModal();
        // open detail again if unread (so it flips to read on next open)
      }
    }
    modal.addEventListener('click', handle);
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  window.DADsyncAdmin.renderMessages = render;
})();
