"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  getUserBands,
  createBand as createBandDoc,
  subscribeBand,
  subscribeSongs,
  subscribeMembers,
  subscribeEvents,
  subscribeAvailability,
  putBandDoc,
  deleteBandDoc,
} from "@/lib/bandService";
import type { Band, BandType } from "@/lib/bandTypes";
import type { Song, Member, ScaleEvent, Indisponibilidade } from "./agendaTypes";

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Cloud-backed replacement for the agenda's localStorage persistence. Resolves
 * (or lets the user create) the band for a given group `type`, subscribes to its
 * subcollections in real time, and exposes save helpers with the SAME shape the
 * page already used (full-array replace), so the render body is untouched.
 *
 * Persistence strategy: each save overwrites every item by its own id and
 * deletes the ones that disappeared — idempotent and duplicate-free because the
 * item id is also the Firestore doc id.
 */
export function useBandData(user: User | null, type: BandType) {
  const [bandId, setBandId] = useState<string | null>(null);
  const [band, setBand] = useState<Band | null>(null);
  const [bandName, setBandName] = useState("");
  const [bandCreated, setBandCreated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [songs, setSongs] = useState<Song[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ScaleEvent[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Indisponibilidade[]>([]);

  // Resolve the user's band for this group type (one band per type per user).
  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserBands(user.uid)
      .then((bands) => {
        if (!active) return;
        const band = bands.find((b) => b.type === type);
        if (band?.id) {
          setBandId(band.id);
          setBandName(band.name);
          setBandCreated(true);
        } else {
          setBandId(null);
          setBandCreated(false);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, type]);

  // Realtime subscriptions once a band is known.
  useEffect(() => {
    if (!bandId) {
      setBand(null);
      setSongs([]);
      setMembers([]);
      setEvents([]);
      setIndisponibilidades([]);
      return;
    }
    const unsubs = [
      subscribeBand(bandId, (b) => {
        setBand(b);
        if (b) setBandName(b.name);
      }),
      subscribeSongs(bandId, (s) => setSongs(s as unknown as Song[])),
      subscribeMembers(bandId, (m) => setMembers(m as unknown as Member[])),
      subscribeEvents(bandId, (e) => setEvents(e as unknown as ScaleEvent[])),
      subscribeAvailability(bandId, (a) =>
        setIndisponibilidades(
          a.map((x) => ({ id: x.id, date: x.date, reason: x.reason })),
        ),
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [bandId]);

  // Generic full-array sync: overwrite every next item, delete removed ones.
  const syncById = useCallback(
    async (
      coll: "songs" | "members" | "events",
      prev: { id: string }[],
      next: { id: string }[],
    ) => {
      if (!bandId) return;
      const nextIds = new Set(next.map((i) => i.id));
      await Promise.all([
        ...next.map((item) => {
          const { id, ...rest } = item as { id: string } & Record<string, unknown>;
          return putBandDoc(bandId, coll, id, rest);
        }),
        ...prev
          .filter((i) => !nextIds.has(i.id))
          .map((i) => deleteBandDoc(bandId, coll, i.id)),
      ]);
    },
    [bandId],
  );

  const saveSongs = useCallback(
    (next: Song[]) => {
      const prev = songs;
      setSongs(next); // optimistic
      void syncById("songs", prev, next);
    },
    [songs, syncById],
  );

  const saveMembers = useCallback(
    (next: Member[]) => {
      const prev = members;
      setMembers(next);
      void syncById("members", prev, next);
    },
    [members, syncById],
  );

  const saveEvents = useCallback(
    (next: ScaleEvent[]) => {
      const prev = events;
      setEvents(next);
      void syncById("events", prev, next);
    },
    [events, syncById],
  );

  const saveIndisps = useCallback(
    (next: Indisponibilidade[]) => {
      if (!bandId || !user) return;
      // Assign ids to freshly-created blocks so they can be diffed/deleted.
      const withIds = next.map((i) => (i.id ? i : { ...i, id: genId() }));
      const prev = indisponibilidades;
      setIndisponibilidades(withIds);
      const nextIds = new Set(withIds.map((i) => i.id));
      void Promise.all([
        ...withIds.map((i) =>
          putBandDoc(bandId, "availability", i.id as string, {
            uid: user.uid,
            memberId: "",
            date: i.date,
            reason: i.reason,
            createdAt: Date.now(),
          }),
        ),
        ...prev
          .filter((i) => i.id && !nextIds.has(i.id))
          .map((i) => deleteBandDoc(bandId, "availability", i.id as string)),
      ]);
    },
    [bandId, user, indisponibilidades],
  );

  const createBand = useCallback(
    async (name: string) => {
      if (!user) return;
      const id = await createBandDoc(user.uid, name, type);
      setBandId(id);
      setBandName(name);
      setBandCreated(true);
    },
    [user, type],
  );

  return {
    bandId,
    band,
    bandName,
    setBandName,
    bandCreated,
    loading,
    songs,
    members,
    events,
    indisponibilidades,
    saveSongs,
    saveMembers,
    saveEvents,
    saveIndisps,
    createBand,
  };
}
