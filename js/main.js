/* ============================================================
   CYLENS — Shared JavaScript
   Brand: CyLens | "Vision That Secures"
   ============================================================ */

/* ── 1. NAV SCROLL ── */
const navEl = document.querySelector('.nav');
if (navEl) {
  const checkScroll = () => navEl.classList.toggle('scrolled', window.scrollY > 44);
  window.addEventListener('scroll', checkScroll);
  checkScroll();
}

/* ── 2. ACTIVE NAV LINK ── */
(function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path || (path === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });
  // Highlight Company dropdown trigger for company-related pages
  const companyPages = ['about.html', 'corporate.html', 'services.html'];
  if (companyPages.includes(path)) {
    const companyItem = document.querySelector('.nav-item.has-dropdown');
    if (companyItem) {
      const trigger = companyItem.querySelector('.nav-trigger');
      if (trigger) trigger.classList.add('active');
    }
  }
})();

/* ── 3. MOBILE NAV ── */
const navHam = document.getElementById('nav-ham');
const navLinks = document.getElementById('nav-links');
if (navHam && navLinks) {
  navHam.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navHam.classList.toggle('open');
  });
}

/* ── 4. DROPDOWN TOGGLE (mobile click) ── */
document.querySelectorAll('.nav-trigger').forEach(trigger => {
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const item = trigger.closest('.nav-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.nav-item.has-dropdown').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.has-dropdown').forEach(i => i.classList.remove('open'));
});

/* ── 5. SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 6. COUNTER ANIMATION ── */
function animCount(el, target, suffix, duration) {
  duration = duration || 1600;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const n = +el.dataset.count, s = el.dataset.suffix || '';
    if (n) animCount(el, n, s);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── 7. COURSE FILTER ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const courseCards = document.querySelectorAll('.course-card');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      courseCards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

/* ── 8. MARQUEE BUILD ── */
function buildMarquee(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  const all = [...items, ...items]; // duplicate for seamless loop
  all.forEach(t => {
    const d = document.createElement('div');
    d.className = 'm-item';
    d.textContent = t;
    el.appendChild(d);
  });
}

/* ── 9. MINI CANVAS NETWORK (about page) ── */
function miniNet(canvasId, nodeColor, lineColor) {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  function resize() {
    cv.width = cv.offsetWidth || cv.parentElement.offsetWidth;
    cv.height = cv.offsetHeight || cv.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  const N = 28;
  const nodes = Array.from({ length: N }, () => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2.5 + 1
  }));
  function draw() {
    if (!cv.width || !cv.height) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    // Move
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > cv.width) n.vx *= -1;
      if (n.y < 0 || n.y > cv.height) n.vy *= -1;
    });
    // Lines
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = lineColor.replace('ALPHA', ((1 - d / 100) * 0.35).toFixed(2));
          ctx.lineWidth = 0.7; ctx.stroke();
        }
      });
    });
    // Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 10. FAQ ACCORDION ── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ── 11. SMOOTH COUNTER for any data-count elements (hero stats if present) ── */
// Already handled by counterObserver above.

/* ── COURSE DETAIL MODAL ── */
(function() {
  /* ============================================================
     Google Apps Script Web App endpoint that appends each
     submission as a row in a Google Sheet.
     1. Create a Google Sheet.
     2. Extensions → Apps Script → paste the Code.gs from the
        project README / setup notes → Deploy → Web app →
        "Execute as: Me", "Who has access: Anyone".
     3. Copy the deployment URL (ends in /exec) and paste it below.
     ============================================================ */
  // Shared across all site forms (course modal + contact page). Single source of truth.
  window.CYLENS_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxHf3btFUe55rJA0yUBYtJOzr6vmwkNB3czxlXaBW-mSlHbb_uzMSJ-PEyFPdaTmvNyFw/exec';
  const FORM_ENDPOINT = window.CYLENS_FORM_ENDPOINT;

  const overlay = document.getElementById('course-modal-overlay');
  if (!overlay) return;
  const closeBtn = overlay.querySelector('.modal-close');
  const form   = overlay.querySelector('.modal-form');
  const statusEl = overlay.querySelector('.modal-form-status');
  const SUBMIT_LABEL = 'Submit & Get Details →';

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'modal-form-status' + (kind ? ' ' + kind : '');
  }
  function resetForm() {
    setStatus('');
    const btn = form && form.querySelector('.modal-submit');
    if (btn) { btn.disabled = false; btn.textContent = SUBMIT_LABEL; btn.style.background = ''; }
  }

  // Open on any .btn-view-detail click
  document.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const courseName = btn.closest('.course-card') ?
        btn.closest('.course-card').querySelector('.cc-title').textContent.trim() : '';
      const hidden = overlay.querySelector('input[name="course"]');
      if (hidden) hidden.value = courseName;
      if (form) form.reset();
      resetForm();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.modal-submit');

      // Honeypot: bots fill the hidden "website" field; silently drop them.
      const hp = form.querySelector('input[name="website"]');
      if (hp && hp.value.trim() !== '') { closeModal(); return; }

      // Native required-field validation
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const val = n => { const el = form.querySelector('input[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      const payload = {
        course: val('course'),
        name: val('name'),
        email: val('email'),
        phone: val('phone'),
        qualification: val('qualification'),
        page: location.pathname,
        submittedAt: new Date().toISOString()
      };

      if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('PASTE_') === 0) {
        setStatus('Form endpoint not configured yet.', 'err');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Submitting…';
      setStatus('');

      try {
        // no-cors → response is opaque (Apps Script sends no CORS headers),
        // but the row is still written. Plain-string body keeps it a
        // "simple" request so the browser skips the CORS preflight.
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload)
        });
        btn.textContent = '✓ Submitted! We\'ll be in touch.';
        btn.style.background = '#22c55e';
        form.reset();
        setStatus('Thanks! Our team will reach out shortly.', 'ok');
        setTimeout(closeModal, 2200);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = SUBMIT_LABEL;
        setStatus('Something went wrong. Please try again.', 'err');
      }
    });
  }
})();
