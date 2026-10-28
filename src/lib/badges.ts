// This file contains the logic for calculating the "New" and "Updated" badges for lab entries.
// The "New" badge is determined by the release date of the entry, while the "Updated" badge is determined by the last updated date of the entry.
// The "Example" badge is given to entries that are marked as examples.
// The functions in this file are used to determine which badge, if any, should be displayed for each lab entry.
import type { LabEntry } from './projects';
export type Badge = 'Example' | 'New' | 'Updated';

// Variables for badge calculations
// The default values are used in the tests, but the actual values are set in refresh-stars.yml
const DAY = 24 * 60 * 60 * 1000;
const NEW_DAYS = 60;
const UPDATED_COUNT = 3;

// Returns whether an entry is considered "New" based on its release date (last 60 days)
export function isNew(released: string, now = Date.now()) {
  const [y, m] = released.split('-').map(Number);
  return (now - new Date(y, m - 1, 15).getTime()) / DAY <= NEW_DAYS;
}

// Returns a set of the three most recently updated real entries that aren't already "New"
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

// Returns the badge for an entry based on its properties (Example beats New beats Updated)
export function badgeFor(entry: LabEntry, updated: Set<string>, now = Date.now()): Badge | null {
  if (entry.data.example) return 'Example';
  if (isNew(entry.data.released, now)) return 'New';
  return updated.has(entry.id) ? 'Updated' : null;
}
