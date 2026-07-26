// Cloud data model for the agenda (band/worship-team scheduling).
// Mirrors the current localStorage shapes in src/app/agenda/page.tsx so the UI
// can move to Firestore with minimal changes, adding ownership/membership so a
// band's schedule is shared across its members (the core "Louve"-style gap).

/** Membership status of an escalado (scheduled) member for a given event. */
export type EventMemberStatus = "confirmado" | "pendente" | "recusado";

/** Group flavour shown in the agenda (ministério, gig, baile, coral, …). */
export type BandType = "ministerio" | "gig" | "baile" | "agencia" | "coral" | "outros";

/** Lifecycle of an e-mail invite while it waits to be accepted. */
export type InviteStatus = "pending" | "accepted" | "declined";

/** Roster membership state: still invited (no account linked) vs active. */
export type MemberStatus = "invited" | "active";

/**
 * Top-level band document: `bands/{bandId}`.
 * `ownerId` is the founding leader; `leaderUids` lists every leader (owner +
 * co-leaders) allowed to manage the band; `memberUids` holds every auth uid
 * allowed to read the band and its subcollections. Security rules key access
 * off these fields.
 */
export interface Band {
  id?: string;
  name: string;
  type: BandType;
  ownerId: string;
  /** Auth uids with access (owner included). Leaders maintain this list. */
  memberUids: string[];
  /**
   * Auth uids with leader privileges (invite, manage roster, build escalas).
   * Always contains `ownerId`; the owner promotes/demotes co-leaders. Optional
   * for bands created before Fase 5 — treat a missing value as `[ownerId]`.
   */
  leaderUids?: string[];
  /**
   * Lowercased e-mails invited but not yet accepted. A user whose token e-mail
   * is listed here may add their own uid to `memberUids` (self-join rule).
   */
  invitedEmails?: string[];
  /**
   * Reverse index `uid -> memberId` for linked members, so security rules can
   * confirm a member only edits their OWN assignment status on an event.
   */
  memberIdByUid?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Top-level discovery index for pending invites: `bandInvites/{inviteId}`.
 * Lives outside the band so an invitee (not yet a member, so unable to read the
 * band) can query their own invites by e-mail.
 */
export interface BandInvite {
  id?: string;
  bandId: string;
  bandName: string;
  bandType: BandType;
  /** Roster member id created for this invite; linked to the uid on accept. */
  memberId: string;
  /** Lowercased invitee e-mail. */
  email: string;
  /** Instrument/role the invitee is being asked to cover. */
  instrument: string;
  invitedByUid: string;
  invitedByName: string;
  status: InviteStatus;
  createdAt: number;
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
  /**
   * `invited` while waiting for the e-mail invite to be accepted, `active` once
   * linked to an account. Missing on pre-Fase 5 rosters — treat as `active`.
   */
  status?: MemberStatus;
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
