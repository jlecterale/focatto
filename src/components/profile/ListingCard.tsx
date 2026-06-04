"use client";

import Link from "next/link";
import { PencilSimple, Eye, Trash } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

interface ListingCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ListingCard({ product, onEdit, onDelete }: ListingCardProps) {
  const image = product.images?.[0]?.thumb || product.images?.[0]?.url;

  const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
    active: { label: "Ativo", variant: "success" },
    pending: { label: "Pendente", variant: "warning" },
    sold: { label: "Vendido", variant: "default" },
    inactive: { label: "Inativo", variant: "danger" },
  };

  const status = statusLabels[product.status] || { label: product.status, variant: "default" as const };

  return (
    <Card padding="sm" className="flex gap-3 items-center">
      <Link href={`/produtos/${product.id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-surface-800 flex-shrink-0">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-surface-600 text-lg font-heading">F</div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant={status.variant}>{status.label}</Badge>
          <ConditionBadge condition={product.condition} />
        </div>
        <Link href={`/produtos/${product.id}`} className="text-sm font-medium hover:text-accent transition-colors line-clamp-1">
          {product.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold gradient-text">{formatCurrency(product.price)}</span>
          <span className="text-[11px] text-surface-400">{product.views} visualizações</span>
          <span className="text-[11px] text-surface-400">{formatDate(product.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link href={`/produtos/${product.id}`} className="btn-ghost p-1.5 rounded-lg" aria-label="Visualizar">
          <Eye size={16} />
        </Link>
        {onEdit && (
          <button onClick={() => onEdit(product.id)} className="btn-ghost p-1.5 rounded-lg" aria-label="Editar">
            <PencilSimple size={16} />
          </button>
        )}
        {onDelete && product.status !== "sold" && (
          <button onClick={() => onDelete(product.id)} className="btn-ghost p-1.5 rounded-lg text-red-400" aria-label="Remover">
            <Trash size={16} />
          </button>
        )}
      </div>
    </Card>
  );
}
