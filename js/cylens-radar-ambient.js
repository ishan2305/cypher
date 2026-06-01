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
      if (fy < 0.10) return true;                                          // nav strip only
      // Tighter headline mass — leave the upper-left and lower-left clear
      // so threats can pop around the text without overlapping the words.
      if (fx > 0.06 && fx < 0.42 && fy > 0.28 && fy < 0.66) return true;
      if (W >= 1024 && fx > 0.56 && fy > 0.20 && fy < 0.95) return true;    // opaque widget (wide screens)
      return false;
    }
    function spawn(forceType) {
      let a, r, x, y, t = 0;
      do {
        /* 78% of spawns fall on the left half of the radar (angle between
           PI/2 and 3PI/2). 22% scatter anywhere so the right side isn't empty. */
        a = (Math.random() < 0.78)
          ? (Math.PI * 0.5 + Math.random() * Math.PI)
          : (Math.random() * TAU);
        /* 80% of spawns land between ring 1 (~1/7) and ring 3 (~3/7) of R —
           the inner band where catches read most clearly. 20% land farther out. */
        r = (Math.random() < 0.80)
          ? (0.16 + Math.random() * 0.27)
          : (0.46 + Math.random() * 0.42);
        x = cx + Math.cos(a) * R * r; y = cy + Math.sin(a) * R * r;
        t++;
      } while (inText(x, y) && t < 24);
      /* Equal-ish mix across the 3 contact types so labels of every colour land on the radar.
         Hostiles slightly favoured for the "BLOCKED" drama, but all 3 show up regularly. */
      const r0 = Math.random();
      const type = forceType || (r0 < 0.40 ? 'hostile' : (r0 < 0.70 ? 'cyan' : 'purple'));
      contacts.push({ a, r, type, label: pick(THREATS), lit: 0, lock: 0, armed: false, drift: (Math.random() - 0.5) * 0.0008 });
    }
    /* Spawn a contact ON the current sweep line so it reads as "discovered"
       by the radar — the sweep crosses it on the same frame and immediately
       fires the catch. Used by the in-loop spawner during animation. */
    function spawnAtSweep(forceType) {
      const headA = ang - Math.PI / 2;
      // tiny angular jitter so multiple spawns don't stack on the exact line
      const a = headA + (Math.random() - 0.5) * 0.08;
      let r, x, y, t = 0;
      do {
        r = (Math.random() < 0.80)
          ? (0.16 + Math.random() * 0.27)   // ring 1 to ring 3
          : (0.46 + Math.random() * 0.42);  // outer fallback
        x = cx + Math.cos(a) * R * r;
        y = cy + Math.sin(a) * R * r;
        t++;
      } while (inText(x, y) && t < 12);
      if (inText(x, y)) return; // skip if no safe slot under the sweep
      const r0 = Math.random();
      const type = forceType || (r0 < 0.40 ? 'hostile' : (r0 < 0.70 ? 'cyan' : 'purple'));
      contacts.push({ a, r, type, label: pick(THREATS), lit: 0, lock: 0, armed: false, drift: (Math.random() - 0.5) * 0.0008 });
    }
    /* Half the previous initial count (18 to 6) — the rest fill in as the
       sweep rotates and discovers new contacts. */
    for (let i = 0; i < 6; i++) spawn();

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
          // rising-edge "catch": fires once as the sweep first touches the contact.
          // ALL types now lock + push a catch ring (not just hostile) so every
          // threat label is visibly scanned, not just the red ones.
          if (diff < 0.09 && !c.armed) {
            c.armed = true; c.lit = 1; c.lock = 1;
            catches.push({
              x: cx + Math.cos(c.a) * R * c.r,
              y: cy + Math.sin(c.a) * R * c.r,
              r: 3, a: 1, type: c.type
            });
          } else if (diff > 0.5) { c.armed = false; }
          /* Lock decays much slower (0.992 to 0.9975) so the label stays
             on screen for ~5-6 seconds after catch instead of vanishing
             in ~1 second. Lit (blip flash) also slowed slightly. */
          c.lit *= 0.988; c.lock *= 0.9975;
          if (c.lit < 0.02 && c.lock < 0.04) return;
          const x = cx + Math.cos(c.a) * R * c.r, y = cy + Math.sin(c.a) * R * c.r;
          const col = c.type === 'hostile' ? 'rgba(244,63,94,' : c.type === 'cyan' ? 'rgba(34,211,238,' : 'rgba(167,139,250,';
          // echo (larger expanding ring)
          ctx.beginPath(); ctx.arc(x, y, (1 - c.lit) * 30 + 4, 0, TAU);
          ctx.strokeStyle = col + (c.lit * 0.42) + ')'; ctx.lineWidth = 1.2; ctx.stroke();
          // blip (larger dot)
          ctx.beginPath(); ctx.arc(x, y, 4 + c.lit * 2.2, 0, TAU);
          ctx.fillStyle = col + Math.max(c.lit, c.lock * 0.85) + ')';
          ctx.shadowBlur = 14; ctx.shadowColor = col + '0.85)'; ctx.fill(); ctx.shadowBlur = 0;
          // Lock reticle on every caught threat (all types, not just hostile)
          if (c.lock > 0.12) {
            const br = 13;
            ctx.save(); ctx.translate(x, y); ctx.rotate(now * 0.0006);
            ctx.strokeStyle = col + Math.min(c.lock * 0.95, 0.9) + ')'; ctx.lineWidth = 1.3;
            for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(br, br - 6); ctx.lineTo(br, br); ctx.lineTo(br - 6, br); ctx.stroke(); }
            ctx.restore();
          }
          // Threat label — fires for ALL types. Bigger font, bolder colour,
          // longer-lived (lock decays slow now) so people can actually read
          // what the radar caught.
          if (c.lock > 0.08) {
            // Boost alpha — labels stay readable even when c.lock is small.
            const la = Math.min(0.30 + c.lock * 0.85, 1.0);
            const ux = Math.cos(c.a), uy = Math.sin(c.a);
            const lx = x + ux * 16, ly = y + uy * 16;
            ctx.beginPath(); ctx.moveTo(x + ux * 7, y + uy * 7); ctx.lineTo(lx, ly);
            ctx.strokeStyle = col + (la * 0.55) + ')'; ctx.lineWidth = 1.1; ctx.stroke();
            // Per-type label palette and status word
            const labelRGB = c.type === 'hostile' ? '255,99,120'
                          : c.type === 'cyan'    ? '125,211,252'
                          :                        '196,181,253';
            const status = c.type === 'hostile' ? '· BLOCKED'
                         : c.type === 'cyan'    ? '· SCANNED'
                         :                        '· DETECTED';
            ctx.font = "bold 11px 'JetBrains Mono', monospace";
            ctx.textBaseline = 'middle';
            ctx.textAlign = ux < -0.2 ? 'right' : 'left';
            const tx = ux < -0.2 ? lx - 5 : lx + 5;
            // shadow for crisp legibility on the dark backdrop
            ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(7,7,26,0.95)';
            ctx.fillStyle = 'rgba(' + labelRGB + ',' + la + ')';
            ctx.fillText(c.label, tx, ly - 6);
            ctx.font = "10px 'JetBrains Mono', monospace";
            ctx.fillStyle = 'rgba(' + labelRGB + ',' + (la * 0.85) + ')';
            ctx.fillText(status, tx, ly + 7);
            ctx.shadowBlur = 0;
          }
        });

        /* Expanding catch rings — colour matches the contact type so cyan
           and purple catches don't all render red. */
        for (let i = catches.length - 1; i >= 0; i--) {
          const k = catches[i];
          k.r += R * 0.004 * (dt / 16.7);
          k.a = Math.max(0, 1 - k.r / (R * 0.12));
          const kCol = k.type === 'hostile' ? '244,63,94'
                     : k.type === 'cyan'    ? '56,189,248'
                     :                        '167,139,250';
          ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU);
          ctx.strokeStyle = 'rgba(' + kCol + ',' + (k.a * 0.55) + ')';
          ctx.lineWidth = 1.5; ctx.stroke();
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

        /* New spawns appear ON the rotating sweep line — the radar
           "discovers" them as the beam passes. Filter to left-half sweep
           so most spawns land on the left side of the screen. Caps roughly
           halved from before (max 22 to 11, despawn floor 14 to 6). */
        const sweepInLeft = Math.cos(ang - Math.PI / 2) < 0.15;
        if (sweepInLeft && Math.random() < 0.014 && contacts.length < 11) spawnAtSweep();
        if (Math.random() < 0.0025 && contacts.length > 6) contacts.splice((Math.random() * contacts.length) | 0, 1);

        ang += 0.020 * (dt / 16.7); /* sweep speed — roughly 2x faster so catches happen ~2x as often */
      } catch (e) { /* keep RAF chain alive */ }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('DOMContentLoaded', () => init('radar-bg-canvas'));
})();
