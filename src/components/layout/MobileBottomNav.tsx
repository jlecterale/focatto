"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MagnifyingGlass,
  PlusCircle,
  Heart,
  User,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Início", icon: House },
  { href: "/?busca=1", label: "Buscar", icon: MagnifyingGlass },
  { href: "/anunciar", label: "Anunciar", icon: PlusCircle },
  { href: "/perfil?tab=favoritos", label: "Favoritos", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5 safe-area-pb">
      <div className="flex items-center justify-around py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const needsAuth = item.href === "/perfil" || item.href === "/anunciar";

          return (
            <Link
              key={item.href}
              href={needsAuth && !user ? "/?login=true" : item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                isActive
                  ? "text-accent"
                  : "text-surface-400 hover:text-surface-200"
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
