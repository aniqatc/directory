// Portfolio Selected work: a floating screenshot follows the cursor over the rows. Mouse only;
// on touch screens the rows are plain links and the preview stays hidden (see the hover: none rule in WorkPreview).
import { onPage } from './page';

onPage(() => {
  const preview = document.querySelector<HTMLElement>('.work-preview');
  const list = document.querySelector<HTMLElement>('.projects');
  if (!preview || !list) return;

  const image = preview.querySelector<HTMLImageElement>('.work-preview-image')!;
  const rows = [...list.querySelectorAll<HTMLElement>('.project')];
  let loaded = false;
  let x = 0;
  let y = 0;
  let raf = 0;

  // the first hover fetches every row's small screenshot, so the next ones show straight away
  const loadAll = () => {
    if (loaded) return;
    loaded = true;
    rows.forEach((row) => {
      if (row.dataset.preview) new Image().src = row.dataset.preview;
    });
  };

  // to the right of the cursor, flipped left near the edge, and always inside the window
  const place = () => {
    raf = 0;
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    let left = x + 24;
    if (left + width > innerWidth - 16) left = x - width - 24;
    left = Math.max(16, left);
    const top = Math.max(16, Math.min(y - height / 2, innerHeight - height - 16));
    preview.style.transform = `translate(${left}px,${top}px)`;
  };

  list.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    loadAll();
    const row = (ev.target as Element).closest<HTMLElement>('.project');
    if (!row?.dataset.preview) return;
    if (image.getAttribute('src') !== row.dataset.preview) image.src = row.dataset.preview;
    x = ev.clientX;
    y = ev.clientY;
    place();
    preview.classList.add('show');
  });
  list.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    x = ev.clientX;
    y = ev.clientY;
    if (!raf) raf = requestAnimationFrame(place);
  });
  list.addEventListener('pointerout', (ev) => {
    const to = ev.relatedTarget as Element | null;
    if (!to?.closest('.project')) preview.classList.remove('show');
  });
  return () => cancelAnimationFrame(raf);
});
