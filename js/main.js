/* ============================================================
   CYPHER ACADEMY — Shared JavaScript
   ============================================================ */

/* ── CURSOR ── */
const cur  = document.getElementById('cur');
const ring = document.getElementById('ring');
if (cur && ring) {
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function tick() {
    rx += (mx - rx) * .13; ry += (my - ry) * .13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('button, a, .card, .course-card, .svc-card, .feat-box, .mode-card, .testi-card, .team-card, .partner-box, .corp-ben, .value-card, .office-card, .pkg, .ind-box, .faq-q, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });
}

/* ── NAV SCROLL ── */
const navEl = document.getElementById('nav');
if (navEl) {
  window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', scrollY > 44));
  navEl.classList.toggle('scrolled', scrollY > 44);
}

/* ── ACTIVE NAV LINK ── */
(function() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const a = item.querySelector('.nav-link');
    if (a && (a.getAttribute('href') === path || (path === '' && a.getAttribute('href') === 'index.html'))) {
      item.classList.add('active');
    }
  });
  // Highlight Company dropdown parent
  const companyPages = ['about.html','corporate.html','services.html'];
  if (companyPages.includes(path)) {
    const companyItem = document.querySelector('.nav-item.has-dropdown');
    if (companyItem) companyItem.classList.add('active');
  }
})();

/* ── MOBILE NAV ── */
const ham = document.getElementById('nav-ham');
const linksWrap = document.getElementById('nav-links-wrap');
if (ham && linksWrap) {
  ham.addEventListener('click', () => {
    linksWrap.classList.toggle('open');
    ham.classList.toggle('open');
  });
}

/* ── DROPDOWN CLICK (mobile) ── */
document.querySelectorAll('.nav-trigger').forEach(el => {
  el.addEventListener('click', e => {
    e.stopPropagation();
    el.closest('.nav-item').classList.toggle('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.has-dropdown').forEach(i => i.classList.remove('open'));
});

/* ── SCROLL REVEAL ── */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .09 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ── COUNTER ANIMATION ── */
function animCount(el, target, suffix, dur) {
  dur = dur || 1600;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const co = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const n = +el.dataset.count, s = el.dataset.suffix || '';
    if (n) animCount(el, n, s);
    co.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

/* ── COURSE FILTER ── */
const filterBtns  = document.querySelectorAll('.filter-btn');
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
        card.style.opacity = match ? '1' : '0';
      });
    });
  });
}

/* ── MARQUEE BUILD ── */
function buildMarquee(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  [...items, ...items].forEach(t => {
    const d = document.createElement('div');
    d.className = 'm-item';
    d.textContent = t;
    el.appendChild(d);
  });
}

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ── MINI CANVAS HELPER ── */
function miniNet(id, nodeColor, lineColor) {
  const cv = document.getElementById(id);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  const nodes = Array.from({ length: 22 }, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
    r: Math.random() * 2 + 1
  }));
  function draw() {
    if (!cv.width || !cv.height) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > cv.width)  n.vx *= -1;
      if (n.y < 0 || n.y > cv.height) n.vy *= -1;
    });
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 90) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = lineColor.replace('ALPHA', ((1 - d / 90) * .4).toFixed(2));
          ctx.lineWidth = .6; ctx.stroke();
        }
      });
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
