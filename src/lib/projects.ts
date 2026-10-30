import { getCollection, type CollectionEntry } from 'astro:content';
import { CONTACT } from './contact';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 3 → "03" */
export const pad = (n: number) => String(n).padStart(2, '0');
/** "2023-10" → "Oct 2023" */
export const fmtMonth = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const year = (p: Entry) => p.data.released.slice(0, 4);

/** A portfolio project: src/content/projects. */
export type Project = CollectionEntry<'projects'>;
/** A lab entry (src/content/experiments) with its archive number (No. 01 is the oldest). */
export type LabEntry = CollectionEntry<'experiments'> & { n: number };
/** Either kind; for helpers that work on both. */
export type Entry = Project | CollectionEntry<'experiments'>;

// Comparison function for sorting entries by release date, oldest first.
// If the release dates are the same, fall back to title comparison.
const byRelease = (a: Entry, b: Entry) =>
  a.data.released.localeCompare(b.data.released) || a.data.title.localeCompare(b.data.title);

// Determines if an entry is visible (anything that is not a draft).
const visible = (e: Entry) => !e.data.draft;

// Fetches the selected portfolio projects (src/content/projects), sorted by their `order` field.
export async function getSelected(): Promise<Project[]> {
  return (await getCollection('projects', visible)).sort((a, b) => a.data.order - b.data.order);
}

// Fetches the lab entries (src/content/experiments), sorted by release date (oldest first) and numbered.
export async function getLab(): Promise<LabEntry[]> {
  const lab = await getCollection('experiments', visible);
  return lab.sort(byRelease).map((p, i) => ({ ...p, n: i + 1 }));
}

// Groups lab entries by year, with the newest year first and the newest entry first within each year.
export function byYear<T extends Entry>(entries: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const p of [...entries].sort(byRelease).reverse()) {
    const y = year(p);
    groups.set(y, [...(groups.get(y) ?? []), p]);
  }
  return [...groups];
}

// Filters out placeholder examples, leaving only real lab entries.
export const real = <T extends LabEntry>(entries: T[]) => entries.filter((p) => !p.data.example);

// Computes statistics for the lab's entries, including the number of entries, the start date, and the last date.
export function stats(lab: LabEntry[]) {
  const dates = real(lab)
    .map((p) => p.data.released)
    .sort();
  return { entries: dates.length, started: dates[0], last: dates[dates.length - 1] };
}

// An entry's own folder in this site's repo, where the code for a sketch or study that runs on the page lives.
export const folderLink = (p: Entry) => ({
  label: 'Code ↗',
  href: `${CONTACT.github}/directory/tree/main/src/content/${p.collection}/${p.id}`,
});

// Generates the list of links for a project, including live/demo links and code repository links.
export function links(p: Entry) {
  // Initialize the output array for the project's links.
  const out: { label: string; href: string }[] = [];
  if (p.data.live) {
    // Add the live/demo link to the output array.
    out.push({ label: p.data.live.includes('npmjs') ? 'npm ↗' : 'Live ↗', href: `https://${p.data.live}` });
  }
  if (p.data.repo)
    // Add the code repository link to the output array.
    out.push({ label: 'Code ↗', href: `${CONTACT.github}/${p.data.repo}` });
  return out;
}
