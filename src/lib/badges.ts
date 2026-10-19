// "New" and "Updated" tags on lab entries, used sparingly. Worked out when the site builds; the daily rebuild
// (refresh-stars.yml) keeps "New" current.
import type { LabEntry } from './projects';

export type Badge = 'Example' | 'New' | 'Updated';

const DAY = 864e5;
const NEW_DAYS = 60;
const UPDATED_COUNT = 3;

/** Released in the last 60 days (a YYYY-MM month counts from its 15th). */
export function isNew(released: string, now = Date.now()) {
  const [y, m] = released.split('-').map(Number);
  return (now - new Date(y, m - 1, 15).getTime()) / DAY <= NEW_DAYS;
}

/** The three most recently updated real entries that aren't already "New". */
export function updatedSet(lab: LabEntry[], now = Date.now()) {
  return new Set(
    lab
      .filter((e) => !e.data.example && e.data.updated && !isNew(e.data.released, now))
      .sort(
        (a, b) =>
          b.data.updated!.localeCompare(a.data.updated!) || b.data.released.localeCompare(a.data.released),
      )
      .slice(0, UPDATED_COUNT)
      .map((e) => e.id),
  );
}

/** The one tag an entry gets, if any: Example beats New beats Updated. */
export function badgeFor(entry: LabEntry, updated: Set<string>, now = Date.now()): Badge | null {
  if (entry.data.example) return 'Example';
  if (isNew(entry.data.released, now)) return 'New';
  return updated.has(entry.id) ? 'Updated' : null;
}
