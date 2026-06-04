"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  getProductById,
  listenProduct,
  listenProducts,
  searchProducts,
  getProductsBySeller as fetchSellerProducts,
} from "@/lib/db";
import type { Product, ProductFilters } from "@/types";

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = listenProducts(filters, (data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, [filters?.category, filters?.subcategory]);

  return { products, loading };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    const unsub = listenProduct(id, (data) => {
      setProduct(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { product, loading };
}

export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); return; }
    setLoading(true);
    const data = await searchProducts(term);
    setResults(data);
    setLoading(false);
  }, []);

  return { results, loading, search };
}

export function useProductsBySeller(sellerId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) { setLoading(false); return; }
    fetchSellerProducts(sellerId)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [sellerId]);

  return { products, loading };
}
