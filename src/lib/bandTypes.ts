// Cloud data model for the agenda (band/worship-team scheduling).
// Mirrors the current localStorage shapes in src/app/agenda/page.tsx so the UI
// can move to Firestore with minimal changes, adding ownership/membership so a
// band's schedule is shared across its members (the core "Louve"-style gap).

/** Membership status of an escalado (scheduled) member for a given event. */
export type EventMemberStatus = "confirmado" | "pendente" | "recusado";

/** Group flavour shown in the agenda (ministério, gig, baile, coral, …). */
export type BandType = "ministerio" | "gig" | "baile" | "agencia" | "coral" | "outros";

/**
 * Top-level band document: `bands/{bandId}`.
 * `ownerId` is the leader; `memberUids` holds every auth uid allowed to read the
 * band and its subcollections. Security rules key access off these two fields.
 */
export interface Band {
  id?: string;
  name: string;
  type: BandType;
  ownerId: string;
  /** Auth uids with access (owner included). Owner maintains this list. */
  memberUids: string[];
  createdAt: number;
  updatedAt: number;
}

/** `bands/{bandId}/songs/{songId}` — repertoire item. */
export interface BandSong {
  id?: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  youtube?: string;
  spotify?: string;
  deezer?: string;
  cifra: string; // chords in brackets, e.g. [C]
  createdAt: number;
}

/**
 * `bands/{bandId}/members/{memberId}` — roster entry. `uid` links the roster
 * member to an auth account once they accept an invite, enabling the
 * confirm/decline flow and per-user availability.
 */
export interface BandMember {
  id?: string;
  name: string;
  instrument: string;
  email: string;
  /** Linked auth uid once the invite is accepted; absent while pending. */
  uid?: string;
  role?: string;
  createdAt: number;
}

/** Per-member scheduling entry inside an event. */
export interface EventMemberAssignment {
  memberId: string;
  role: string;
  status: EventMemberStatus;
  comment?: string;
}

/** `bands/{bandId}/events/{eventId}` — a schedule (escala) / rehearsal. */
export interface BandEvent {
  id?: string;
  title: string;
  type: string; // Ensaio, Apresentação, Culto, …
  date: string; // ISO date/time string
  location: string;
  songs: string[]; // BandSong ids, ordered (setlist)
  members: Record<string, EventMemberAssignment>;
  createdAt: number;
  updatedAt: number;
}

/** `bands/{bandId}/availability/{availabilityId}` — a member's date block. */
export interface BandAvailability {
  id?: string;
  /** Roster member id the block belongs to. */
  memberId: string;
  /** Auth uid that created the block (for own-block rules). */
  uid: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: number;
}
