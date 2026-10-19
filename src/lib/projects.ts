import { getCollection, type CollectionEntry } from 'astro:content';
import { CONTACT } from './contact';

export type Project = CollectionEntry<'projects'>;
/** A lab entry with its archive number (No. 01 is the oldest). */
export type LabEntry = Project & { n: number };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 3 → "03" */
export const pad = (n: number) => String(n).padStart(2, '0');
/** "2023-10" → "Oct 2023" */
export const fmtMonth = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const year = (p: Project) => p.data.released.slice(0, 4);

// oldest first; same-month entries fall back to title so numbers stay stable
const byRelease = (a: Project, b: Project) =>
  a.data.released.localeCompare(b.data.released) || a.data.title.localeCompare(b.data.title);

/** Selected work, in the order of each file's `selected` number. */
export async function getSelected(): Promise<Project[]> {
  const selected = await getCollection('projects', (p) => p.data.selected != null);
  return selected.sort((a, b) => a.data.selected! - b.data.selected!);
}

/** Everything that isn't selected work, oldest first and numbered. Selected work never appears here. */
export async function getLab(): Promise<LabEntry[]> {
  const lab = await getCollection('projects', (p) => p.data.selected == null);
  return lab.sort(byRelease).map((p, i) => ({ ...p, n: i + 1 }));
}

/** Lab entries grouped by year, newest year first and newest entry first within each year. */
export function byYear<T extends Project>(entries: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const p of [...entries].sort(byRelease).reverse()) {
    const y = year(p);
    groups.set(y, [...(groups.get(y) ?? []), p]);
  }
  return [...groups];
}

/** Real entries only: placeholder examples don't count. */
export const real = <T extends Project>(entries: T[]) => entries.filter((p) => !p.data.example);

/** The numbers in the lab's stats row. */
export function stats(lab: LabEntry[]) {
  const dates = real(lab)
    .map((p) => p.data.released)
    .sort();
  return { entries: dates.length, started: dates[0], last: dates[dates.length - 1] };
}

/** The newest real lab entries, for "Latest in the lab". */
export const latest = (lab: LabEntry[], count = 3) => real(lab).sort(byRelease).reverse().slice(0, count);

/** Live / npm and Code links for a project, in that order. */
export function links(p: Project) {
  const out: { label: string; href: string }[] = [];
  if (p.data.live) {
    out.push({ label: p.data.live.includes('npmjs') ? 'npm ↗' : 'Live ↗', href: `https://${p.data.live}` });
  }
  if (p.data.repo) out.push({ label: 'Code ↗', href: `${CONTACT.github}/${p.data.repo}` });
  return out;
}
