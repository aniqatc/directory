// The pets that can come out of the dot by aniqa.dev. They all behave the same (src/scripts/pet.ts follows,
// blinks, sleeps, hops and goes home); each one here is only a drawing.
//
// To change the pet, set PET below. 'auto' picks one by today's date from SEASONS.

export type PetId =
  | 'dot'
  | 'chick'
  | 'bee'
  | 'sprout'
  | 'bunny'
  | 'ghost'
  | 'mochi'
  | 'acorn'
  | 'snowball'
  | 'heart';

/** The pet everyone gets. 'auto' follows the calendar in SEASONS. */
export const PET: PetId | 'auto' = 'ghost';

/** Used when PET is 'auto'. Dates are MM-DD and inclusive; anything not listed gets FALLBACK. */
export const SEASONS: { from: string; to: string; pet: PetId }[] = [
  { from: '02-01', to: '02-14', pet: 'heart' },
  { from: '03-01', to: '04-30', pet: 'chick' },
  { from: '05-01', to: '08-31', pet: 'bee' },
  { from: '10-01', to: '10-31', pet: 'ghost' },
  { from: '11-01', to: '11-30', pet: 'acorn' },
  { from: '12-01', to: '12-31', pet: 'snowball' },
];
export const FALLBACK: PetId = 'dot';

/** The pet for a given day (the visitor's own date, so it changes without a rebuild). */
export function currentPet(today = new Date()): PetId {
  if (PET !== 'auto') return PET;
  const md = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return SEASONS.find((s) => md >= s.from && md <= s.to)?.pet ?? FALLBACK;
}

// ---------- drawings ----------
// Everything is drawn around (0, 0) with a body about 20 units wide, like the original dot; parts may reach
// past the 32-unit box. pet.ts squashes `.b`, moves the face `.f` to look at you and blinks the `.e` eyes.
// Classes Pet.astro understands:
//   awake-only / sleep-only   swap parts when it falls asleep (ears flop, leaves droop)
//   hop-only                  appears for a moment when it's tapped (wings, a flower)
//   born-only                 plays once as it comes out of the dot (the chick's eggshell)
//   pet-cap                   a hat that gets pulled down for a nap and bounces on a tap
//   pet-wing-l / -r, pet-flap-l / -r, pet-sway   small idle loops

type Face = {
  y?: number; // moves the whole face
  eyeX?: number;
  blushX?: number;
  blush?: string;
  mouth?: string;
};

export type PetDrawing = {
  label: string;
  back?: string; // behind the body
  body: string;
  front?: string; // over the face
  face?: Face;
  reward?: string; // replaces the heart that floats up on a tap
};

const INK = 'var(--ink)';
const SMILE = `<path d="M-1.9 2.7 Q0 4.6 1.9 2.7" stroke="${INK}" stroke-width="1.25" fill="none" stroke-linecap="round"/>`;
const SHELL =
  'fill="#fbf6ea" stroke="var(--ink)" stroke-opacity=".25" stroke-width=".6" stroke-linejoin="round"';
const WING = 'fill="#fff" fill-opacity=".85" stroke="var(--ink)" stroke-opacity=".3" stroke-width=".6"';
// darker shades of the pet colour (tokens.css), so they follow the accent if it changes
const SHADE = 'var(--pet-shade)'; // wings, flippers
const LEAF = 'var(--pet-leaf)';
const STEM = 'var(--pet-deep)'; // stems, the bee's stripes, the snowball's beanie
const CAP = '#b7834f';
const CAP_LINE = '#8f6237';

export const PETS: Record<PetId, PetDrawing> = {
  dot: {
    label: 'The dot',
    body: '<circle r="10" fill="var(--pet)"/>',
  },

  chick: {
    label: 'Egg & chick',
    back: `<g class="hop-only">
      <g class="pet-flap-l"><ellipse cx="-10" cy="0" rx="3.2" ry="1.8" transform="rotate(-35 -10 0)" fill="${SHADE}"/></g>
      <g class="pet-flap-r"><ellipse cx="10" cy="0" rx="3.2" ry="1.8" transform="rotate(35 10 0)" fill="${SHADE}"/></g></g>`,
    body: `<circle cy="-1" r="9.6" fill="var(--pet)"/>
      <path d="M-1.6 -10.2 Q-0.6 -14 0.8 -10.4 Q1.8 -13.2 3.2 -10" fill="none" stroke="var(--pet)" stroke-width="1.6" stroke-linecap="round"/>`,
    face: { y: -1.4, mouth: '<path d="M-1.5 1.4 L1.5 1.4 L0 3.3 Z" fill="#f2b54b"/>' },
    front: `<g transform="translate(0,-1.5)">
        <path d="M-11 5 L-8 2 L-5 5 L-2 2 L1 5 L4 2 L7 5 L10 2 L11 5 Q11 15 0 15 Q-11 15 -11 5 Z" ${SHELL}/>
      </g>
      <g class="sleep-only"><path d="M-7.5 -5 Q-7.5 -13.5 0 -13.5 Q7.5 -13.5 7.5 -5 L5 -7 L2.5 -5 L0 -7 L-2.5 -5 L-5 -7 Z" transform="translate(0.5,-5.4) rotate(-10)" ${SHELL}/></g>
      <g class="born-only"><path d="M-9 1.5 Q-9 -9.5 0 -9.5 Q9 -9.5 9 1.5 L6 -1.5 L3 1.5 L0 -1.5 L-3 1.5 L-6 -1.5 Z" transform="translate(0,-1) scale(1.12)" ${SHELL}/></g>`,
  },

  bee: {
    label: 'Bumblebee',
    back: `<g class="awake-only">
        <g class="pet-wing-l"><ellipse cx="-8" cy="-9.5" rx="4" ry="5.6" transform="rotate(-35 -8 -9.5)" ${WING}/></g>
        <g class="pet-wing-r"><ellipse cx="8" cy="-9.5" rx="4" ry="5.6" transform="rotate(35 8 -9.5)" ${WING}/></g>
        <path d="M-3 -9 Q-4 -13.5 -6.2 -15 M3 -9 Q4 -13.5 6.2 -15" fill="none" stroke="var(--pet-line)" stroke-width="1.1" stroke-linecap="round"/>
        <circle cx="-6.4" cy="-15.2" r="1.4" fill="var(--pet-line)"/><circle cx="6.4" cy="-15.2" r="1.4" fill="var(--pet-line)"/>
      </g>
      <g class="sleep-only">
        <ellipse cx="-10.2" cy="2" rx="2.6" ry="5" transform="rotate(20 -10.2 2)" ${WING}/>
        <ellipse cx="10.2" cy="2" rx="2.6" ry="5" transform="rotate(-20 10.2 2)" ${WING}/>
        <path d="M-3 -8.4 Q-6 -11.6 -8.6 -10.2 M3 -8.4 Q6 -11.6 8.6 -10.2" fill="none" stroke="var(--pet-line)" stroke-width="1.1" stroke-linecap="round"/>
        <circle cx="-8.8" cy="-10" r="1.3" fill="var(--pet-line)"/><circle cx="8.8" cy="-10" r="1.3" fill="var(--pet-line)"/>
      </g>`,
    body: `<defs><clipPath id="pet-bee-body"><circle r="10"/></clipPath></defs>
      <circle r="10" fill="var(--pet)"/>
      <g clip-path="url(#pet-bee-body)" fill="${STEM}"><rect x="-11" y="5.2" width="22" height="2"/><rect x="-11" y="8.6" width="22" height="2.4"/></g>`,
    face: { y: -1.5 },
  },

  sprout: {
    label: 'Sprout',
    back: `<g class="awake-only"><g class="pet-sway">
        <path d="M0 -8 Q0.6 -11.5 0 -14" fill="none" stroke="${STEM}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M0 -13 Q-7.5 -17.5 -9 -12 Q-4.5 -9.5 0 -13 Z" fill="${LEAF}"/>
        <path d="M0 -14 Q6.5 -19.5 9 -14.5 Q4.5 -11.5 0 -14 Z" fill="${LEAF}"/>
      </g></g>
      <g class="sleep-only">
        <path d="M0 -7.2 Q0.4 -9.6 -0.6 -11" fill="none" stroke="${STEM}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M-0.6 -11 Q-6.5 -10.5 -8.6 -5.5 Q-3.5 -6.5 -0.6 -11 Z" fill="${LEAF}"/>
        <path d="M-0.6 -11 Q5 -11.5 7.6 -6.8 Q3 -7.2 -0.6 -11 Z" fill="${LEAF}"/>
      </g>
      <g class="hop-only">
        <g fill="var(--blush)"><circle cx="0" cy="-18.8" r="2.3"/><circle cx="2.66" cy="-16.86" r="2.3"/><circle cx="1.65" cy="-13.73" r="2.3"/><circle cx="-1.65" cy="-13.73" r="2.3"/><circle cx="-2.66" cy="-16.86" r="2.3"/></g>
        <circle cx="0" cy="-16" r="1.5" fill="#f5c451"/>
      </g>`,
    body: '<ellipse cy="1" rx="10" ry="9.4" fill="var(--pet)"/>',
    face: { y: 0.5 },
    reward: '',
  },

  bunny: {
    label: 'Bunny',
    back: `<g class="awake-only">
        <ellipse cx="-4.6" cy="-13" rx="3" ry="7.2" transform="rotate(-10 -4.6 -13)" fill="var(--pet)"/>
        <ellipse cx="-4.6" cy="-13" rx="1.3" ry="4.8" transform="rotate(-10 -4.6 -13)" fill="var(--blush)" opacity=".8"/>
        <ellipse cx="4.6" cy="-13" rx="3" ry="7.2" transform="rotate(10 4.6 -13)" fill="var(--pet)"/>
        <ellipse cx="4.6" cy="-13" rx="1.3" ry="4.8" transform="rotate(10 4.6 -13)" fill="var(--blush)" opacity=".8"/>
      </g>
      <g class="sleep-only">
        <ellipse cx="-10.5" cy="-4" rx="2.8" ry="6.8" transform="rotate(-62 -10.5 -4)" fill="var(--pet)"/>
        <ellipse cx="-10.5" cy="-4" rx="1.2" ry="4.5" transform="rotate(-62 -10.5 -4)" fill="var(--blush)" opacity=".8"/>
        <ellipse cx="10.5" cy="-4" rx="2.8" ry="6.8" transform="rotate(62 10.5 -4)" fill="var(--pet)"/>
        <ellipse cx="10.5" cy="-4" rx="1.2" ry="4.5" transform="rotate(62 10.5 -4)" fill="var(--blush)" opacity=".8"/>
      </g>`,
    body: '<circle r="10" fill="var(--pet)"/>',
    face: {
      y: -0.4,
      mouth: `<path d="M-1 1.6 L1 1.6 L0 2.7 Z" fill="#e0749a"/>
        <path d="M-1.8 3.6 Q-0.9 4.6 0 3.6 Q0.9 4.6 1.8 3.6" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`,
    },
  },

  ghost: {
    label: 'Ghost',
    back: `<g class="hop-only">
      <ellipse cx="-10" cy="-1" rx="2.2" ry="3.2" transform="rotate(35 -10 -1)" fill="var(--pet)"/>
      <ellipse cx="10" cy="-1" rx="2.2" ry="3.2" transform="rotate(-35 10 -1)" fill="var(--pet)"/></g>`,
    body: '<path class="pet-ghost" d="M-9.5 1 A9.5 9.5 0 0 1 9.5 1 L9.5 10 Q7.9 12.6 6.3 10 Q4.7 7.4 3.2 10 Q1.6 12.6 0 10 Q-1.6 7.4 -3.2 10 Q-4.7 12.6 -6.3 10 Q-7.9 7.4 -9.5 10 Z" fill="var(--pet)"/>',
    face: { mouth: `<ellipse cx="0" cy="3.6" rx="1.1" ry="1.4" fill="${INK}"/>` },
  },

  mochi: {
    label: 'Mochi',
    body: `<path d="M-11 9 Q-12 -9 0 -9.5 Q12 -9 11 9 Q0 11.5 -11 9 Z" fill="var(--pet)"/>
      <ellipse cx="-5.5" cy="-5" rx="2.6" ry="1.6" transform="rotate(-25 -5.5 -5)" fill="#fff" opacity=".5"/>`,
    face: { y: 0.5 },
  },

  acorn: {
    label: 'Acorn',
    body: '<path d="M-9.2 -3 Q-9.6 8 0 13 Q9.6 8 9.2 -3 Z" fill="var(--pet)"/>',
    face: { y: 3 },
    front: `<g class="pet-cap">
      <path d="M-10.6 -2.6 Q-10.8 -11 0 -11.2 Q10.8 -11 10.6 -2.6 Q0 -0.6 -10.6 -2.6 Z" fill="${CAP}"/>
      <path d="M-6 -8.5 L-3.5 -4.5 M-1 -9.8 L1.5 -4 M4 -9 L6.5 -4.5 M-8.5 -5.5 L-6.5 -3 M8 -6.5 L9 -3.5" stroke="${CAP_LINE}" stroke-width=".7" stroke-linecap="round"/>
      <path d="M0 -11 Q0.4 -13.6 2.2 -14.6" fill="none" stroke="${CAP_LINE}" stroke-width="1.4" stroke-linecap="round"/></g>`,
  },

  snowball: {
    label: 'Snowball',
    body: '<circle r="10" fill="var(--pet)"/>',
    face: { y: 1.4 },
    front: `<path d="M-9.2 4.6 Q0 9 9.2 4.6 L8.8 7.4 Q0 11.8 -8.8 7.4 Z" fill="var(--blush)"/>
      <path d="M3.6 8.6 L5.6 14.4 L8.4 13.4 L6.6 8 Z" fill="#e2789c"/>
      <g class="pet-cap">
        <path d="M-9 -4.5 Q-9 -14 0 -14 Q9 -14 9 -4.5 Z" fill="${STEM}"/>
        <rect x="-9.8" y="-6.2" width="19.6" height="3.2" rx="1.6" fill="#fbf6ea" stroke="var(--ink)" stroke-opacity=".15" stroke-width=".5"/>
        <circle cx="0" cy="-14.4" r="2.4" fill="#fbf6ea" stroke="var(--ink)" stroke-opacity=".15" stroke-width=".5"/>
      </g>`,
    reward: `<svg class="pet-heart" viewBox="-5 -5 10 10"><path d="M0 -3.5 L0 3.5 M-3 -1.75 L3 1.75 M-3 1.75 L3 -1.75" stroke="var(--pet-line)" stroke-width="1.1" stroke-linecap="round"/></svg>`,
  },

  heart: {
    label: 'Heart',
    body: '<path d="M0 10 C-6 5.5 -11 1.5 -11 -3.5 C-11 -7.5 -8 -10 -5 -10 C-2.6 -10 -0.8 -8.6 0 -7 C0.8 -8.6 2.6 -10 5 -10 C8 -10 11 -7.5 11 -3.5 C11 1.5 6 5.5 0 10 Z" fill="#f6a3c0"/>',
    face: { y: -2, eyeX: 3.6, blushX: 6.2, blush: '#e8709a' },
    reward: `<svg class="pet-heart" viewBox="0 0 22 12" style="left: 5px; top: -9px; width: 22px; height: 12px">
      <path d="M4 10 L1.8 7.8 A1.25 1.25 0 0 1 4 6.2 A1.25 1.25 0 0 1 6.2 7.8 Z" fill="var(--pet)"/>
      <path d="M11 7.5 L8.6 5.1 A1.4 1.4 0 0 1 11 3.3 A1.4 1.4 0 0 1 13.4 5.1 Z" fill="#e8709a"/>
      <path d="M18 10 L15.8 7.8 A1.25 1.25 0 0 1 18 6.2 A1.25 1.25 0 0 1 20.2 7.8 Z" fill="var(--pet)"/></svg>`,
  },
};

const HEART = `<svg class="pet-heart" viewBox="0 0 10 10"><path d="M5 9 L1.2 5.2 A2.2 2.2 0 0 1 5 2.4 A2.2 2.2 0 0 1 8.8 5.2 Z" fill="var(--blush)"/></svg>`;

/** The pet's markup: the drawing in an svg, the z's for sleeping, and what floats up on a tap. */
export function petMarkup(id: PetId): string {
  const p = PETS[id];
  const f = p.face ?? {};
  const ex = f.eyeX ?? 3.3;
  const bx = f.blushX ?? 5.6;
  const blush = f.blush ?? 'var(--blush)';
  const eye = (x: number) =>
    `<g class="e" data-x="${x}" data-y="-1"><ellipse rx="1.55" ry="2.15" fill="${INK}"/><circle cx="-.5" cy="-.8" r=".6" fill="#fff"/></g>`;
  return `<svg viewBox="-16 -16 32 32">
    ${p.back ?? ''}
    <g class="b">${p.body}
      <g class="f"><g transform="translate(0,${f.y ?? 0})">
        <ellipse cx="${-bx}" cy="2.4" rx="2.3" ry="1.3" fill="${blush}" opacity=".85"/>
        <ellipse cx="${bx}" cy="2.4" rx="2.3" ry="1.3" fill="${blush}" opacity=".85"/>
        ${eye(-ex)}${eye(ex)}
        ${f.mouth ?? SMILE}
      </g></g>
      ${p.front ?? ''}
    </g></svg>
    <span class="pet-z">z</span><span class="pet-z">z</span>
    ${p.reward ?? HEART}`;
}
