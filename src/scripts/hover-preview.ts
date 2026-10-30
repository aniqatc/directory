// Lab archive: a floating preview follows the cursor over the rows. Mouse only;
// on touch screens the rows are plain links and the preview stays hidden (see the hover: none rule in lab.css).
import { onPage } from './page';

// Initialize the hover preview functionality when the page is ready.
onPage(() => {
  const tip = document.querySelector<HTMLElement>('.tip');
  const archive = document.querySelector<HTMLElement>('.archive');
  if (!tip || !archive) return;

  const image = tip.querySelector<HTMLImageElement>('.tip-image')!;
  const capTitle = tip.querySelector('.tip-cap b')!;
  const capInfo = tip.querySelector('.tip-cap span')!;
  let current: string | undefined;
  let loaded = false;
  let x = 0;
  let y = 0;
  let raf = 0;

  // Fill the preview with the content of the hovered row.
  const fill = (row: HTMLElement) => {
    if (row.dataset.slug === current) return;
    current = row.dataset.slug;
    if (row.dataset.preview) image.src = row.dataset.preview;
    image.hidden = !row.dataset.preview;
    capTitle.textContent = row.dataset.t ?? '';
    capInfo.textContent = row.dataset.u ?? '';
  };

  // the first hover fetches every row's small screenshot, so the next ones show straight away
  const loadAll = () => {
    if (loaded) return;
    loaded = true;
    archive.querySelectorAll<HTMLElement>('.row[data-preview]').forEach((row) => {
      new Image().src = row.dataset.preview!;
    });
  };

  // Situate the preview to the right of the cursor, flip left near the edge, and stay inside the window
  const place = () => {
    raf = 0;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let left = x + 24;
    if (left + w > innerWidth - 16) left = x - w - 24;
    const top = Math.max(16, Math.min(y - h / 2, innerHeight - h - 16));
    tip.style.transform = `translate(${left}px,${top}px)`;
  };

  // Event listeners for the archive rows to handle hover and pointer movements.
  archive.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const row = (ev.target as Element).closest<HTMLElement>('.row');
    if (!row) return;
    loadAll();
    fill(row);
    tip.classList.add('show');
  });
  archive.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    x = ev.clientX;
    y = ev.clientY;
    if (!raf) raf = requestAnimationFrame(place);
  });
  archive.addEventListener('pointerout', (ev) => {
    const to = ev.relatedTarget as Element | null;
    if (!to?.closest('.row')) tip.classList.remove('show');
  });
  // Clean up the animation frame when the page is unloaded or the component is destroyed.
  return () => cancelAnimationFrame(raf);
});
