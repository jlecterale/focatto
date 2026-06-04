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
import { AuthModal } from "@/components/layout/AuthModal";
import { useProducts } from "@/hooks/useProdutos";
import { cn } from "@/lib/utils";
import type { ProductFilters as Filters } from "@/types";

const categories = [
  { key: "instrumentos", label: "Instrumentos", icon: Guitar, color: "from-accent to-amber-600" },
  { key: "acessorios", label: "Acessórios", icon: Headphones, color: "from-blue-500 to-cyan-500" },
  { key: "luthier", label: "Luthiers", icon: Wrench, color: "from-emerald-500 to-teal-500" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const queryCategory = searchParams.get("categoria");
  const querySearch = searchParams.get("search");
  const loginParam = searchParams.get("login");
  const registerParam = searchParams.get("register");

  useEffect(() => {
    if (queryCategory) {
      setActiveCategory(queryCategory);
      setFilters((f) => ({ ...f, category: queryCategory as any }));
    }
    if (querySearch) {
      setFilters((f) => ({ ...f, search: querySearch }));
    }
    if (loginParam) { setAuthMode("login"); setShowAuth(true); }
    if (registerParam) { setAuthMode("register"); setShowAuth(true); }
  }, [queryCategory, querySearch, loginParam, registerParam]);

  const { products, loading } = useProducts(filters);

  const handleCategoryClick = (key: string) => {
    if (activeCategory === key) {
      setActiveCategory(null);
      setFilters({});
    } else {
      setActiveCategory(key);
      setFilters({ category: key as any });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <section className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-balance">
              Encontre o <span className="gradient-text">instrumento</span> dos seus sonhos
            </h1>
            <p className="text-surface-400 mt-2 text-sm md:text-base max-w-xl">
              Marketplace completo para comprar, vender e trocar instrumentos, acessórios e serviços de luthieria.
            </p>
          </div>
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
              : "Destaques"}
          </h2>
          {!activeCategory && (
            <p className="text-xs text-surface-400">{products.length} anúncios</p>
          )}
        </div>

        <ProductFilters filters={filters} onChange={setFilters} />

        <ProductGrid products={products} loading={loading} />
      </section>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onToggle={() => setAuthMode(authMode === "login" ? "register" : "login")}
        />
      )}
    </div>
  );
}

export default function HomePage() {
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
      <HomeContent />
    </Suspense>
  );
}
