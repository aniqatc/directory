// Easter egg: the dot by aniqa.dev is alive. Click it and it grows into a little face that follows you around.
// It looks toward your cursor, blinks, squishes as it moves, falls asleep when you stop, hops with a heart when
// clicked, and shrinks back into the logo on double-click or Esc. On touch screens it follows your taps.
const dot = document.querySelector<HTMLElement>('.brand i');

if (dot) {
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
    const b = dot.getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2];
  };
  const wake = () => (lastMove = performance.now());
  const goHome = () => {
    if (pet) {
      homing = true;
      wake();
    }
  };

  function release() {
    [x, y] = home();
    px = x;
    py = y;
    tx = x + 30;
    ty = y + 52;
    born = lastMove = performance.now();
    homing = false;

    pet = document.createElement('div');
    pet.className = 'pet';
    pet.setAttribute('aria-hidden', 'true');
    pet.innerHTML = `<svg viewBox="-16 -16 32 32">
      <g class="b"><circle r="10" fill="var(--pet)"/>
        <g class="f">
          <ellipse cx="-5.6" cy="2.4" rx="2.3" ry="1.3" fill="var(--blush)" opacity=".85"/>
          <ellipse cx="5.6" cy="2.4" rx="2.3" ry="1.3" fill="var(--blush)" opacity=".85"/>
          <g class="e" data-x="-3.3"><ellipse rx="1.55" ry="2.15" fill="var(--ink)"/><circle cx="-.5" cy="-.8" r=".6" fill="#fff"/></g>
          <g class="e" data-x="3.3"><ellipse rx="1.55" ry="2.15" fill="var(--ink)"/><circle cx="-.5" cy="-.8" r=".6" fill="#fff"/></g>
          <path d="M-1.9 2.7 Q0 4.6 1.9 2.7" stroke="var(--ink)" stroke-width="1.25" fill="none" stroke-linecap="round"/>
        </g></g></svg>
      <span class="pet-z">z</span><span class="pet-z">z</span>
      <svg class="pet-heart" viewBox="0 0 10 10"><path d="M5 9 L1.2 5.2 A2.2 2.2 0 0 1 5 2.4 A2.2 2.2 0 0 1 8.8 5.2 Z" fill="var(--blush)"/></svg>`;
    shadow = document.createElement('div');
    shadow.className = 'pet-shadow';
    document.body.append(shadow, pet);
    parts = {
      body: pet.querySelector('.b')!,
      face: pet.querySelector('.f')!,
      eyes: [...pet.querySelectorAll<SVGGElement>('.e')],
    };
    dot!.classList.add('out');

    pet.addEventListener('click', (ev) => {
      ev.stopPropagation();
      hopAt = performance.now();
      pet!.classList.remove('hop');
      void pet!.offsetWidth;
      pet!.classList.add('hop');
      wake();
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
    dot!.classList.remove('out');
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
      e.setAttribute('transform', `translate(${e.dataset.x},-1) scale(1,${lid.toFixed(3)})`),
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

  dot.addEventListener('click', (ev) => {
    ev.preventDefault(); // the dot sits inside the home link
    ev.stopPropagation();
    if (pet) goHome();
    else release();
  });
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
}
