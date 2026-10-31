// Short lists for the portfolio intro and the lab

/** One in-progress item. `href` is optional: a full URL opens in a new tab with ↗, a site path (/lab/…) opens in place. */
export type NowItem = { title: string; blurb: string; href?: string };

/** "Currently tinkering with" chips in the portfolio intro. */
export const TINKERING = ['TypeScript', 'Next.js', 'Astro', 'CSS art', 'Agentic coding'];

/** "Now building" in the portfolio intro */
export const BUILDING: NowItem[] = [
  {
    title: 'huckleberry.csv',
    blurb: 'Turns a Huckleberry baby-tracker export into charts.',
  },
  {
    title: 'For Zayn',
    blurb: 'A CSS art gallery of things that reminds me of my son.',
    href: 'https://zayn.aniqa.dev',
  },
  // next up:
  // {
  //   title: 'unsent.day',
  //   blurb: 'An anonymous, text-only board where strangers can read your unsent words.',
  // },
];
