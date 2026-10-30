// The pet's trail: little marks it leaves behind as it moves, which fade on their own. Each pet leaves its own kind:
// a bee's dotted flight path, paw prints for the walkers, falling leaves for the plants, a ghost's wisps…
// Marks are spaced by distance, not time, so a slow walk leaves a few and a dash leaves a line. pet.ts calls step()
// every frame; nothing is drawn with reduced motion.
import type { PetId } from '../lib/pets';

type TrailKind =
  'dots' | 'flight' | 'prints' | 'leaves' | 'wisps' | 'snow' | 'hearts' | 'confetti' | 'sparkles';

// which trail each pet leaves; anything not listed leaves soft dots
const KIND_FOR: Partial<Record<PetId, TrailKind>> = {
  bee: 'flight',
  bunny: 'prints',
  chick: 'prints',
  frog: 'prints',
  penguin: 'prints',
  owl: 'prints',
  sprout: 'leaves',
  tree: 'leaves',
  acorn: 'leaves',
  pumpkin: 'leaves',
  ghost: 'wisps',
  snowball: 'snow',
  heart: 'hearts',
  party: 'confetti',
  cupcake: 'confetti',
  moon: 'sparkles',
  diya: 'sparkles',
  lantern: 'sparkles',
};

// how far the pet travels between marks, in px
const SPACING: Record<TrailKind, number> = {
  dots: 14,
  flight: 8,
  prints: 15,
  leaves: 28,
  wisps: 18,
  snow: 20,
  hearts: 32,
  confetti: 18,
  sparkles: 24,
};

const CONFETTI = ['#f491b2', '#79d3e6', '#f5c451', '#9be38f', '#b79cf2'];
// enough for a long dash; past this, new marks wait for old ones to fade
const MAX_MARKS = 60;

export function petTrail(pet: HTMLElement) {
  const kind: TrailKind = KIND_FOR[pet.dataset.pet as PetId] ?? 'dots';
  // the marks live beside the pet, outside it, so they take its colours with them
  const layer = document.createElement('div');
  layer.className = 'pet-trails';
  const colours = getComputedStyle(pet);
  for (const name of ['--pet', '--pet-shade', '--pet-leaf', '--pet-light'])
    layer.style.setProperty(name, colours.getPropertyValue(name));
  pet.before(layer);

  let travelled = 0;
  let side = 1;
  let count = 0;

  const drop = (x: number, y: number, angle: number) => {
    if (layer.childElementCount >= MAX_MARKS) return;
    const mark = document.createElement('i');
    mark.className = `pet-trail pet-trail-${kind}`;
    mark.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    if (kind === 'prints') {
      // left, right, left: each print a little to the side of the path, pointing the way it walked
      side = -side;
      mark.style.rotate = `${angle}rad`;
      mark.style.setProperty('--side', `${side * 4}px`);
    }
    if (kind === 'confetti') mark.style.setProperty('--c', CONFETTI[count % CONFETTI.length]);
    if (kind === 'leaves' || kind === 'confetti')
      mark.style.setProperty('--turn', `${(count % 2 ? 1 : -1) * (90 + (count % 5) * 30)}deg`);
    count++;
    mark.addEventListener('animationend', () => mark.remove(), { once: true });
    layer.append(mark);
  };

  return {
    /** Called every frame with where the pet's feet are and how far it just moved; `airborne` skips prints mid-hop. */
    step(x: number, y: number, dx: number, dy: number, airborne: boolean) {
      travelled += Math.hypot(dx, dy);
      if (travelled < SPACING[kind]) return;
      travelled = 0;
      if (kind === 'prints' && airborne) return;
      drop(x, y, Math.atan2(dy, dx));
    },
    /** The pet's gone home: let the last marks fade, then tidy up. */
    clear() {
      setTimeout(() => layer.remove(), 2000);
    },
  };
}
