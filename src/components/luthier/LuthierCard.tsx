"use client";

import Link from "next/link";
import { Star, MapPin, Wrench } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Luthier } from "@/types";

interface LuthierCardProps {
  luthier: Luthier;
}

export function LuthierCard({ luthier }: LuthierCardProps) {
  return (
    <Link href={`/luthier/${luthier.id}`}>
      <Card className="flex gap-4 items-start group" hover>
        <Avatar src={luthier.photo} name={luthier.name} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base group-hover:text-accent transition-colors truncate">
              {luthier.name}
            </h3>
            <Badge variant="gold">
              <Star size={10} weight="fill" />
              {luthier.averageRating.toFixed(1)}
            </Badge>
          </div>
          <p className="text-sm text-surface-300 line-clamp-2 mt-1">
            {luthier.bio}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {luthier.city}, {luthier.state}
            </span>
            <span className="flex items-center gap-1">
              <Wrench size={12} />
              {luthier.specialties.slice(0, 2).join(", ")}
            </span>
            <span>{luthier.totalReviews} avaliações</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
