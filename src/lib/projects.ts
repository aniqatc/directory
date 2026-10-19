import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
/** A lab entry with its archive number (No. 01 is the oldest). */
export type LabEntry = Project & { n: number };

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
