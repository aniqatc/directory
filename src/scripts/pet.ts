// Easter egg: the dot by aniqa.dev is alive. Click it and it grows into a little face that follows you around.
// It looks toward your cursor, blinks, squishes as it moves, falls asleep when you stop, hops with a heart when
// clicked, and shrinks back into the logo on double-click or Esc. On touch screens it follows your taps.
// It comes with you between pages: it lives in #pet-layer, which survives page changes (view transitions); on a
// full reload its spot is saved for this tab and it reappears there.
// Which pet comes out (a ghost, a bee, the plain dot…) is set in src/lib/pets.ts.
import { onPage } from './page';
import { currentPet, petMarkup } from '../lib/pets';

// the header (and so the dot) is replaced on every page change, so look it up each time
const dot = () => document.querySelector<HTMLElement>('.brand i');

{
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  let pet: HTMLDivElement | null = null;
  let shadow: HTMLDivElement | null = null;
  let parts: { body: SVGGElement; face: SVGGElement; eyes: SVGGElement[] } | null = null;
  let x = 0; // where it is
  let y = 0;
  let tx = 0; // where it's heading
  let ty = 0;
  let px = 0; // the pointer, which it looks at
  let py = 0;
  let raf = 0;
  let homing = false;
  let born = 0;
  let lastMove = 0;
  let blinkAt = 0;
  let blinkUntil = 0;
  let hopAt = -1e9;
  let lid = 1;

  const home = () => {
    const b = dot()?.getBoundingClientRect();
    return b ? [b.left + b.width / 2, b.top + b.height / 2] : [x, y];
  };
  const wake = () => (lastMove = performance.now());
  // where the pet was when you left the last page (this tab only)
  const KEY = 'aniqa-pet';
  type Saved = { x: number; y: number; px: number; py: number };
  const load = (): Saved | null => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    } catch {
      return null;
    }
  };
  const save = (s: Saved | null) => {
    try {
      if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
      else sessionStorage.removeItem(KEY);
    } catch {
      // storage blocked: the pet just stays on this page
    }
  };

  const goHome = () => {
    if (pet) {
      homing = true;
      wake();
    }
  };

  const hop = () => {
    if (!pet || homing) return;
    hopAt = performance.now();
    pet.classList.remove('hop');
    void pet.offsetWidth;
    pet.classList.add('hop');
    wake();
  };

  /** Out of the logo, or straight back where it was on the last page (already full size, staying put). */
  function release(saved?: Saved) {
    if (saved) {
      x = tx = clamp(saved.x, 16, innerWidth - 16);
      y = ty = clamp(saved.y, 16, innerHeight - 16);
      px = saved.px;
      py = saved.py;
    } else {
      [x, y] = home();
      px = x;
      py = y;
      tx = x + 30;
      ty = y + 52;
    }
    lastMove = performance.now();
    born = saved ? lastMove - 1000 : lastMove;
    homing = false;

    pet = document.createElement('div');
    pet.className = 'pet';
    pet.dataset.pet = currentPet();
    pet.setAttribute('aria-hidden', 'true');
    pet.innerHTML = petMarkup(pet.dataset.pet as ReturnType<typeof currentPet>);
    // a fresh pet plays its way out of the dot once (the chick's shell pops off); one coming back after a
    // reload is already out
    if (!saved && !still) {
      pet.classList.add('born');
      const p = pet;
      setTimeout(() => p.classList.remove('born'), 700);
    }
    shadow = document.createElement('div');
    shadow.className = 'pet-shadow';
    (document.getElementById('pet-layer') ?? document.body).append(shadow, pet);
    parts = {
      body: pet.querySelector('.b')!,
      face: pet.querySelector('.f')!,
      eyes: [...pet.querySelectorAll<SVGGElement>('.e')],
    };
    dot()?.classList.add('out');

    // Click anywhere to make the pet hop with a heart
    document.addEventListener('click', (ev) => {
      if ((ev.target as Element).closest('.brand i')) return;
      hop();
    });
    pet.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      goHome();
    });
    raf = requestAnimationFrame(tick);
  }

  function settle() {
    cancelAnimationFrame(raf);
    pet?.remove();
    shadow?.remove();
    pet = shadow = parts = null;
    dot()?.classList.remove('out');
    save(null);
  }

  function tick(now: number) {
    if (!pet || !shadow || !parts) return;
    if (homing) [tx, ty] = home();

    // ease toward the target; faster on the way home
    const k = still ? 1 : homing ? 0.14 : 0.075;
    const nx = x + (tx - x) * k;
    const ny = y + (ty - y) * k;
    const speed = Math.min(Math.hypot(nx - x, ny - y) / 14, 0.22);
    x = nx;
    y = ny;
    const dist = Math.hypot(tx - x, ty - y);

    const asleep = !homing && now - lastMove > 3200 && speed < 0.01;
    pet.classList.toggle('sleep', asleep);
    if (now > blinkAt) {
      blinkAt = now + 2200 + Math.random() * 3200;
      blinkUntil = now + 150;
    }

    // hop: lift, then a little squash on landing; breathe slower when asleep
    const hp = (now - hopAt) / 560;
    const hopping = hp >= 0 && hp < 1;
    const lift = hopping ? Math.sin(Math.PI * Math.min(hp / 0.7, 1)) : 0;
    const land = hopping && hp > 0.7 ? Math.sin((Math.PI * (hp - 0.7)) / 0.3) * 0.2 : 0;
    const breathe = Math.sin(now / (asleep ? 900 : 520)) * (asleep ? 0.035 : 0.018);
    const squash = speed + land;
    const stretch = (hopping && hp < 0.4 ? 0.1 : 0) + breathe;

    // eyes follow the pointer; drift down when asleep
    const lx = asleep ? 0 : clamp((px - x) / 80, -1, 1);
    const ly = asleep ? 0.35 : clamp((py - y) / 80, -1, 1);
    parts.body.setAttribute(
      'transform',
      `scale(${(1 + squash).toFixed(3)},${(1 - squash + stretch).toFixed(3)})`,
    );
    parts.face.setAttribute('transform', `translate(${(lx * 2.2).toFixed(2)},${(ly * 1.6).toFixed(2)})`);
    lid += ((asleep || now < blinkUntil ? 0.12 : 1) - lid) * 0.45;
    parts.eyes.forEach((e) =>
      e.setAttribute(
        'transform',
        `translate(${e.dataset.x},${e.dataset.y ?? -1}) scale(1,${lid.toFixed(3)})`,
      ),
    );

    // grow out of the logo, shrink back into it
    const grow = still ? 1 : Math.min(1, 0.3 + ((now - born) / 350) * 0.7);
    const shrink = homing ? clamp(dist / 40, 0.3, 1) : 1;
    const sc = grow * shrink;
    pet.style.transform = `translate(${(x - 16).toFixed(1)}px,${(y - 16 - lift * 14).toFixed(1)}px) scale(${sc.toFixed(3)})`;
    shadow.style.transform = `translate(${(x - 12).toFixed(1)}px,${(y + 8.5).toFixed(1)}px) scale(${((1 - lift * 0.45) * sc).toFixed(3)})`;
    shadow.style.opacity = ((1 - lift * 0.55) * (homing ? shrink : 1)).toFixed(2);

    if (homing && dist < 1.2) return settle();
    raf = requestAnimationFrame(tick);
  }

  // the dot sits inside the home link: catch the click first (capture), so the page doesn't change
  document.addEventListener(
    'click',
    (ev) => {
      if (!(ev.target as Element).closest('.brand i')) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (pet) goHome();
      else release();
    },
    { capture: true },
  );
  addEventListener(
    'pointermove',
    (ev) => {
      if (!pet || homing) return;
      px = ev.clientX;
      py = ev.clientY;
      tx = px + 18;
      ty = py + 20;
      wake();
    },
    { passive: true },
  );
  addEventListener(
    'pointerdown',
    (ev) => {
      if (!pet || homing || ev.pointerType === 'mouse') return;
      px = ev.clientX;
      py = ev.clientY;
      tx = px;
      ty = py - 26;
      wake();
    },
    { passive: true },
  );
  addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') goHome();
  });

  // a full reload or leaving the site: remember where it is, unless it's on its way home
  addEventListener('pagehide', () => save(pet && !homing ? { x, y, px, py } : null));

  onPage(() => {
    if (pet) {
      dot()?.classList.add('out'); // still out from the last page: keep the new header's dot hidden
      return;
    }
    const saved = load();
    if (saved) release(saved);
  });
}
