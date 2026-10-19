// "Random entry": roll the dice, flash a random lab row, then open it. Skips example entries.
import { navigate } from 'astro:transitions/client';
import { onPage } from './page';

const FACES: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [
    [8, 8],
    [16, 16],
  ],
  3: [
    [8, 8],
    [12, 12],
    [16, 16],
  ],
  4: [
    [8, 8],
    [16, 8],
    [8, 16],
    [16, 16],
  ],
  5: [
    [8, 8],
    [16, 8],
    [12, 12],
    [8, 16],
    [16, 16],
  ],
  6: [
    [8, 7],
    [16, 7],
    [8, 12],
    [16, 12],
    [8, 17],
    [16, 17],
  ],
};
const face = (pips: Element, n: number) => {
  pips.innerHTML = FACES[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/>`).join('');
};
const roll = () => 1 + Math.floor(Math.random() * 6);

onPage(() => {
  const dice = document.querySelector<HTMLButtonElement>('.dice');
  const pips = dice?.querySelector('.pips');
  if (!dice || !pips) return;
  const timers: number[] = [];

  dice.addEventListener('click', () => {
    const rows = [...document.querySelectorAll<HTMLElement>('.row:not([data-example])')];
    const row = rows[Math.floor(Math.random() * rows.length)];
    if (!row) return;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    dice.classList.remove('roll');
    void dice.offsetWidth;
    dice.classList.add('roll');
    const spin = calm ? 0 : window.setInterval(() => face(pips, roll()), 90);
    timers.push(spin);

    setTimeout(
      () => {
        clearInterval(spin);
        face(pips, roll());
        row.classList.add('picked');
        row.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
        timers.push(window.setTimeout(() => navigate(`/lab/${row.dataset.slug}`), 650));
      },
      calm ? 0 : 600,
    );
  });

  return () => timers.forEach((t) => clearTimeout(t));
});
