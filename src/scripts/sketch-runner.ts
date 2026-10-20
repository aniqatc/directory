// Experiment pages: Fullscreen for a framed stage, the Day / Night switch (themes: true), and for a JavaScript sketch
// (src/content/experiments/<slug>/sketch.ts) load it into the stage and wire up Pause / Restart. Each sketch is its own bundle, so a page only downloads its
// own sketch (and p5 or three if it uses them). Everything is torn down before the next page swaps in.
import { STAGE_THEME, type Sketch, type StartSketch } from '../lib/sketch';
import { onPage } from './page';

const sketches = import.meta.glob<{ default: StartSketch }>('../content/experiments/*/sketch.ts');

onPage(() => {
  const stage = document.querySelector<HTMLElement>('.stage');
  if (!stage) return;
  const bar = document.querySelector<HTMLElement>('.stage-bar');
  const btn = (act: string) => bar?.querySelector<HTMLButtonElement>(`[data-act="${act}"]`);
  const off = new AbortController(); // removes every document listener added below
  const { signal } = off;
  let sketch: Sketch | undefined;
  let gone = false;

  // Fullscreen: real fullscreen where allowed, plus a fixed full-window stage either way (iPhone Safari has no
  // element fullscreen). Esc, the Exit button or leaving browser fullscreen all close it.
  const open = btn('fullscreen');
  const close = stage.querySelector<HTMLButtonElement>('.fs-exit');
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    stage.classList.remove('fs');
    document.body.classList.remove('fs-lock');
  };
  if (open && close) {
    open.addEventListener('click', () => {
      stage.classList.add('fs');
      document.body.classList.add('fs-lock');
      stage.requestFullscreen?.().catch(() => {});
      close.focus({ preventScroll: true });
    });
    close.addEventListener('click', () => {
      exit();
      open.focus({ preventScroll: true });
    });
    document.addEventListener(
      'fullscreenchange',
      () => {
        if (!document.fullscreenElement && stage.classList.contains('fs')) exit();
        // fullscreen arrived after the stage was already closed (Esc pressed very quickly): back out of it
        if (document.fullscreenElement === stage && !stage.classList.contains('fs'))
          document.exitFullscreen();
      },
      { signal },
    );
    document.addEventListener(
      'keydown',
      (ev) => {
        if (ev.key === 'Escape' && stage.classList.contains('fs')) exit();
      },
      { signal },
    );
  }

  // Day / Night: .night gives the stage the portfolio's colours (tokens.css). A JavaScript sketch redraws through
  // recolor(); CSS art and studies follow the colours on their own, or listen for the stage:theme event.
  const themeBtns = bar?.querySelectorAll<HTMLButtonElement>('[data-theme-set]') ?? [];
  themeBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const night = b.dataset.themeSet === 'night';
      if (stage.classList.contains('night') === night) return;
      stage.classList.toggle('night', night);
      themeBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      sketch?.recolor?.();
      stage.dispatchEvent(new CustomEvent(STAGE_THEME, { detail: { night } }));
    }),
  );

  // the sketch itself, loaded on demand
  const load = stage.dataset.sketch && sketches[`../content/experiments/${stage.dataset.sketch}/sketch.ts`];
  if (load) {
    load().then(({ default: start }) => {
      if (gone) return; // left the page before it finished loading
      sketch = start(stage);
      const s = sketch;

      const pauseBtn = btn('pause');
      if (pauseBtn && s.pause && s.resume) {
        let paused = false;
        const set = (p: boolean) => {
          paused = p;
          if (p) s.pause!();
          else s.resume!();
          pauseBtn.textContent = p ? 'Play' : 'Pause';
        };
        pauseBtn.hidden = false;
        pauseBtn.addEventListener('click', () => set(!paused));
        // start paused for people who prefer reduced motion; a restart while paused draws a still frame
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          set(true);
          s.restart?.();
        }
      }
      const restartBtn = btn('restart');
      if (restartBtn && s.restart) {
        restartBtn.hidden = false;
        restartBtn.addEventListener('click', () => s.restart!());
      }
    });
  }

  // a full reload or closing the tab
  addEventListener('pagehide', () => sketch?.stop(), { signal });

  return () => {
    gone = true;
    exit();
    sketch?.stop();
    off.abort();
  };
});
