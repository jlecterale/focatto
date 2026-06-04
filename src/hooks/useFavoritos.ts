"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { addFavorite, removeFavorite, getFavoriteProducts } from "@/lib/db";
import type { Product } from "@/types";

const FAVORITES_KEY = "focatto_favorites";

function getLocalFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function useFavoritos() {
  const { user, profile, refreshProfile } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      setFavorites(profile.favorites || []);
    } else if (!user) {
      setFavorites(getLocalFavorites());
    }
  }, [user, profile]);

  useEffect(() => {
    if (favorites.length > 0) {
      getFavoriteProducts(favorites).then(setFavoriteProducts);
    } else {
      setFavoriteProducts([]);
    }
    setLoading(false);
  }, [favorites]);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const isFav = favorites.includes(productId);
      const newFavs = isFav
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      if (user) {
        try {
          if (isFav) {
            await removeFavorite(user.uid, productId);
          } else {
            await addFavorite(user.uid, productId);
          }
          setFavorites(newFavs);
          refreshProfile();
        } catch {}
      } else {
        setLocalFavorites(newFavs);
        setFavorites(newFavs);
      }
    },
    [favorites, user, refreshProfile]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return { favorites, favoriteProducts, loading, toggleFavorite, isFavorite };
}
