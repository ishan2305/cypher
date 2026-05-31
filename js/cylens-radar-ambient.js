/* ============================================================
   CyLens — Ambient Radar Backdrop
   A large, low-contrast radar that fills the hero and sits
   BEHIND all content. Tuned for subtlety / premium feel:
   slow sweep, faint rings, gentle contacts, soft glow.
   ============================================================ */
(function () {
  const TAU = Math.PI * 2;

  function init(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, dpr, cx, cy, R;

    function fit() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.5; cy = H * 0.52;
      // big enough that the outer rings bleed off every edge
      R = Math.max(0, Math.max(W, H) * 0.66);
    }
    fit();
    if (window.ResizeObserver) { new ResizeObserver(() => fit()).observe(cv); }
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 120); });

    /* Contacts are spread across the whole scope but kept OUT of the
       text + widget rectangles, so catches land in the empty zones
       (top, bottom, the centre gap and the side margins). */
    const THREATS = ['PORT-SCAN','DDoS','TROJAN.W32','BRUTE-FORCE','SQLi','C2-BEACON','INTRUSION','RECON-PROBE','EXPLOIT-KIT','ROOTKIT','PHISHING','XSS-PROBE'];
    const pick = a => a[(Math.random() * a.length) | 0];
    const contacts = [];
    function inText(x, y) {
      if (!W || !H) return false;
      const fx = x / W, fy = y / H;
      if (fy < 0.12) return true;                                          // nav strip
      if (fx > 0.02 && fx < 0.50 && fy > 0.15 && fy < 0.82) return true;    // left headline / desc / CTAs / chip
      if (W >= 1024 && fx > 0.55 && fy > 0.17 && fy < 0.97) return true;    // opaque widget (wide screens)
      return false;
    }
    function spawn(forceType) {
      let a, r, x, y, t = 0;
      do {
        a = Math.random() * TAU;
        r = 0.34 + Math.random() * 0.62;
        x = cx + Math.cos(a) * R * r; y = cy + Math.sin(a) * R * r;
        t++;
      } while (inText(x, y) && t < 24);
      const type = forceType || (Math.random() < 0.55 ? 'hostile' : (Math.random() < 0.5 ? 'cyan' : 'purple'));
      contacts.push({ a, r, type, label: pick(THREATS), lit: 0, lock: 0, armed: false, drift: (Math.random() - 0.5) * 0.0008 });
    }
    for (let i = 0; i < 12; i++) spawn();

    const pings = [];
    const catches = [];          // expanding "block" rings drawn when a threat is caught
    let lastPing = 0, ang = 0, last = performance.now();

    function draw(now) {
      const dt = Math.min(50, now - last); last = now;
      if (cv.clientWidth && (W !== cv.clientWidth || H !== cv.clientHeight)) fit();
      if (!W || !H || R <= 0) { requestAnimationFrame(draw); return; }
      try {
        ctx.clearRect(0, 0, W, H);

        /* soft central depth glow */
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.9);
        g.addColorStop(0, 'rgba(2,116,245,0.13)');
        g.addColorStop(0.4, 'rgba(118,34,229,0.08)');
        g.addColorStop(1, 'rgba(7,7,26,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

        /* concentric range rings */
        const RINGS = 7;
        for (let i = 1; i <= RINGS; i++) {
          ctx.beginPath(); ctx.arc(cx, cy, R * i / RINGS, 0, TAU);
          ctx.strokeStyle = 'rgba(150,110,250,' + (0.10 + i * 0.014) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        }
        /* radial spokes every 30°, faint */
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * TAU;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          ctx.strokeStyle = 'rgba(139,92,246,0.055)'; ctx.lineWidth = 1; ctx.stroke();
        }
        /* faint major bearing ticks + whisper-light degree numbers on the outer ring */
        for (let d = 0; d < 360; d += 30) {
          const a = (d - 90) / 180 * Math.PI;
          const rr = R * (RINGS - 1) / RINGS;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          ctx.lineTo(cx + Math.cos(a) * (rr - 12), cy + Math.sin(a) * (rr - 12));
          ctx.strokeStyle = 'rgba(196,181,253,0.30)'; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillStyle = 'rgba(148,163,184,0.26)';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(d).padStart(3, '0'), cx + Math.cos(a) * (rr - 26), cy + Math.sin(a) * (rr - 26));
        }

        /* gentle expanding pings */
        if (now - lastPing > 4200) { lastPing = now; pings.push({ r: 0 }); }
        for (let i = pings.length - 1; i >= 0; i--) {
          const p = pings[i]; p.r += R * 0.0024 * (dt / 16.7);
          const a = Math.max(0, 1 - p.r / R);
          ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, TAU);
          ctx.strokeStyle = 'rgba(34,211,238,' + (a * 0.26) + ')'; ctx.lineWidth = 1.2; ctx.stroke();
          if (p.r >= R) pings.splice(i, 1);
        }

        /* slow soft sweep */
        const headA = ang - Math.PI / 2;
        if (ctx.createConicGradient) {
          ctx.save();
          ctx.translate(cx, cy); ctx.scale(1, -1); ctx.translate(-cx, -cy);
          const cg = ctx.createConicGradient(-headA, cx, cy);
          cg.addColorStop(0.00, 'rgba(2,116,245,0.0)');
          cg.addColorStop(0.66, 'rgba(118,34,229,0.0)');
          cg.addColorStop(0.90, 'rgba(118,34,229,0.09)');
          cg.addColorStop(0.99, 'rgba(60,120,245,0.24)');
          cg.addColorStop(1.0, 'rgba(150,200,255,0.34)');
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
          ctx.restore();
        }
        /* faint leading edge */
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(headA) * R, cy + Math.sin(headA) * R);
        ctx.strokeStyle = 'rgba(150,190,255,0.38)'; ctx.lineWidth = 1.5;
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(80,140,255,0.65)'; ctx.stroke(); ctx.shadowBlur = 0;

        /* gentle contacts */
        const swA = ((ang % TAU) + TAU) % TAU;
        contacts.forEach(c => {
          c.a += c.drift * (dt / 16.7);
          let diff = swA - (((c.a % TAU) + TAU) % TAU);
          diff = ((diff % TAU) + TAU) % TAU;
          // rising-edge "catch": fires once as the sweep first touches the contact
          if (diff < 0.09 && !c.armed) {
            c.armed = true; c.lit = 1;
            if (c.type === 'hostile') {
              c.lock = 1;
              catches.push({ x: cx + Math.cos(c.a) * R * c.r, y: cy + Math.sin(c.a) * R * c.r, r: 3, a: 1 });
            }
          } else if (diff > 0.5) { c.armed = false; }
          c.lit *= 0.984; c.lock *= 0.992;
          if (c.lit < 0.02 && c.lock < 0.04) return;
          const x = cx + Math.cos(c.a) * R * c.r, y = cy + Math.sin(c.a) * R * c.r;
          const col = c.type === 'hostile' ? 'rgba(244,63,94,' : c.type === 'cyan' ? 'rgba(34,211,238,' : 'rgba(167,139,250,';
          // echo
          ctx.beginPath(); ctx.arc(x, y, (1 - c.lit) * 22 + 3, 0, TAU);
          ctx.strokeStyle = col + (c.lit * 0.35) + ')'; ctx.lineWidth = 1; ctx.stroke();
          // blip
          ctx.beginPath(); ctx.arc(x, y, 2.4 + c.lit * 1.6, 0, TAU);
          ctx.fillStyle = col + Math.max(c.lit, c.lock * 0.8) + ')';
          ctx.shadowBlur = 10; ctx.shadowColor = col + '0.8)'; ctx.fill(); ctx.shadowBlur = 0;
          // subtle lock reticle on a caught threat
          if (c.type === 'hostile' && c.lock > 0.18) {
            const br = 11;
            ctx.save(); ctx.translate(x, y); ctx.rotate(now * 0.0006);
            ctx.strokeStyle = col + (c.lock * 0.7) + ')'; ctx.lineWidth = 1.1;
            for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(br, br - 5); ctx.lineTo(br, br); ctx.lineTo(br - 5, br); ctx.stroke(); }
            ctx.restore();
          }
          // threat label — pushed radially OUTWARD into the empty margin, away from centre text
          if (c.type === 'hostile' && c.lock > 0.22) {
            const la = c.lock;
            const ux = Math.cos(c.a), uy = Math.sin(c.a);
            const lx = x + ux * 13, ly = y + uy * 13;
            ctx.beginPath(); ctx.moveTo(x + ux * 6, y + uy * 6); ctx.lineTo(lx, ly);
            ctx.strokeStyle = 'rgba(244,63,94,' + (la * 0.5) + ')'; ctx.lineWidth = 1; ctx.stroke();
            ctx.font = "9px 'JetBrains Mono', monospace"; ctx.textBaseline = 'middle';
            ctx.textAlign = ux < -0.2 ? 'right' : 'left';
            const tx = ux < -0.2 ? lx - 4 : lx + 4;
            ctx.fillStyle = 'rgba(244,63,94,' + (la * 0.95) + ')';
            ctx.fillText(c.label, tx, ly - 5);
            ctx.fillStyle = 'rgba(148,163,184,' + (la * 0.6) + ')';
            ctx.fillText('· BLOCKED', tx, ly + 5);
          }
        });

        /* expanding block-rings — a threat caught & neutralised */
        for (let i = catches.length - 1; i >= 0; i--) {
          const k = catches[i]; k.r += R * 0.004 * (dt / 16.7); k.a = Math.max(0, 1 - k.r / (R * 0.11));
          ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU);
          ctx.strokeStyle = 'rgba(244,63,94,' + (k.a * 0.5) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
          if (k.a <= 0) catches.splice(i, 1);
        }

        ctx.restore(); /* end clip */

        /* whisper outer bezel */
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
        ctx.strokeStyle = 'rgba(139,92,246,0.22)'; ctx.lineWidth = 1; ctx.stroke();

        /* center hub */
        ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, TAU);
        ctx.fillStyle = 'rgba(34,211,238,0.6)';
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(34,211,238,0.8)'; ctx.fill(); ctx.shadowBlur = 0;

        if (Math.random() < 0.006 && contacts.length < 14) spawn();
        if (Math.random() < 0.0025 && contacts.length > 9) contacts.splice((Math.random() * contacts.length) | 0, 1);

        ang += 0.0095 * (dt / 16.7); /* slow, premium — a touch quicker so catches recur sooner */
      } catch (e) { /* keep RAF chain alive */ }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('DOMContentLoaded', () => init('radar-bg-canvas'));
})();
