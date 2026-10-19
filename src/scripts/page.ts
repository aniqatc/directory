// With view transitions (ClientRouter in Base.astro), links swap the page in place, so a page's script runs
// once rather than on every visit. onPage runs `setup` on the first load and after every page change; if it
// returns a function, that runs just before the next page swaps in, to stop timers, observers and sketches.
export function onPage(setup: () => void | (() => void)) {
  document.addEventListener('astro:page-load', () => {
    const cleanup = setup();
    if (cleanup) document.addEventListener('astro:before-swap', cleanup, { once: true });
  });
}
