// This module defines the contract for a JavaScript sketch used in the experiments section of the site.
// src/content/experiments/<slug>/sketch.ts.

// Defines the interface and types for sketches, including lifecycle methods and theme handling.
// Lifecycle methods include stop, pause, resume, restart, and recolor.
// The start function is the entry point for the sketch, receiving the stage element to draw into.
// The start function should return an object implementing the Sketch interface, providing the lifecycle methods.
// The start function is typically exported as the default function from the sketch module.

// Example usage:
// export default function start(stage: HTMLElement): Sketch {
//   // Initialize the sketch
//   return {
//     stop() { /* clean up */ },
//     pause() { /* pause */ },
//     resume() { /* resume */ },
//     restart() { /* restart */ },
//     recolor() { /* handle theme change */ },
//   };
// }
//
// With `themes: true` in index.md the page has a Day / Night switch: read colours with colours(stage)

// The Sketch interface defines the lifecycle methods that a sketch can implement.
export interface Sketch {
  stop(): void; // Clean up the sketch and release any resources.
  pause?(): void; // Pause the sketch, if supported.
  resume?(): void; // Resume the sketch, if supported.
  restart?(): void; // Restart the sketch, if supported.
  /** The stage switched between Day and Night: read colours(stage) again and redraw */
  recolor?(): void; // Handle theme change, if supported.
}

// The StartSketch type defines the signature of the function that starts a sketch.
export type StartSketch = (stage: HTMLElement) => Sketch;

// Returns an object containing the current colours of the stage.
export function colours(stage: HTMLElement) {
  // Get the computed styles of the stage element.
  const css = getComputedStyle(stage);
  // Define a helper function to get the value of a CSS custom property.
  const get = (name: string) => css.getPropertyValue(name).trim();
  return {
    bg: get('--bg'), // Background colour of the stage.
    fg: get('--fg'), // Foreground colour of the stage.
    muted: get('--muted'), // Muted colour for less prominent elements.
    line: get('--line'), // Colour used for lines or borders.
    accent: get('--accent'), // Accent colour for highlights or emphasis.
  };
}

// Fired on the stage when Day / Night flips, for CSS art and studies (sketch.astro) with their own script.
export const STAGE_THEME = 'stage:theme';
export type StageThemeEvent = CustomEvent<{ night: boolean }>;

// Fired on the stage when the caption's Pause / Play is pressed, for a study (sketch.astro) that moves on its own
// and marks itself with data-pausable. It also fires once on load, paused, for people who prefer reduced motion.
export const STAGE_PAUSE = 'stage:pause';
export type StagePauseEvent = CustomEvent<{ paused: boolean }>;
