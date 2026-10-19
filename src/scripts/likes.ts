// Likes on lab entries: up to 5 per visitor per entry. Every heart for an entry on the page stays in sync.
//
// Storage lives behind load() and like(). For now they keep counts in this browser (like the prototype); the
// next step swaps them for /api/likes/<slug>, which stores totals in Upstash and enforces the limit per visitor.

const MAX = 5;
const KEY = 'aniqa-likes';

type Counts = { total: number; mine: number };

// ---------- storage ----------
const read = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
};
const write = (all: Record<string, number>) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // private mode or storage blocked: likes just won't persist
  }
};

/** Current counts for an entry. */
async function load(slug: string): Promise<Counts> {
  const mine = read()[slug] ?? 0;
  return { total: mine, mine };
}

/** Add one like; refuses past MAX. Returns the counts after the attempt. */
async function like(slug: string): Promise<Counts & { ok: boolean }> {
  const all = read();
  const mine = all[slug] ?? 0;
  if (mine >= MAX) return { total: mine, mine, ok: false };
  all[slug] = mine + 1;
  write(all);
  return { total: mine + 1, mine: mine + 1, ok: true };
}

// ---------- the hearts ----------
const level = (mine: number) => (21 - 17.5 * (mine / MAX)).toFixed(2); // clip height: a fifth of the heart per like
const label = (title: string, mine: number) =>
  mine >= MAX ? `You liked ${title} ${MAX} times, the max` : `Like ${title} (${mine} of ${MAX})`;

function show(slug: string, { total, mine }: Counts) {
  document.querySelectorAll<HTMLButtonElement>(`.like[data-slug="${CSS.escape(slug)}"]`).forEach((b) => {
    b.classList.toggle('full', mine >= MAX);
    const rect = b.querySelector<SVGRectElement>('.lv')!;
    rect.setAttribute('y', level(mine));
    rect.style.setProperty('y', `${level(mine)}px`);
    b.querySelector('.lc')!.textContent = total ? String(total) : '';
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
  const after = await like(slug);
  if (!after.ok) {
    restart(b, 'nope');
    float(cx, cy, 'max ♥');
    return;
  }
  show(slug, after);
  restart(b, 'pop');
  burst(cx, cy, after.mine === MAX);
  float(cx, cy, after.mine === MAX ? `${MAX}/${MAX} ♥` : '+1');
});

// fill in every heart on the page
const slugs = new Set([...document.querySelectorAll<HTMLElement>('.like')].map((b) => b.dataset.slug!));
slugs.forEach(async (slug) => show(slug, await load(slug)));
