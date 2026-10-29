// With view transitions (ClientRouter in Base.astro), links swap the page in place, so a page's script runs
// once rather than on every visit. onPage runs `setup` on the first load and after every page change; if it
// returns a function, that runs just before the next page swaps in, to stop timers, observers and sketches.

// Whether the current page has finished loading. A script first needed on a page you reach mid-visit can
// finish downloading after that page's astro:page-load has fired (on a slow connection), so it must set up
// straight away instead of waiting for an event that already happened.
let loaded = false;

// Listen for the page load event to set the loaded state.
document.addEventListener('astro:page-load', () => (loaded = true));

// Listen for the before-swap event to reset the loaded state.
document.addEventListener('astro:before-swap', () => (loaded = false));

// onPage sets up a function to run on the first page load and after every page change.
// It also handles cleanup before the next page swap.
export function onPage(setup: () => void | (() => void)) {
  const run = () => {
    // Run the setup function and register its cleanup if provided.
    const cleanup = setup();
    // If a cleanup function is returned, register it to run before the next page swap.
    if (cleanup) document.addEventListener('astro:before-swap', cleanup, { once: true });
  };
  // Attach the run function to the page load event and run it immediately if the page is already loaded.
  document.addEventListener('astro:page-load', run);
  if (loaded) run();
}
