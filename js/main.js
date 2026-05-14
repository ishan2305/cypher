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
