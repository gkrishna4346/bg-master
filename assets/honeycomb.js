/* =============================================================
   BG MASTER: homepage honeycomb
   A field of gold hexagons. A soft glow follows the cursor:
   cells under it brighten and swell outward like a membrane.
   Two slow, hidden "bodies" drift underneath so the page keeps
   breathing even when the mouse is still.
   Runs only while the homepage is showing.
   ============================================================= */
(() => {
  'use strict';
  const canvas = document.getElementById('honeycomb');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Look: tweak these ----------
     Colours and brightness come from style.css (--hex, --hex-base,
     --hex-lit), so the light and dark themes each have their own. */
  const R = 28;                       // hexagon size (centre to corner), px
  let GOLD = '232, 188, 92', BASE = 0.16, LIT = 0.85;
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    GOLD = cs.getPropertyValue('--hex').trim() || GOLD;
    BASE = parseFloat(cs.getPropertyValue('--hex-base')) || BASE;
    LIT = parseFloat(cs.getPropertyValue('--hex-lit')) || LIT;
  }
  const CURSOR_R = 230;               // size of the cursor glow, px
  const PUSH = 14;                    // how far cells swell outward, px

  const SQ3 = Math.sqrt(3);
  const CORNERS = [];                 // unit offsets of the 6 corners (pointy top)
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 180 * (60 * k - 90);
    CORNERS.push([Math.cos(a), Math.sin(a)]);
  }

  let W = 0, H = 0, dpr = 1, cells = [], running = false;
  const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, on: 0 };

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = [];
    const w = SQ3 * R, h = 1.5 * R;
    for (let row = -1; row * h < H + R * 2; row++) {
      for (let col = -1; col * w < W + w; col++) {
        const x = col * w + (row & 1 ? w / 2 : 0), y = row * h;
        // fade the honeycomb out towards the edges of the screen
        const nx = (x / W - 0.58) / 0.62, ny = (y / H - 0.5) / 0.62;
        const fade = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny));
        cells.push({ x, y, fade: Math.pow(fade, 0.8) });
      }
    }
  }

  // Two hidden bodies wandering slowly under the honeycomb
  const bodies = [0, 1].map(seed => ({
    fx: 0.00005 + seed * 0.000013, fy: 0.000063 - seed * 0.00001,
    px: seed * 2.3, py: 1 + seed * 3.1, R: 200 + seed * 50
  }));
  function bodyAt(b, now) {
    return {
      x: W * (0.58 + 0.34 * Math.sin(now * b.fx + b.px)),
      y: H * (0.5 + 0.36 * Math.sin(now * b.fy + b.py)),
      R: b.R * (1 + 0.06 * Math.sin(now * 0.001 + b.px)), A: 7, glow: 0.35
    };
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // the cursor glow eases after the pointer, so it glides
    mouse.on += ((mouse.x > -999 ? 1 : 0) - mouse.on) * 0.06;
    if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
    mouse.sx += (mouse.x - mouse.sx) * 0.14;
    mouse.sy += (mouse.y - mouse.sy) * 0.14;

    const forces = reduceMotion ? [] : bodies.map(b => bodyAt(b, now));
    if (mouse.on > 0.01) forces.push({ x: mouse.sx, y: mouse.sy, R: CURSOR_R, A: PUSH * mouse.on, glow: mouse.on });

    // a warm halo under the cursor
    if (mouse.on > 0.01) {
      const g = ctx.createRadialGradient(mouse.sx, mouse.sy, 0, mouse.sx, mouse.sy, CURSOR_R * 1.3);
      g.addColorStop(0, `rgba(${GOLD}, ${0.10 * mouse.on})`);
      g.addColorStop(1, `rgba(${GOLD}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(mouse.sx - CURSOR_R * 1.3, mouse.sy - CURSOR_R * 1.3, CURSOR_R * 2.6, CURSOR_R * 2.6);
    }

    ctx.lineJoin = 'round';
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      let ox = 0, oy = 0, lift = 0, glow = 0;
      for (let f = 0; f < forces.length; f++) {
        const b = forces[f], dx = c.x - b.x, dy = c.y - b.y;
        if (Math.abs(dx) > b.R * 1.8 || Math.abs(dy) > b.R * 1.8) continue;
        const d = Math.hypot(dx, dy) || 1, u = d / b.R;
        const bump = Math.exp(-u * u * 1.6);
        const push = b.A * u * bump * 1.9;
        ox += dx / d * push; oy += dy / d * push;
        lift = Math.max(lift, bump);
        glow = Math.max(glow, bump * b.glow);
      }
      const alpha = BASE * c.fade + LIT * glow;
      if (alpha < 0.01) continue;

      const x = c.x + ox, y = c.y + oy, r = R * (0.9 + 0.07 * lift);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const px = x + CORNERS[k][0] * r, py = y + CORNERS[k][1] * r;
        k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      if (glow > 0.12) {                       // lit cells get a faint golden fill
        ctx.fillStyle = `rgba(${GOLD}, ${(glow * 0.09).toFixed(3)})`;
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(${GOLD}, ${Math.min(1, alpha).toFixed(3)})`;
      ctx.lineWidth = 1 + glow * 1.2;
      ctx.stroke();
    }
  }

  function loop(now) {
    if (!document.body.classList.contains('is-home') || document.hidden) { running = false; return; }
    draw(now);
    requestAnimationFrame(loop);
  }
  function start() {
    if (running || !document.body.classList.contains('is-home')) return;
    if (reduceMotion) { draw(0); return; }
    running = true;
    requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; if (reduceMotion) draw(0); });
  document.documentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); start(); if (reduceMotion) draw(0); }, 120); });
  document.addEventListener('visibilitychange', start);
  // start again whenever the homepage comes back
  new MutationObserver(start).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // the sun / moon switch changes data-theme on <html>: pick up the new colours
  new MutationObserver(() => { readTheme(); if (reduceMotion || !running) draw(performance.now()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  readTheme();
  build();
  start();
})();
