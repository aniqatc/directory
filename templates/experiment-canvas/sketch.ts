// {{title}}: starter sketch from `npm run new`. A dot loops around the stage; replace it with yours.
// start(stage) draws into the stage and returns stop (plus pause / resume / restart for those buttons).
import type { StartSketch } from '../../../lib/sketch';

const start: StartSketch = (stage) => {
  const cv = document.createElement('canvas');
  stage.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  let raf = 0;
  let t = 0;
  let paused = false;

  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = stage.clientWidth * d;
    cv.height = stage.clientHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  const draw = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(w / 2 + (Math.cos(t) * w) / 4, h / 2 + (Math.sin(t * 2) * h) / 5, 12, 0, Math.PI * 2);
    ctx.fill();
  };
  const loop = () => {
    if (!paused) {
      t += 0.02;
      draw();
    }
    raf = requestAnimationFrame(loop);
  };
  const ro = new ResizeObserver(() => {
    size();
    draw();
  });
  ro.observe(stage);
  loop();

  return {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    restart: () => {
      t = 0;
      draw();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.remove();
    },
  };
};

export default start;
