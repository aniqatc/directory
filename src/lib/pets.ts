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
  | 'heart'
  | 'owl'
  | 'frog'
  | 'party'
  | 'penguin'
  | 'cupcake';

/** The pet everyone gets: a name to pin one, or 'auto' to follow the calendar in SEASONS. */
export const PET: PetId | 'auto' = 'auto';

/**
 * Used when PET is 'auto'. Dates are MM-DD and inclusive, and the first match wins, so single days sit at the
 * top and override the month they fall in. Anything not listed gets FALLBACK.
 */
export const SEASONS: { from: string; to: string; pet: PetId }[] = [
  // special days
  { from: '02-27', to: '02-27', pet: 'cupcake' }, // my birthday
  { from: '06-26', to: '06-26', pet: 'party' }, // our anniversary
  { from: '06-30', to: '06-30', pet: 'cupcake' }, // my son's birthday
  { from: '09-20', to: '09-20', pet: 'cupcake' }, // my husband's birthday
  { from: '12-31', to: '12-31', pet: 'party' }, // New Year's Eve

  // the rest of the year
  { from: '01-01', to: '01-07', pet: 'party' }, // New Year's week
  { from: '01-08', to: '01-31', pet: 'penguin' },
  { from: '02-01', to: '02-14', pet: 'heart' }, // Valentine's
  { from: '02-15', to: '02-29', pet: 'mochi' },
  { from: '03-01', to: '03-31', pet: 'chick' }, // spring, Easter
  { from: '04-01', to: '04-30', pet: 'bunny' },
  { from: '05-01', to: '05-31', pet: 'sprout' },
  { from: '06-01', to: '06-30', pet: 'bee' },
  { from: '07-01', to: '08-31', pet: 'frog' },
  { from: '09-01', to: '09-30', pet: 'owl' }, // back to school
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
  eyeY?: number;
  eye?: string; // replaces the eye drawing (centred on 0, 0); it still blinks and closes in its sleep
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
const BELLY = 'var(--pet-light)'; // the owl's and frog's bellies
const CREAM = '#fbf6ea';
const YELLOW = '#f2b54b'; // beaks and feet
const BEAK = `<path d="M-1.2 0.4 L1.2 0.4 L0 2.4 Z" fill="${YELLOW}"/>`;
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

  owl: {
    label: 'Owl',
    back: `<ellipse cx="-9.6" cy="3" rx="2.4" ry="4.6" fill="${SHADE}"/>
      <ellipse cx="9.6" cy="3" rx="2.4" ry="4.6" fill="${SHADE}"/>
      <g class="hop-only">
        <g class="pet-flap-l"><ellipse cx="-10.6" cy="0" rx="2.4" ry="4.6" transform="rotate(40 -10.6 0)" fill="${SHADE}"/></g>
        <g class="pet-flap-r"><ellipse cx="10.6" cy="0" rx="2.4" ry="4.6" transform="rotate(-40 10.6 0)" fill="${SHADE}"/></g>
      </g>`,
    body: `<path d="M-8.4 -5 L-9.4 -13 L-3.6 -8.6 Z M8.4 -5 L9.4 -13 L3.6 -8.6 Z" fill="var(--pet)" stroke="var(--pet)" stroke-width="1" stroke-linejoin="round"/>
      <ellipse cy="0.5" rx="10" ry="10.5" fill="var(--pet)"/>
      <ellipse cy="5" rx="5.6" ry="4.8" fill="${BELLY}"/>
      <path d="M-2.6 4 Q-1.8 5 -1 4 M1 4 Q1.8 5 2.6 4 M-0.8 6.6 Q0 7.6 0.8 6.6" fill="none" stroke="${SHADE}" stroke-width=".6" stroke-linecap="round"/>`,
    face: {
      eyeX: 3.8,
      eyeY: -2.6,
      blushX: 7.2,
      eye: `<circle r="3.4" fill="${CREAM}"/><circle r="1.8" fill="${INK}"/><circle cx="-.6" cy="-.7" r=".6" fill="#fff"/>`,
      mouth: BEAK,
    },
  },

  frog: {
    label: 'Frog',
    body: `<ellipse cx="-6" cy="10.4" rx="3" ry="1.4" fill="${SHADE}"/>
      <ellipse cx="6" cy="10.4" rx="3" ry="1.4" fill="${SHADE}"/>
      <circle cx="-5" cy="-6" r="3.8" fill="var(--pet)"/><circle cx="5" cy="-6" r="3.8" fill="var(--pet)"/>
      <ellipse cy="2" rx="11" ry="8.6" fill="var(--pet)"/>
      <ellipse cy="6" rx="6" ry="3.6" fill="${BELLY}"/>`,
    face: {
      y: -1.8,
      eyeX: 5,
      eyeY: -4.2,
      blushX: 7.4,
      eye: `<circle r="2.5" fill="${CREAM}"/><circle r="1.4" fill="${INK}"/><circle cx="-.5" cy="-.6" r=".5" fill="#fff"/>`,
      mouth: `<path d="M-4.6 2.2 Q0 5.4 4.6 2.2" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>`,
    },
    // the tongue zips out on a tap
    front: `<g class="hop-only pet-tongue">
      <path d="M1.5 1.4 Q8 0 14 -8" fill="none" stroke="#e8709a" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="14" cy="-8" r="1.5" fill="#e8709a"/></g>`,
  },

  party: {
    label: 'Party hat',
    body: '<circle r="10" fill="var(--pet)"/>',
    front: `<g class="pet-cap">
      <path d="M-5.5 -7.6 L1 -21 L6.5 -7 Q0.5 -5.4 -5.5 -7.6 Z" fill="var(--blush)"/>
      <path d="M-3.4 -11.6 L4.6 -10.9 M-1.3 -16 L3 -15.6" stroke="${CREAM}" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="1" cy="-21.2" r="1.9" fill="#f5c451"/></g>`,
    reward: `<svg class="pet-heart" viewBox="0 0 24 14" style="left: 4px; top: -12px; width: 24px; height: 14px">
      <rect x="2" y="6" width="1.6" height="3" rx=".4" transform="rotate(-30 2.8 7.5)" fill="#f5c451"/>
      <circle cx="7" cy="3" r="1.1" fill="var(--pet)"/>
      <rect x="11" y="1" width="1.6" height="3" rx=".4" transform="rotate(20 11.8 2.5)" fill="var(--blush)"/>
      <circle cx="16" cy="4" r="1.1" fill="#f5c451"/>
      <rect x="20" y="7" width="1.6" height="3" rx=".4" transform="rotate(35 20.8 8.5)" fill="var(--pet)"/>
      <circle cx="12" cy="10" r=".9" fill="var(--blush)"/></svg>`,
  },

  penguin: {
    label: 'Penguin',
    back: `<g class="awake-only">
        <ellipse cx="-10" cy="3" rx="2" ry="5" transform="rotate(15 -10 3)" fill="${SHADE}"/>
        <ellipse cx="10" cy="3" rx="2" ry="5" transform="rotate(-15 10 3)" fill="${SHADE}"/>
      </g>
      <g class="sleep-only">
        <ellipse cx="-9.2" cy="3.4" rx="2" ry="5" fill="${SHADE}"/>
        <ellipse cx="9.2" cy="3.4" rx="2" ry="5" fill="${SHADE}"/>
      </g>
      <g class="hop-only">
        <g class="pet-flap-l"><ellipse cx="-10.4" cy="0" rx="2" ry="5" transform="rotate(50 -10.4 0)" fill="${SHADE}"/></g>
        <g class="pet-flap-r"><ellipse cx="10.4" cy="0" rx="2" ry="5" transform="rotate(-50 10.4 0)" fill="${SHADE}"/></g>
      </g>`,
    body: `<ellipse cx="-3.6" cy="11.4" rx="2.6" ry="1.2" fill="${YELLOW}"/>
      <ellipse cx="3.6" cy="11.4" rx="2.6" ry="1.2" fill="${YELLOW}"/>
      <ellipse cy="1" rx="10" ry="11" fill="var(--pet)"/>
      <path d="M0 -6.5 C-2 -9 -7.4 -8 -7.4 -2.5 C-7.6 4 -5 10.6 0 10.6 C5 10.6 7.6 4 7.4 -2.5 C7.4 -8 2 -9 0 -6.5 Z" fill="${CREAM}"/>`,
    face: { eyeX: 3, eyeY: -2.4, blushX: 5, mouth: `<path d="M-1.4 0 L1.4 0 L0 2 Z" fill="${YELLOW}"/>` },
  },

  cupcake: {
    label: 'Cupcake',
    body: `<path d="M-8.4 2.4 L8.4 2.4 L6.4 12 L-6.4 12 Z" fill="var(--blush)"/>
      <path d="M-4.6 2.4 L-3.8 12 M-1.5 2.4 L-1.3 12 M1.5 2.4 L1.3 12 M4.6 2.4 L3.8 12" stroke="#e2789c" stroke-width=".8"/>
      <path d="M-10 3.6 Q-11.2 -2.4 -6.4 -3.8 Q-6.4 -10.4 0 -10 Q6.4 -10.4 6.4 -3.8 Q11.2 -2.4 10 3.6 Q0 6 -10 3.6 Z" fill="var(--pet)"/>
      <g stroke-width="1" stroke-linecap="round">
        <path d="M-6.4 -4.8 L-5.4 -5.6" stroke="${YELLOW}"/><path d="M6 -5.4 L6.8 -4.4" stroke="var(--blush)"/>
        <path d="M-2.4 -8.4 L-1.4 -8.8" stroke="${CREAM}"/><path d="M2.4 -8.2 L3.2 -7.4" stroke="${YELLOW}"/>
      </g>
      <rect x="-0.9" y="-15.6" width="1.8" height="5.8" rx=".5" fill="${CREAM}" stroke="var(--ink)" stroke-opacity=".2" stroke-width=".4"/>
      <path d="M-0.9 -14 L0.9 -14.8 M-0.9 -11.8 L0.9 -12.6" stroke="var(--blush)" stroke-width=".6"/>
      <g class="awake-only"><g class="pet-flicker">
        <path d="M0 -20.6 Q1.6 -18.2 1.2 -17 Q0 -15.6 -1.2 -17 Q-1.6 -18.2 0 -20.6 Z" fill="${YELLOW}"/>
        <ellipse cy="-17.4" rx=".5" ry=".8" fill="${CREAM}"/></g></g>
      <g class="sleep-only">
        <path d="M0 -15.6 L0 -16.6" stroke="var(--ink)" stroke-width=".6" stroke-linecap="round"/>
        <g class="pet-smoke"><path d="M0 -17 Q-1.2 -18.6 0 -20 Q1.2 -21.4 0 -23" fill="none" stroke="var(--muted)" stroke-width=".7" stroke-linecap="round"/></g>
      </g>`,
    face: { y: -3, eyeX: 3.2, eyeY: -0.2, blushX: 5.8 },
    // the usual heart, moved off the candle
    reward: `<svg class="pet-heart" viewBox="0 0 10 10" style="left: 21px; top: -1px"><path d="M5 9 L1.2 5.2 A2.2 2.2 0 0 1 5 2.4 A2.2 2.2 0 0 1 8.8 5.2 Z" fill="var(--blush)"/></svg>`,
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
    `<g class="e" data-x="${x}" data-y="${f.eyeY ?? -1}">${f.eye ?? `<ellipse rx="1.55" ry="2.15" fill="${INK}"/><circle cx="-.5" cy="-.8" r=".6" fill="#fff"/>`}</g>`;
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
