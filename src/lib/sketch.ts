// The contract for a JavaScript sketch: src/content/experiments/<slug>/sketch.ts.
//
// export default function start(stage: HTMLElement): Sketch — draw into `stage` (it's the 16:9 box on the
// experiment page, square on phones), size to stage.clientWidth / clientHeight, and handle resizes.
// Return `stop` to clean up; add pause / resume / restart and the page shows those buttons.

export interface Sketch {
  stop(): void;
  pause?(): void;
  resume?(): void;
  restart?(): void;
}

export type StartSketch = (stage: HTMLElement) => Sketch;
