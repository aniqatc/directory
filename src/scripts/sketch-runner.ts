// Experiment pages: Fullscreen for any stage, and for a JavaScript sketch (src/content/experiments/<slug>/sketch.ts) load it into
// the stage and wire up Pause / Restart. Each sketch is its own bundle, so a page only downloads its own sketch
// (and p5 or three if it uses them).
import type { StartSketch } from '../lib/sketch';

const sketches = import.meta.glob<{ default: StartSketch }>('../content/experiments/*/sketch.ts');
const stage = document.querySelector<HTMLElement>('.stage');
const bar = document.querySelector<HTMLElement>('.stage-bar');
const btn = (act: string) => bar?.querySelector<HTMLButtonElement>(`[data-act="${act}"]`);

async function runSketch(stage: HTMLElement, load: () => Promise<{ default: StartSketch }>) {
  const sketch = (await load()).default(stage);
  addEventListener('pagehide', () => sketch.stop());

  const pauseBtn = btn('pause');
  if (pauseBtn && sketch.pause && sketch.resume) {
    let paused = false;
    const set = (p: boolean) => {
      paused = p;
      if (p) sketch.pause!();
      else sketch.resume!();
      pauseBtn.textContent = p ? 'Play' : 'Pause';
    };
    pauseBtn.hidden = false;
    pauseBtn.addEventListener('click', () => set(!paused));
    // start paused for people who prefer reduced motion; a restart while paused draws a still frame
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      set(true);
      sketch.restart?.();
    }
  }
  const restartBtn = btn('restart');
  if (restartBtn && sketch.restart) {
    restartBtn.hidden = false;
    restartBtn.addEventListener('click', () => sketch.restart!());
  }
}

// Fullscreen: real fullscreen where allowed, plus a fixed full-window stage either way (iPhone Safari has no
// element fullscreen). Esc, the Exit button or leaving browser fullscreen all close it.
function fullscreen(stage: HTMLElement) {
  const open = btn('fullscreen');
  const close = stage.querySelector<HTMLButtonElement>('.fs-exit');
  if (!open || !close) return;
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    stage.classList.remove('fs');
    document.body.classList.remove('fs-lock');
    open.focus({ preventScroll: true });
  };
  open.addEventListener('click', () => {
    stage.classList.add('fs');
    document.body.classList.add('fs-lock');
    stage.requestFullscreen?.().catch(() => {});
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', exit);
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && stage.classList.contains('fs')) exit();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && stage.classList.contains('fs')) exit();
  });
}

if (stage) {
  fullscreen(stage);
  const load = stage.dataset.sketch && sketches[`../content/experiments/${stage.dataset.sketch}/sketch.ts`];
  if (load) runSketch(stage, load);
}
