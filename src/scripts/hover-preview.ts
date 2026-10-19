// Lab archive: a floating preview follows the cursor over the rows. Mouse only; on touch screens
// the rows are plain links and the preview stays hidden (see the hover: none rule in lab.css).
const tip = document.querySelector<HTMLElement>('.tip');
const archive = document.querySelector<HTMLElement>('.archive');

if (tip && archive) {
  const boxes = [...tip.querySelectorAll<HTMLElement>('.pvbox')];
  const capTitle = tip.querySelector('.tip-cap b')!;
  const capInfo = tip.querySelector('.tip-cap span')!;
  let current: string | undefined;
  let x = 0;
  let y = 0;
  let raf = 0;

  const fill = (row: HTMLElement) => {
    if (row.dataset.slug === current) return;
    current = row.dataset.slug;
    boxes.forEach((b) => (b.hidden = b.dataset.slug !== current));
    capTitle.textContent = row.dataset.t ?? '';
    capInfo.textContent = row.dataset.u ?? '';
  };

  // sit to the right of the cursor, flip left near the edge, and stay inside the window
  const place = () => {
    raf = 0;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let left = x + 24;
    if (left + w > innerWidth - 16) left = x - w - 24;
    const top = Math.max(16, Math.min(y - h / 2, innerHeight - h - 16));
    tip.style.transform = `translate(${left}px,${top}px)`;
  };

  archive.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const row = (ev.target as Element).closest<HTMLElement>('.row');
    if (!row) return;
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
}
