// Cloud persistence for the agenda. Replaces the per-browser localStorage in
// src/app/agenda/page.tsx with shared Firestore data so a band's repertoire,
// roster, schedule and availability are visible to every member and every
// device. Security is enforced by firestore.rules (membership-based).

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  getDoc,
  getDocs,
  query,
  where,
  arrayRemove,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase";
import type {
  Band,
  BandSong,
  BandMember,
  BandEvent,
  BandAvailability,
} from "@/lib/bandTypes";

const bandsCol = () => collection(db, "bands");
const subCol = (bandId: string, name: string) =>
  collection(db, "bands", bandId, name);

function withId<T>(snap: { id: string; data: () => unknown }): T {
  return { id: snap.id, ...(snap.data() as object) } as T;
}

/**
 * Write a subcollection document under a client-provided id (idempotent
 * overwrite), so a UI item's own id becomes its Firestore doc id. This lets the
 * useBandData hook diff a full array against the cloud without addDoc creating
 * duplicate ids. `data` should NOT include the `id` field.
 */
export async function putBandDoc(
  bandId: string,
  coll: "songs" | "members" | "events" | "availability",
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await setDoc(doc(db, "bands", bandId, coll, id), data);
}

export async function deleteBandDoc(
  bandId: string,
  coll: "songs" | "members" | "events" | "availability",
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, coll, id));
}

// ---------------------------------------------------------------------------
// Bands
// ---------------------------------------------------------------------------

/** Create a band owned by `ownerUid`, who is added as the first member. */
export async function createBand(
  ownerUid: string,
  name: string,
  type: Band["type"],
): Promise<string> {
  const now = Date.now();
  const band: Omit<Band, "id"> = {
    name,
    type,
    ownerId: ownerUid,
    memberUids: [ownerUid],
    leaderUids: [ownerUid],
    invitedEmails: [],
    memberIdByUid: {},
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(bandsCol(), band);
  return ref.id;
}

/** All bands the user can access, most recently updated first. */
export async function getUserBands(uid: string): Promise<Band[]> {
  const q = query(bandsCol(), where("memberUids", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => withId<Band>(d))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getBand(bandId: string): Promise<Band | null> {
  const snap = await getDoc(doc(db, "bands", bandId));
  return snap.exists() ? withId<Band>(snap) : null;
}

/** Live updates for a single band document. */
export function subscribeBand(
  bandId: string,
  cb: (band: Band | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "bands", bandId), (snap) =>
    cb(snap.exists() ? withId<Band>(snap) : null),
  );
}

export async function updateBand(
  bandId: string,
  patch: Partial<Pick<Band, "name" | "type" | "memberUids" | "leaderUids" | "invitedEmails">>,
): Promise<void> {
  await updateDoc(doc(db, "bands", bandId), { ...patch, updatedAt: Date.now() });
}

/**
 * Remove a member from a band (leader action). Deletes the roster doc and, when
 * the member had an account linked, revokes their access by pulling the uid from
 * `memberUids`/`leaderUids` and dropping its `memberIdByUid` entry.
 */
export async function removeMember(bandId: string, memberId: string, uid?: string): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, "members", memberId));
  if (uid) {
    await updateDoc(doc(db, "bands", bandId), {
      memberUids: arrayRemove(uid),
      leaderUids: arrayRemove(uid),
      [`memberIdByUid.${uid}`]: deleteField(),
      updatedAt: Date.now(),
    });
  }
}

export async function deleteBand(bandId: string): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId));
}

// ---------------------------------------------------------------------------
// Generic subcollection realtime subscription
// ---------------------------------------------------------------------------

function subscribeSub<T>(
  bandId: string,
  name: string,
  cb: (items: T[]) => void,
): Unsubscribe {
  return onSnapshot(subCol(bandId, name), (snap) =>
    cb(snap.docs.map((d) => withId<T>(d))),
  );
}

// ---------------------------------------------------------------------------
// Songs
// ---------------------------------------------------------------------------

export const subscribeSongs = (bandId: string, cb: (s: BandSong[]) => void) =>
  subscribeSub<BandSong>(bandId, "songs", cb);

export async function addSong(
  bandId: string,
  song: Omit<BandSong, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(subCol(bandId, "songs"), {
    ...song,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateSong(
  bandId: string,
  songId: string,
  patch: Partial<BandSong>,
): Promise<void> {
  await updateDoc(doc(db, "bands", bandId, "songs", songId), patch);
}

export async function deleteSong(bandId: string, songId: string): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, "songs", songId));
}

// ---------------------------------------------------------------------------
// Members (roster)
// ---------------------------------------------------------------------------

export const subscribeMembers = (bandId: string, cb: (m: BandMember[]) => void) =>
  subscribeSub<BandMember>(bandId, "members", cb);

export async function addMember(
  bandId: string,
  member: Omit<BandMember, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(subCol(bandId, "members"), {
    ...member,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateMember(
  bandId: string,
  memberId: string,
  patch: Partial<BandMember>,
): Promise<void> {
  await updateDoc(doc(db, "bands", bandId, "members", memberId), patch);
}

export async function deleteMember(bandId: string, memberId: string): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, "members", memberId));
}

// ---------------------------------------------------------------------------
// Events (schedule / escalas)
// ---------------------------------------------------------------------------

export const subscribeEvents = (bandId: string, cb: (e: BandEvent[]) => void) =>
  subscribeSub<BandEvent>(bandId, "events", cb);

export async function addEvent(
  bandId: string,
  event: Omit<BandEvent, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(subCol(bandId, "events"), {
    ...event,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateEvent(
  bandId: string,
  eventId: string,
  patch: Partial<BandEvent>,
): Promise<void> {
  await updateDoc(doc(db, "bands", bandId, "events", eventId), {
    ...patch,
    updatedAt: Date.now(),
  });
}

/** Confirm/decline a member's own assignment on an event. */
export async function setEventMemberStatus(
  bandId: string,
  eventId: string,
  memberKey: string,
  status: BandEvent["members"][string]["status"],
  comment?: string,
): Promise<void> {
  await updateDoc(doc(db, "bands", bandId, "events", eventId), {
    [`members.${memberKey}.status`]: status,
    ...(comment !== undefined ? { [`members.${memberKey}.comment`]: comment } : {}),
    updatedAt: Date.now(),
  });
}

export async function deleteEvent(bandId: string, eventId: string): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, "events", eventId));
}

// ---------------------------------------------------------------------------
// Availability blocks
// ---------------------------------------------------------------------------

export const subscribeAvailability = (
  bandId: string,
  cb: (a: BandAvailability[]) => void,
) => subscribeSub<BandAvailability>(bandId, "availability", cb);

export async function addAvailability(
  bandId: string,
  block: Omit<BandAvailability, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(subCol(bandId, "availability"), {
    ...block,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function deleteAvailability(
  bandId: string,
  availabilityId: string,
): Promise<void> {
  await deleteDoc(doc(db, "bands", bandId, "availability", availabilityId));
}

/**
 * One-time migration helper: pushes a browser's localStorage agenda into a new
 * cloud band, so early testers don't lose their local data when the UI moves
 * to Firestore. Call once per band type, then clear the local keys.
 */
export async function importLocalBand(
  ownerUid: string,
  name: string,
  type: Band["type"],
  data: {
    songs: Omit<BandSong, "id" | "createdAt">[];
    members: Omit<BandMember, "id" | "createdAt">[];
    events: Omit<BandEvent, "id" | "createdAt" | "updatedAt">[];
    availability: Omit<BandAvailability, "id" | "createdAt">[];
  },
): Promise<string> {
  const bandId = await createBand(ownerUid, name, type);
  await Promise.all([
    ...data.songs.map((s) => addSong(bandId, s)),
    ...data.members.map((m) => addMember(bandId, m)),
    ...data.events.map((e) => addEvent(bandId, e)),
    ...data.availability.map((a) => addAvailability(bandId, a)),
  ]);
  return bandId;
}
