// E-mail invite & accept flow for the agenda (Fase 5). Turns an owner's private
// schedule into a collaborative band: a leader invites a musician by e-mail, the
// musician sees the invite (via the top-level `bandInvites` discovery index) and
// accepts, which self-joins them into `memberUids` and links their uid onto the
// roster entry — all client-side, gated by firestore.rules.
//
// Pure decision helpers live at the top (unit-tested); Firestore writes below.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { Band, BandInvite, BandMember } from "@/lib/bandTypes";
import { normalizeEmail } from "@/lib/bandInviteLogic";

// Re-export pure helpers so callers can import everything invite-related here.
export {
  normalizeEmail,
  pendingInvitesFor,
  isEmailInvited,
  isEmailOnRoster,
  nextMemberIdByUid,
  inviteBlockedReason,
} from "@/lib/bandInviteLogic";

// ---------------------------------------------------------------------------
// Firestore service
// ---------------------------------------------------------------------------

const bandRef = (bandId: string) => doc(db, "bands", bandId);
const memberRef = (bandId: string, memberId: string) =>
  doc(db, "bands", bandId, "members", memberId);
const invitesCol = () => collection(db, "bandInvites");

/**
 * Invite a musician by e-mail (leader action). Creates a pending roster member,
 * records the e-mail on the band (enabling the self-join rule) and writes a
 * discovery invite the invitee can read.
 */
export async function inviteMember(
  band: Band,
  invitedBy: { uid: string; name: string },
  input: { email: string; instrument: string; name?: string },
): Promise<{ memberId: string; inviteId: string }> {
  if (!band.id) throw new Error("Banda sem id.");
  const email = normalizeEmail(input.email);
  const now = Date.now();

  const member: Omit<BandMember, "id"> = {
    name: input.name?.trim() || email,
    instrument: input.instrument.trim(),
    email,
    status: "invited",
    createdAt: now,
  };
  const memberDoc = await addDoc(collection(db, "bands", band.id, "members"), member);

  const invite: Omit<BandInvite, "id"> = {
    bandId: band.id,
    bandName: band.name,
    bandType: band.type,
    memberId: memberDoc.id,
    email,
    instrument: member.instrument,
    invitedByUid: invitedBy.uid,
    invitedByName: invitedBy.name,
    status: "pending",
    createdAt: now,
  };
  const inviteDoc = await addDoc(invitesCol(), invite);

  await updateDoc(bandRef(band.id), {
    invitedEmails: arrayUnion(email),
    updatedAt: now,
  });

  return { memberId: memberDoc.id, inviteId: inviteDoc.id };
}

/**
 * Cancel a still-pending invite (leader action): frees the e-mail, deletes the
 * pending roster member and removes the matching discovery invite(s). Finds the
 * invite by `memberId` so callers only need the roster entry.
 */
export async function cancelInvite(
  bandId: string,
  member: { id: string; email: string },
): Promise<void> {
  const email = normalizeEmail(member.email);
  await updateDoc(bandRef(bandId), {
    invitedEmails: arrayRemove(email),
    updatedAt: Date.now(),
  });
  await deleteDoc(memberRef(bandId, member.id));
  const q = query(
    invitesCol(),
    where("bandId", "==", bandId),
    where("memberId", "==", member.id),
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "bandInvites", d.id))));
}

/**
 * Accept an invite (invitee action). One atomic batch: self-join the band, link
 * the uid onto the roster member and mark the invite accepted. Every write is
 * independently authorised by firestore.rules.
 */
export async function acceptInvite(
  invite: BandInvite,
  user: { uid: string; email: string },
): Promise<void> {
  if (!invite.id) throw new Error("Convite sem id.");
  const email = normalizeEmail(user.email);
  const now = Date.now();
  const batch = writeBatch(db);

  batch.update(bandRef(invite.bandId), {
    memberUids: arrayUnion(user.uid),
    invitedEmails: arrayRemove(email),
    [`memberIdByUid.${user.uid}`]: invite.memberId,
    updatedAt: now,
  });
  batch.update(memberRef(invite.bandId, invite.memberId), {
    uid: user.uid,
    status: "active",
  });
  batch.update(doc(db, "bandInvites", invite.id), { status: "accepted" });

  await batch.commit();
}

/** Decline an invite (invitee action): free the e-mail and mark it declined. */
export async function declineInvite(
  invite: BandInvite,
  user: { email: string },
): Promise<void> {
  if (!invite.id) throw new Error("Convite sem id.");
  const email = normalizeEmail(user.email);
  await updateDoc(bandRef(invite.bandId), {
    invitedEmails: arrayRemove(email),
    updatedAt: Date.now(),
  });
  await updateDoc(doc(db, "bandInvites", invite.id), { status: "declined" });
}

/** All invites addressed to a user's e-mail (any status), for discovery panels. */
export async function getInvitesByEmail(email: string): Promise<BandInvite[]> {
  const q = query(invitesCol(), where("email", "==", normalizeEmail(email)));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as BandInvite);
}

/** Promote/demote a co-leader (owner action). Persists the full leaderUids set. */
export async function setBandLeaders(bandId: string, leaderUids: string[]): Promise<void> {
  await updateDoc(bandRef(bandId), { leaderUids, updatedAt: Date.now() });
}
