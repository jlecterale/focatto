"use client";

import { useState } from "react";
import { MagnifyingGlass, MapPin, Wrench } from "@phosphor-icons/react";
import { LuthierCard } from "@/components/luthier/LuthierCard";
import { Input } from "@/components/ui/Input";
import { useLuthiers } from "@/hooks/useLuthier";

export default function LuthierDirectoryPage() {
  const [searchCity, setSearchCity] = useState("");
  const { luthiers, loading } = useLuthiers(searchCity);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          Encontre um <span className="gradient-text">Luthier</span>
        </h1>
        <p className="text-surface-400 mt-2">
          Profissionais especializados em reparo, manutenção e customização de instrumentos musicais.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por cidade..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-2xl" />
          ))}
        </div>
      ) : luthiers.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <Wrench size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Nenhum luthier encontrado</p>
          <p className="text-sm mt-1">
            {searchCity
              ? `Nenhum luthier em "${searchCity}"`
              : "Nenhum luthier cadastrado ainda"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-surface-400 mb-4">
            {luthiers.length} luthier{luthiers.length !== 1 ? "es" : ""} encontrado{luthiers.length !== 1 ? "s" : ""}
            {searchCity && ` em ${searchCity}`}
          </p>
          {luthiers.map((luthier) => (
            <LuthierCard key={luthier.id} luthier={luthier} />
          ))}
        </div>
      )}
    </div>
  );
}
