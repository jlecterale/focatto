"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import { getInvitesByEmail, pendingInvitesFor } from "@/lib/bandInvites";
import type { BandInvite } from "@/lib/bandTypes";

/**
 * Pending band invites addressed to the logged user's e-mail, across every band
 * type. Fetched on demand (invites are low-frequency) with a `refresh` callback
 * to re-pull after accept/decline. Kept separate from useBandData because an
 * invite may target a different group type than the page currently shows.
 */
export function useUserInvites(user: User | null) {
  const [invites, setInvites] = useState<BandInvite[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.email) {
      setInvites([]);
      return;
    }
    setLoading(true);
    try {
      const all = await getInvitesByEmail(user.email);
      setInvites(pendingInvitesFor(user.email, all));
    } catch (err) {
      console.error("Erro ao carregar convites de banda:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { invites, loading, refresh };
}
