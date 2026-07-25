// Pure role helpers for the agenda. A band has a single owner (founding leader)
// plus optional co-leaders in `leaderUids`; everyone else in `memberUids` is a
// músico. Kept free of Firestore so it can be unit-tested and reused by the UI.

import type { Band } from "@/lib/bandTypes";

export type BandRole = "leader" | "member";

/** Leaders are the owner and anyone promoted into `leaderUids`. */
export function isBandLeader(band: Pick<Band, "ownerId" | "leaderUids">, uid: string | null | undefined): boolean {
  if (!uid) return false;
  return band.ownerId === uid || (band.leaderUids ?? []).includes(uid);
}

/** The owner is the only leader who can promote/demote others and delete the band. */
export function isBandOwner(band: Pick<Band, "ownerId">, uid: string | null | undefined): boolean {
  return !!uid && band.ownerId === uid;
}

export function roleOf(band: Pick<Band, "ownerId" | "leaderUids">, uid: string | null | undefined): BandRole {
  return isBandLeader(band, uid) ? "leader" : "member";
}

/** pt-BR label shown as a badge next to a member. */
export function roleLabel(band: Pick<Band, "ownerId" | "leaderUids">, uid: string | null | undefined): string {
  if (isBandOwner(band, uid)) return "Líder";
  if (isBandLeader(band, uid)) return "Co-líder";
  return "Músico";
}

/**
 * Add or remove a uid from a leaderUids list without ever dropping the owner.
 * Returns a new array (pure) so callers can diff/persist it.
 */
export function toggleLeader(
  band: Pick<Band, "ownerId" | "leaderUids">,
  uid: string,
  makeLeader: boolean,
): string[] {
  const current = new Set(band.leaderUids ?? []);
  current.add(band.ownerId); // owner is always a leader
  if (makeLeader) current.add(uid);
  else if (uid !== band.ownerId) current.delete(uid);
  return Array.from(current);
}
