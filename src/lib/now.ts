// Short lists for the portfolio intro and the lab

/** One in-progress item. `href` is optional: a full URL opens in a new tab with ↗, a site path (/lab/…) opens in place. */
export type NowItem = { title: string; blurb: string; href?: string };

/** "Currently tinkering with" chips in the portfolio intro. */
export const TINKERING = ['TypeScript', 'p5.js', 'React', 'Next.js', 'Astro', 'Agentic coding'];

/** "Now building" in the portfolio intro */
export const BUILDING: NowItem[] = [
  {
    title: 'huckleberry.csv',
    blurb:
      'Turns a Huckleberry baby-tracker export into charts, with each day drawn as a ring on a 24-hour clock.',
  },
  { title: 'For Zayn', blurb: 'A gallery of CSS art, each one something that reminds me of my son.' },
  // next up:
  // {
  //   title: 'unsent.day',
  //   blurb: 'An anonymous, text-only board where strangers can read your unsent words.',
  // },
];
