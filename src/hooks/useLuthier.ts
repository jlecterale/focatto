"use client";

import { useState, useEffect, useCallback } from "react";
import { getLuthiers, getLuthierById, listenLuthier } from "@/lib/db";
import type { Luthier } from "@/types";

export function useLuthiers(city?: string, state?: string) {
  const [luthiers, setLuthiers] = useState<Luthier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLuthiers(city, state)
      .then(setLuthiers)
      .finally(() => setLoading(false));
  }, [city, state]);

  return { luthiers, loading };
}

export function useLuthier(id: string | undefined) {
  const [luthier, setLuthier] = useState<Luthier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    const unsub = listenLuthier(id, (data) => {
      setLuthier(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { luthier, loading };
}
