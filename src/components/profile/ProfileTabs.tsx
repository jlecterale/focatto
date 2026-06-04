"use client";

import { useState } from "react";
import { List, Heart, ChatCircleDots, User, CurrencyDollar, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Product, Chat, Luthier, Appointment, Proposal } from "@/types";

type Tab = "anuncios" | "favoritos" | "propostas" | "agendamentos" | "chats" | "dados";

interface ProfileTabsProps {
  activeTab?: string;
  onTabChange: (tab: Tab) => void;
  products: Product[];
  favorites: Product[];
  chats: Chat[];
  appointments: Appointment[];
  proposals: Proposal[];
  luthierProfile?: Luthier | null;
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "anuncios", label: "Meus Anúncios", icon: List },
  { key: "favoritos", label: "Favoritos", icon: Heart },
  { key: "propostas", label: "Propostas", icon: CurrencyDollar },
  { key: "agendamentos", label: "Agendamentos", icon: Clock },
  { key: "chats", label: "Mensagens", icon: ChatCircleDots },
  { key: "dados", label: "Dados Pessoais", icon: User },
];

export function ProfileTabs({
  activeTab = "anuncios",
  onTabChange,
  products,
  favorites,
  chats,
  appointments,
  proposals,
}: ProfileTabsProps) {
  return (
    <div>
      <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-6 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          let count: number | null = null;
          if (tab.key === "anuncios") count = products.length;
          if (tab.key === "favoritos") count = favorites?.length || 0;
          if (tab.key === "chats") count = chats.length;
          if (tab.key === "propostas") count = proposals?.length || 0;
          if (tab.key === "agendamentos") count = appointments?.length || 0;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-surface-400 hover:text-surface-200"
              )}
            >
              <Icon size={16} />
              {tab.label}
              {count !== null && (
                <span className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-accent/20 text-accent" : "bg-white/5 text-surface-400"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
