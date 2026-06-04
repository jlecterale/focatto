"use client";

import { useState, useRef, useCallback } from "react";
import { CaretLeft, CaretRight, MagnifyingGlassPlus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const touchRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      goTo(activeIndex + (diff < 0 ? 1 : -1));
    }
    setTouchStart(null);
  };

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-surface-800 flex items-center justify-center">
        <span className="font-heading text-6xl text-surface-600">F</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={touchRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-surface-800 cursor-zoom-in group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={images[activeIndex]?.url}
          alt={images[activeIndex]?.alt || "Produto"}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            zoomed && "scale-150 cursor-zoom-out"
          )}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Próximo"
            >
              <CaretRight size={18} weight="bold" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === activeIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Imagem ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <MagnifyingGlassPlus size={14} />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all",
                i === activeIndex
                  ? "border-accent opacity-100"
                  : "border-transparent opacity-60 hover:opacity-80"
              )}
            >
              <img src={img.thumb || img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
