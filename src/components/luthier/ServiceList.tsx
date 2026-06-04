"use client";

import { useState } from "react";
import { Clock, CurrencyCircleDollar } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { LuthierService } from "@/types";

interface ServiceListProps {
  services: LuthierService[];
  onSchedule: (service: LuthierService) => void;
}

export function ServiceList({ services, onSchedule }: ServiceListProps) {
  if (!services.length) {
    return (
      <p className="text-sm text-surface-400 py-4">
        Nenhum serviço cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div key={service.id}>
          <Card padding="md" hover={false} className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{service.name}</h4>
              <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">
                {service.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {service.duration} min
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-300">
                  <CurrencyCircleDollar size={12} />
                  {formatCurrency(service.price)}
                </span>
              </div>
            </div>
            <Button size="sm" variant="gold" onClick={() => onSchedule(service)}>
              Agendar
            </Button>
          </Card>
        </div>
      ))}
    </div>
  );
}
