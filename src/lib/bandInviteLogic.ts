// Pure invite decision helpers — no Firestore imports, so they can be unit
// tested and imported without booting Firebase. The Firestore service in
// bandInvites.ts re-exports these alongside its writes.

import type { Band, BandInvite, BandMember } from "@/lib/bandTypes";

/** Canonical e-mail form used for matching invites (trimmed, lowercased). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Invites addressed to `email` that are still awaiting a response. */
export function pendingInvitesFor(email: string, invites: BandInvite[]): BandInvite[] {
  const target = normalizeEmail(email);
  return invites.filter((i) => i.status === "pending" && normalizeEmail(i.email) === target);
}

/** True when the e-mail is already invited (case-insensitive). */
export function isEmailInvited(band: Pick<Band, "invitedEmails">, email: string): boolean {
  const target = normalizeEmail(email);
  return (band.invitedEmails ?? []).some((e) => normalizeEmail(e) === target);
}

/** True when the e-mail already belongs to a roster member. */
export function isEmailOnRoster(members: Pick<BandMember, "email">[], email: string): boolean {
  const target = normalizeEmail(email);
  return members.some((m) => normalizeEmail(m.email) === target);
}

/** Merge a single `uid -> memberId` link into the reverse index (pure). */
export function nextMemberIdByUid(
  current: Record<string, string> | undefined,
  uid: string,
  memberId: string,
): Record<string, string> {
  return { ...(current ?? {}), [uid]: memberId };
}

/** Why an invite cannot be created; `null` means it is allowed. */
export function inviteBlockedReason(
  band: Pick<Band, "invitedEmails">,
  members: Pick<BandMember, "email">[],
  email: string,
): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) return "E-mail inválido.";
  if (isEmailInvited(band, normalized)) return "Este e-mail já foi convidado.";
  if (isEmailOnRoster(members, normalized)) return "Este e-mail já está na equipe.";
  return null;
}
