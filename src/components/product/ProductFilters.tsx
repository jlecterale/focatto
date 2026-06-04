"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FunnelSimple, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { ProductFilters as Filters, Condition } from "@/types";

const conditions: { value: Condition; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "como_novo", label: "Como Novo" },
  { value: "excelente", label: "Excelente" },
  { value: "bom", label: "Bom" },
  { value: "desgastado", label: "Desgastado" },
  { value: "restauro", label: "Para Restauro" },
];

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const update = (key: keyof Filters, value: any) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== "" && !(Array.isArray(v) && !v.length));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          <FunnelSimple size={16} />
          Filtros
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-accent" />
          )}
        </Button>
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          <FilterSelect
            label="Condição"
            value={filters.condition?.[0] || ""}
            onChange={(v) => update("condition", v ? [v as Condition] : undefined)}
            options={conditions}
            placeholder="Todas condições"
          />
          <Select
            value={filters.sort || "recentes"}
            onChange={(e) => update("sort", e.target.value)}
            options={[
              { value: "recentes", label: "Mais Recentes" },
              { value: "preco_asc", label: "Menor Preço" },
              { value: "preco_desc", label: "Maior Preço" },
              { value: "populares", label: "Mais Populares" },
            ]}
            className="w-36"
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 transition-all",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] glass-strong p-5 transition-transform",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Filtros</h3>
            <button onClick={() => setOpen(false)} className="btn-ghost p-1.5 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <Select
              label="Ordenar por"
              value={filters.sort || "recentes"}
              onChange={(e) => update("sort", e.target.value)}
              options={[
                { value: "recentes", label: "Mais Recentes" },
                { value: "preco_asc", label: "Menor Preço" },
                { value: "preco_desc", label: "Maior Preço" },
                { value: "populares", label: "Mais Populares" },
              ]}
            />
            <Select
              label="Condição"
              value={filters.condition?.[0] || ""}
              onChange={(e) => update("condition", e.target.value ? [e.target.value as Condition] : undefined)}
              options={conditions}
              placeholder="Todas condições"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Preço min."
                value={filters.minPrice || ""}
                onChange={(e) => update("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Preço máx."
                value={filters.maxPrice || ""}
                onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Aplicar Filtros
            </Button>
            {hasFilters && (
              <Button variant="ghost" className="w-full" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 mb-4 flex-wrap">
        <Select
          value={filters.sort || "recentes"}
          onChange={(e) => update("sort", e.target.value)}
          options={[
            { value: "recentes", label: "Mais Recentes" },
            { value: "preco_asc", label: "Menor Preço" },
            { value: "preco_desc", label: "Maior Preço" },
            { value: "populares", label: "Mais Populares" },
          ]}
          className="w-36"
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field text-sm py-1.5 px-3 w-auto min-w-[130px]"
    >
      <option value="">{placeholder || label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
