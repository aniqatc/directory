// Likes on lab entries: up to 5 per visitor per entry. Every heart for an entry on the page stays in sync.
// Counts live in Upstash behind /api/likes (src/pages/api/likes.ts), which enforces the limit per visitor.
// Each browser gets an anonymous visitor ID; clearing site data starts a visitor over, which is fine here.

import { onPage } from './page';

const MAX = 5;
const API = '/api/likes';

type Counts = { total: number; mine: number };

// ---------- visitor + server ----------
function visitorId(): string {
  const key = 'aniqa-visitor';
  try {
    let id = localStorage.getItem(key);
    if (!id) localStorage.setItem(key, (id = crypto.randomUUID()));
    return id;
  } catch {
    return crypto.randomUUID(); // storage blocked: likes still work, just not remembered next visit
  }
}
const visitor = visitorId();
const state = new Map<string, Counts>(); // what the hearts on this page show

/** Totals and this visitor's counts for every entry on the page, in one request. */
async function loadAll(slugs: string[]): Promise<Record<string, Counts>> {
  const res = await fetch(`${API}?visitor=${visitor}&slugs=${slugs.map(encodeURIComponent).join(',')}`);
  if (!res.ok) throw new Error(`likes: ${res.status}`);
  return res.json();
}

/** Add one like on the server; it refuses past MAX. */
async function like(slug: string): Promise<Counts & { ok: boolean }> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, visitor }),
  });
  if (!res.ok) throw new Error(`likes: ${res.status}`);
  return res.json();
}

// ---------- the hearts ----------
const level = (mine: number) => (21 - 17.5 * (mine / MAX)).toFixed(2); // clip height: a fifth of the heart per like
const label = (title: string, mine: number) =>
  mine >= MAX ? `You liked ${title} ${MAX} times, the max` : `Like ${title} (${mine} of ${MAX})`;

function show(slug: string, { total, mine }: Counts) {
  state.set(slug, { total, mine });
  document.querySelectorAll<HTMLButtonElement>(`.like[data-slug="${CSS.escape(slug)}"]`).forEach((b) => {
    b.classList.toggle('full', mine >= MAX);
    const rect = b.querySelector<SVGRectElement>('.lv')!;
    rect.setAttribute('y', level(mine));
    rect.style.setProperty('y', `${level(mine)}px`);
    b.querySelector('.lc')!.textContent = String(total);
    b.setAttribute('aria-label', label(b.dataset.t ?? '', mine));
  });
}

const calm = matchMedia('(prefers-reduced-motion: reduce)');
const restart = (el: Element, cls: string) => {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
};

// hearts and sparkles flying out from the heart; a bigger burst on the fifth like
function burst(x: number, y: number, big: boolean) {
  if (calm.matches) return;
  const css = getComputedStyle(document.documentElement);
  const layer = document.createElement('div');
  layer.className = 'like-burst';
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  const k = big ? 14 : 7;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.5;
    const d = (big ? 38 : 24) + Math.random() * 12;
    const p = document.createElement('i');
    p.textContent = i % 3 ? '♥' : '✦';
    p.style.color = css.getPropertyValue(i % 3 ? '--heart' : '--pop');
    p.style.fontSize = `${(7 + Math.random() * 5).toFixed(1)}px`;
    p.style.setProperty('--dx', `${(Math.cos(a) * d).toFixed(1)}px`);
    p.style.setProperty('--dy', `${(Math.sin(a) * d - 6).toFixed(1)}px`);
    p.style.setProperty('--r', `${(Math.random() * 90 - 45).toFixed(0)}deg`);
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 900);
}

// "+1", "5/5 ♥" or "max ♥" floating up from the heart
function float(x: number, y: number, text: string) {
  const f = document.createElement('span');
  f.className = 'like-plus';
  f.textContent = text;
  f.style.left = `${x}px`;
  f.style.top = `${y - 12}px`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 950);
}

document.addEventListener('click', async (ev) => {
  const b = (ev.target as Element).closest<HTMLButtonElement>('.like');
  if (!b) return;
  ev.preventDefault();
  const slug = b.dataset.slug!;
  const r = b.querySelector('svg')!.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const before = state.get(slug) ?? { total: 0, mine: 0 };
  if (before.mine >= MAX) {
    restart(b, 'nope');
    float(cx, cy, 'max ♥');
    return;
  }

  // show it straight away, then settle on what the server says
  const guess = { total: before.total + 1, mine: before.mine + 1 };
  show(slug, guess);
  restart(b, 'pop');
  burst(cx, cy, guess.mine === MAX);
  float(cx, cy, guess.mine === MAX ? `${MAX}/${MAX} ♥` : '+1');
  try {
    const after = await like(slug);
    show(slug, after);
    if (!after.ok) restart(b, 'nope'); // already at the max (say, from another tab)
  } catch {
    show(slug, before); // didn't save: put the heart back
    restart(b, 'nope');
  }
});

// on every page, fill in its hearts with one request (the click handler above is shared by all pages)
onPage(() => {
  const slugs = [
    ...new Set([...document.querySelectorAll<HTMLElement>('.like')].map((b) => b.dataset.slug!)),
  ];
  if (!slugs.length) return;
  loadAll(slugs)
    .then((counts) => slugs.forEach((s) => show(s, counts[s] ?? { total: 0, mine: 0 })))
    .catch(() => slugs.forEach((s) => show(s, { total: 0, mine: 0 })));
});
