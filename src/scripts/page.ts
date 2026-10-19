// With view transitions (ClientRouter in Base.astro), links swap the page in place, so a page's script runs
// once rather than on every visit. onPage runs `setup` on the first load and after every page change; if it
// returns a function, that runs just before the next page swaps in, to stop timers, observers and sketches.

// Whether the current page has finished loading. A script first needed on a page you reach mid-visit can
// finish downloading after that page's astro:page-load has fired (on a slow connection), so it must set up
// straight away instead of waiting for an event that already happened.
let loaded = false;
document.addEventListener('astro:page-load', () => (loaded = true));
document.addEventListener('astro:before-swap', () => (loaded = false));

export function onPage(setup: () => void | (() => void)) {
  const run = () => {
    const cleanup = setup();
    if (cleanup) document.addEventListener('astro:before-swap', cleanup, { once: true });
  };
  document.addEventListener('astro:page-load', run);
  if (loaded) run();
}
