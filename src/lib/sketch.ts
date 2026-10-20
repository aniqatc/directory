// The contract for a JavaScript sketch: src/content/experiments/<slug>/sketch.ts.
//
// export default function start(stage: HTMLElement): Sketch — draw into `stage` (it's the 16:9 box on the
// experiment page, square on phones), size to stage.clientWidth / clientHeight, and handle resizes.
// Return `stop` to clean up; add pause / resume / restart and the page shows those buttons.
// With `themes: true` in index.md the page has a Day / Night switch: read colours with colours(stage), and
// return `recolor` to read them again and redraw when it flips.

export interface Sketch {
  stop(): void;
  pause?(): void;
  resume?(): void;
  restart?(): void;
  /** the stage switched between Day and Night: read colours(stage) again and redraw */
  recolor?(): void;
}

export type StartSketch = (stage: HTMLElement) => Sketch;

/** The stage's current colours. Read them from the stage, not the page, so Night (on the stage only) applies. */
export function colours(stage: HTMLElement) {
  const css = getComputedStyle(stage);
  const get = (name: string) => css.getPropertyValue(name).trim();
  return {
    bg: get('--bg'),
    fg: get('--fg'),
    muted: get('--muted'),
    line: get('--line'),
    accent: get('--accent'),
  };
}

/** Fired on the stage when Day / Night flips, for CSS art and studies (sketch.astro) with their own script. */
export const STAGE_THEME = 'stage:theme';
export type StageThemeEvent = CustomEvent<{ night: boolean }>;
