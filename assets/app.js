(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Dark mode (fixed: actually toggles + persists) ----------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var sunIcon = document.querySelector('[data-icon-sun]');
  var moonIcon = document.querySelector('[data-icon-moon]');

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    if (sunIcon) sunIcon.style.display = dark ? 'block' : 'none';
    if (moonIcon) moonIcon.style.display = dark ? 'none' : 'block';
  }
  function currentTheme() {
    return document.documentElement.classList.contains('dark');
  }
  var stored = null;
  try { stored = localStorage.getItem('dadsync-theme'); } catch (e) {}
  if (stored === 'dark') applyTheme(true);
  else if (stored === 'light') applyTheme(false);
  else applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = !currentTheme();
      applyTheme(dark);
      try { localStorage.setItem('dadsync-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
  }

  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
        menuBtn.focus();
      }
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      var group = item.parentElement;
      if (group) group.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var statusBox = document.querySelector('[data-form-status]');
    var errorBox = document.querySelector('[data-form-error]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : 'Send Message';
    var formCard = document.querySelector('[data-form-card]');

    function showSuccess() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      if (errorBox) errorBox.classList.remove('show');
      if (formCard) formCard.style.display = 'none';
      if (statusBox) statusBox.classList.add('show');
      var sr = document.querySelector('[data-form-live]');
      if (sr) sr.textContent = 'Message sent successfully.';
    }
    function showError(msg) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      if (errorBox) {
        errorBox.textContent = msg || 'Something went wrong. Please try again or email us directly at Dharmanagaraidatasync@zohomail.in.';
        errorBox.classList.add('show');
        var sr = document.querySelector('[data-form-live]');
        if (sr) sr.textContent = msg || 'Message failed to send.';
      }
    }
    function mailtoFallback(payload) {
      try {
        var subject = encodeURIComponent('New inquiry via dadsync.in — ' + (payload.interest || 'General'));
        var body = encodeURIComponent(
          'Name: ' + (payload.first_name || '') + ' ' + (payload.last_name || '') +
          '\nEmail: ' + (payload.email || '') +
          '\nInterest: ' + (payload.interest || '') +
          '\n\nMessage:\n' + (payload.message || '')
        );
        window.location.href = 'mailto:Dharmanagaraidatasync@zohomail.in?subject=' + subject + '&body=' + body;
      } catch (err) {}
      showError('Firebase isn’t connected yet, so we opened your email app with a pre-filled message — press send to reach us.');
    }

    function firestoreWrite(payload) {
      var fb = window.firebase;
      if (!fb || !fb.initializeApp || !fb.firestore) return null;
      var app;
      try {
        app = fb.initializeApp(window.DADSYNC_FIREBASE || {}, 'dadsync-contact');
      } catch (e) {
        try { app = fb.app('dadsync-contact'); } catch (e2) { return null; }
      }
      try {
        var db = fb.firestore(app);
        var record = {
          first_name: payload.first_name || '',
          last_name: payload.last_name || '',
          email: payload.email || '',
          interest: payload.interest || 'General',
          message: payload.message || '',
          created_at: fb.firestore.FieldValue.serverTimestamp()
        };
        return db.collection('contacts').add(record);
      } catch (e) {
        return null;
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return;
      var data = new FormData(form);
      var payload = {};
      data.forEach(function (v, k) { payload[k] = v; });

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      if (errorBox) errorBox.classList.remove('show');

      if (!window.DADSYNC_FIREBASE_READY) {
        mailtoFallback(payload);
        return;
      }

      var p = firestoreWrite(payload);
      if (!p || typeof p.then !== 'function') {
        mailtoFallback(payload);
        return;
      }

      p.then(function () {
        showSuccess();
      }).catch(function (err) {
        showError('We couldn’t save your message (Firebase error: ' + (err && err.code ? err.code : 'unknown') + '). Please email us at Dharmanagaraidatasync@zohomail.in.');
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();