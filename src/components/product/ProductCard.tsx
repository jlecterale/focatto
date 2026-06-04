"use client";

import Link from "next/link";
import { Heart, MapPin, ArrowRight } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { ConditionBadge } from "@/components/ui/Badge";
import { useFavoritos } from "@/hooks/useFavoritos";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritos();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const fav = isFavorite(product.id);
  const image = product.images?.[0]?.thumb || product.images?.[0]?.url;

  return (
    <Link href={`/produtos/${product.id}`}>
      <Card className="group overflow-hidden h-full flex flex-col" padding="none">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-800">
          {imgLoading && !imgError && (
            <div className="absolute inset-0 shimmer" />
          )}
          {image && !imgError ? (
            <img
              src={image}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onLoad={() => setImgLoading(false)}
              onError={() => { setImgError(true); setImgLoading(false); }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-surface-500">
              <span className="font-heading text-4xl opacity-30">F</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={product.condition} />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart
              size={16}
              weight={fav ? "fill" : "regular"}
              className={fav ? "text-red-400" : "text-white/70"}
            />
          </button>
          {product.acceptsTrade && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
              Aceita Troca
            </span>
          )}
        </div>
        <div className="p-3.5 flex-1 flex flex-col gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">
            {product.brand} {product.model}
          </p>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {product.title}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-bold gradient-text">
                {formatCurrency(product.price)}
              </p>
              {product.shipping !== undefined && product.shipping > 0 && (
                <p className="text-[10px] text-surface-400">
                  Frete: {formatCurrency(product.shipping)}
                </p>
              )}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-surface-400">
              <MapPin size={10} />
              {product.city}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
