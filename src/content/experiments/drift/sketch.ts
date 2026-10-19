// Drift: particles follow a slowly moving flow field and swirl around the pointer; click to scatter them.
// Plain canvas, no libraries. Colours come from the page's CSS variables, so it follows the lab theme.
import type { StartSketch } from '../../../lib/sketch';

const start: StartSketch = (stage) => {
  const cv = document.createElement('canvas');
  stage.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  const css = getComputedStyle(document.documentElement);
  const rgb = (v: string) => {
    const h = css.getPropertyValue(v).trim().replace('#', '');
    const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(',');
  };
  const BG = rgb('--bg');
  const FG = rgb('--fg');
  const AC = rgb('--accent');

  type P = { x: number; y: number; vx: number; vy: number; hot: boolean };
  let w = 0;
  let h = 0;
  let ps: P[] = [];
  let t = 0;
  let raf = 0;
  let paused = false;
  const ptr = { x: 0, y: 0, in: false };

  const seed = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    w = stage.clientWidth;
    h = stage.clientHeight;
    cv.width = w * d;
    cv.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = `rgb(${BG})`;
    ctx.fillRect(0, 0, w, h);
    ps = Array.from({ length: Math.min(900, Math.round((w * h) / 500)) }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      hot: i % 11 === 0,
    }));
  };

  const step = () => {
    ctx.fillStyle = `rgba(${BG},.07)`; // fade the last frame instead of clearing it: that's the trails
    ctx.fillRect(0, 0, w, h);
    const base = new Path2D();
    const hot = new Path2D();
    const R = Math.min(w, h) * 0.3;
    for (const p of ps) {
      const ang = Math.sin(p.x * 0.006 + t * 0.4) * 1.4 + Math.cos(p.y * 0.008 - t * 0.3) * 1.2;
      let fx = Math.cos(ang);
      let fy = Math.sin(ang);
      if (ptr.in) {
        const dx = p.x - ptr.x;
        const dy = p.y - ptr.y;
        const dd = Math.hypot(dx, dy) + 0.01;
        if (dd < R) {
          const k = (1 - dd / R) ** 2 * 2.2; // swirl: push sideways, stronger near the pointer
          fx += (-dy / dd) * k;
          fy += (dx / dd) * k;
        }
      }
      p.vx = p.vx * 0.9 + fx * 0.25;
      p.vy = p.vy * 0.9 + fy * 0.25;
      const ox = p.x;
      const oy = p.y;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        Object.assign(p, { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0 });
        continue;
      }
      const path = p.hot ? hot : base;
      path.moveTo(ox, oy);
      path.lineTo(p.x, p.y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${FG},.35)`;
    ctx.stroke(base);
    ctx.strokeStyle = `rgba(${AC},.95)`;
    ctx.stroke(hot);
    t += 0.016;
  };

  const loop = () => {
    if (!paused) step();
    raf = requestAnimationFrame(loop);
  };

  const move = (ev: PointerEvent) => {
    const b = stage.getBoundingClientRect();
    ptr.x = ev.clientX - b.left;
    ptr.y = ev.clientY - b.top;
    ptr.in = true;
  };
  const leave = () => (ptr.in = false);
  const scatter = (ev: PointerEvent) => {
    move(ev);
    for (const p of ps) {
      const dx = p.x - ptr.x;
      const dy = p.y - ptr.y;
      const dd = Math.hypot(dx, dy) + 0.01;
      if (dd < 160) {
        p.vx += (dx / dd) * 6;
        p.vy += (dy / dd) * 6;
      }
    }
  };
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', leave);
  stage.addEventListener('pointerdown', scatter);
  const ro = new ResizeObserver(() => {
    if (stage.clientWidth !== w || stage.clientHeight !== h) seed();
  });
  ro.observe(stage);

  // a paused sketch still shows a few seconds of trails rather than a blank box
  const settle = () => {
    for (let i = 0; i < 160; i++) step();
  };
  seed();
  loop();

  return {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    restart: () => {
      seed();
      if (paused) settle();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      stage.removeEventListener('pointerdown', scatter);
      cv.remove();
    },
  };
};

export default start;
