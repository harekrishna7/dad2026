/* =========================================================================
 * DADsync Admin Dashboard — js/ui.js
 * Shared UI helpers: escaping, date/time formatting, status metadata,
 * toast notifications, modal dialogs, confirm helper, file download.
 * ========================================================================= */
'use strict';

(function () {
  const A = () => window.DADsyncAdmin;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : '?';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function fmtDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    const diff = Date.now() - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    const d = Math.floor(h / 24);
    if (d < 7) return d + 'd ago';
    return fmtDate(iso);
  }

  function startOfDay(t) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function isThisWeek(iso) {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    const t = new Date(iso).getTime();
    return t >= monday.getTime() && t <= now.getTime() + 86400000;
  }

  /* ------------------------------------------------- status metadata */
  const MESSAGE_STATUS = {
    new: { label: 'New', cls: 'cyan' },
    unread: { label: 'Unread', cls: 'blue' },
    read: { label: 'Read', cls: 'gray' },
    archived: { label: 'Archived', cls: 'slate' }
  };
  // "slate" alias
  MESSAGE_STATUS.slate = { label: 'Archived', cls: 'gray' };

  const APP_STATUS = {
    new: { label: 'New', cls: 'cyan' },
    reviewed: { label: 'Reviewed', cls: 'blue' },
    hired: { label: 'Hired', cls: 'green' },
    rejected: { label: 'Rejected', cls: 'red' }
  };

  function statusChip(status, kind) {
    const map = kind === 'application' ? APP_STATUS : MESSAGE_STATUS;
    const meta = map[status] || { label: status, cls: 'gray' };
    return '<span class="chip ' + meta.cls + '">' + esc(meta.label) + '</span>';
  }

  function statusOptions(kind, current) {
    const map = kind === 'application' ? APP_STATUS : MESSAGE_STATUS;
    return Object.keys(map).map(function (k) {
      return '<option value="' + k + '"' + (k === current ? ' selected' : '') + '>' + esc(map[k].label) + '</option>';
    }).join('');
  }

  /* ------------------------------------------------------ toasts */
  function toast(msg, type) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s';
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  }

  /* ------------------------------------------------------ modal */
  function openModal(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML =
      '<div class="modal-backdrop" id="modal-backdrop">' +
      '<div class="modal" role="dialog" aria-modal="true">' + html + '</div>' +
      '</div>';
    const backdrop = document.getElementById('modal-backdrop');
    backdrop.addEventListener('mousedown', function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeModal();
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.removeEventListener('keydown', escHandler);
  }

  function confirmDialog(title, bodyHtml, okLabel, okClass) {
    return new Promise(function (resolve) {
      openModal(
        '<div class="modal-head"><div class="modal-title">' + esc(title) + '</div>' +
        '<button class="icon-btn" data-close="1" aria-label="Close">' + A().ICONS.x + '</button></div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        '<div class="modal-foot">' +
        '<button class="btn btn-outline" data-cancel="1">Cancel</button>' +
        '<button class="btn ' + (okClass || 'btn-primary') + '" data-ok="1">' + esc(okLabel || 'OK') + '</button>' +
        '</div>'
      );
      const modal = document.querySelector('#modal-root .modal');
      function done(val) {
        document.removeEventListener('keydown', escHandler);
        modal.querySelector('[data-cancel]').removeEventListener('click', onCancel);
        modal.querySelector('[data-ok]').removeEventListener('click', onOk);
        modal.querySelector('[data-close]').removeEventListener('click', onCancel);
        closeModal();
        resolve(val);
      }
      function onCancel() { done(false); }
      function onOk() { done(true); }
      modal.querySelector('[data-cancel]').addEventListener('click', onCancel);
      modal.querySelector('[data-ok]').addEventListener('click', onOk);
      modal.querySelector('[data-close]').addEventListener('click', onCancel);
    });
  }

  /* ------------------------------------------------------ download */
  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  window.DADsyncAdmin = window.DADsyncAdmin || {};
  Object.assign(window.DADsyncAdmin, {
    esc: esc,
    initials: initials,
    fmtDate: fmtDate,
    fmtDateTime: fmtDateTime,
    timeAgo: timeAgo,
    isThisWeek: isThisWeek,
    MESSAGE_STATUS: MESSAGE_STATUS,
    APP_STATUS: APP_STATUS,
    statusChip: statusChip,
    statusOptions: statusOptions,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    confirmDialog: confirmDialog,
    downloadJSON: downloadJSON
  });
})();
