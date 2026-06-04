"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Guitar,
  Headphones,
  Wrench,
} from "@phosphor-icons/react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { useProducts } from "@/hooks/useProdutos";
import { cn } from "@/lib/utils";
import type { ProductFilters as Filters } from "@/types";

const categories = [
  { key: "instrumentos", label: "Instrumentos", icon: Guitar, color: "from-accent to-amber-600" },
  { key: "acessorios", label: "Acessórios", icon: Headphones, color: "from-blue-500 to-cyan-500" },
  { key: "luthier", label: "Luthiers", icon: Wrench, color: "from-emerald-500 to-teal-500" },
];

function AnunciosContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const queryCategory = searchParams.get("categoria");
  const querySearch = searchParams.get("search");

  useEffect(() => {
    let newFilters: Filters = {};
    if (queryCategory) {
      setActiveCategory(queryCategory);
      newFilters.category = queryCategory as any;
    } else {
      setActiveCategory(null);
    }
    if (querySearch) {
      newFilters.search = querySearch;
    }
    setFilters(newFilters);
  }, [queryCategory, querySearch]);

  const { products, loading } = useProducts(filters);

  const handleCategoryClick = (key: string) => {
    if (activeCategory === key) {
      setActiveCategory(null);
      setFilters({});
      // Update URL clean
      window.history.pushState({}, "", "/anuncios");
    } else {
      setActiveCategory(key);
      setFilters({ category: key as any });
      // Update URL
      window.history.pushState({}, "", `/anuncios?categoria=${key}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <section className="mb-8 md:mb-12">
        <div className="mb-6">
          <h1 className="font-heading text-balance">
            Navegar por <span className="gradient-text">Categorias</span>
          </h1>
          <p className="text-surface-400 mt-2 text-sm md:text-base max-w-xl">
            Explore todos os anúncios ativos no marketplace divididos por categorias e com filtros avançados.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all flex-shrink-0",
                  isActive
                    ? "border-accent/30 bg-accent/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center", cat.color)}>
                  <Icon size={18} weight="fill" className="text-white" />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {activeCategory
              ? categories.find((c) => c.key === activeCategory)?.label
              : "Todos os Anúncios"}
          </h2>
          <p className="text-xs text-surface-400">{products.length} anúncios encontrados</p>
        </div>

        <ProductFilters filters={filters} onChange={setFilters} />

        <ProductGrid products={products} loading={loading} />
      </section>
    </div>
  );
}

export default function AnunciosPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="shimmer h-48 rounded-2xl mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    }>
      <AnunciosContent />
    </Suspense>
  );
}
