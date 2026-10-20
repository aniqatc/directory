import { getCollection, type CollectionEntry } from 'astro:content';
import { CONTACT } from './contact';

/** A portfolio project: src/content/projects. */
export type Project = CollectionEntry<'projects'>;
/** A lab entry (src/content/experiments) with its archive number (No. 01 is the oldest). */
export type LabEntry = CollectionEntry<'experiments'> & { n: number };
/** Either kind; for helpers that work on both. */
export type Entry = Project | CollectionEntry<'experiments'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 3 → "03" */
export const pad = (n: number) => String(n).padStart(2, '0');
/** "2023-10" → "Oct 2023" */
export const fmtMonth = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const year = (p: Entry) => p.data.released.slice(0, 4);

// oldest first; same-month entries fall back to title so numbers stay stable
const byRelease = (a: Entry, b: Entry) =>
  a.data.released.localeCompare(b.data.released) || a.data.title.localeCompare(b.data.title);

// drafts stay off the portfolio and the lab (the /dev/drawings gallery still lists them)
const visible = (e: Entry) => !e.data.draft;

/** Selected work (src/content/projects), in the order of each file's `order` number. */
export async function getSelected(): Promise<Project[]> {
  return (await getCollection('projects', visible)).sort((a, b) => a.data.order - b.data.order);
}

/** The lab (src/content/experiments), oldest first and numbered. */
export async function getLab(): Promise<LabEntry[]> {
  const lab = await getCollection('experiments', visible);
  return lab.sort(byRelease).map((p, i) => ({ ...p, n: i + 1 }));
}

/** Lab entries grouped by year, newest year first and newest entry first within each year. */
export function byYear<T extends Entry>(entries: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const p of [...entries].sort(byRelease).reverse()) {
    const y = year(p);
    groups.set(y, [...(groups.get(y) ?? []), p]);
  }
  return [...groups];
}

/** Real entries only: placeholder examples don't count. */
export const real = <T extends LabEntry>(entries: T[]) => entries.filter((p) => !p.data.example);

/** The numbers in the lab's stats row. */
export function stats(lab: LabEntry[]) {
  const dates = real(lab)
    .map((p) => p.data.released)
    .sort();
  return { entries: dates.length, started: dates[0], last: dates[dates.length - 1] };
}

/** When an entry last changed: its `updated` month, or its release month if it hasn't been revisited. */
export const lastTouched = (p: Entry) => p.data.updated ?? p.data.released;

/** The most recently released or updated real lab entries, for "Latest in the lab". */
export const latest = (lab: LabEntry[], count = 3) =>
  real(lab)
    .sort((a, b) => lastTouched(a).localeCompare(lastTouched(b)) || byRelease(a, b))
    .reverse()
    .slice(0, count);

/** An entry's own folder in this site's repo, where the code for a sketch or study that runs on the page lives. */
export const folderLink = (p: Entry) => ({
  label: 'Code ↗',
  href: `${CONTACT.github}/directory/tree/main/src/content/${p.collection}/${p.id}`,
});

/** Live / npm and Code links for a project, in that order. */
export function links(p: Entry) {
  const out: { label: string; href: string }[] = [];
  if (p.data.live) {
    out.push({ label: p.data.live.includes('npmjs') ? 'npm ↗' : 'Live ↗', href: `https://${p.data.live}` });
  }
  if (p.data.repo) out.push({ label: 'Code ↗', href: `${CONTACT.github}/${p.data.repo}` });
  return out;
}
