"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Heart,
  User,
  SignOut,
  PlusCircle,
  List,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/anuncios?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-gold-500 flex items-center justify-center text-white font-bold text-sm">
              F
            </span>
            <span className="font-heading text-xl font-bold tracking-tight hidden sm:block">
              Focatto
            </span>
          </Link>

          {/* Desktop Sticky Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-sm lg:max-w-md w-full mx-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar instrumentos, marcas..."
              className="input-field py-1.5 pl-3 pr-10 text-sm w-full bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-accent/40 rounded-xl"
            />
            <button type="submit" className="absolute right-3 text-surface-400 hover:text-white transition-colors" aria-label="Pesquisar">
              <MagnifyingGlass size={16} />
            </button>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/anuncios"
              className="btn-ghost text-sm px-3 py-2 rounded-lg font-medium"
            >
              Anúncios
            </Link>
            <Link
              href="/luthier"
              className="btn-ghost text-sm px-3 py-2 rounded-lg font-medium"
            >
              Luthiers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/perfil" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <Heart size={16} />
                    <span className="hidden lg:inline">Favoritos</span>
                  </Button>
                </Link>
                <Link href="/anunciar">
                  <Button variant="primary" size="sm">
                    <PlusCircle size={16} weight="bold" />
                    <span className="hidden lg:inline">Anunciar</span>
                  </Button>
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Avatar src={profile?.photo} name={profile?.name} size="sm" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-glass p-1.5 animate-scale-in">
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-medium truncate">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-xs text-surface-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <User size={16} />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/perfil?tab=anuncios"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <List size={16} />
                        Meus Anúncios
                      </Link>
                      {profile?.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-amber-400"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-red-400"
                      >
                        <SignOut size={16} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/?login=true">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/?register=true">
                  <Button variant="primary" size="sm">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2 rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Search Bar Row */}
      <div className="md:hidden border-t border-white/5 p-2 bg-background/80 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar instrumentos, marcas..."
            className="input-field py-1.5 px-3 text-xs flex-1 bg-white/[0.03] border-white/10 rounded-xl"
          />
          <Button type="submit" size="sm" className="px-3">
            <MagnifyingGlass size={14} />
          </Button>
        </form>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 p-4 animate-slide-up space-y-1 bg-background/95 backdrop-blur-lg">
          <Link
            href="/anuncios"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            Anúncios
          </Link>
          <Link
            href="/luthier"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            Luthiers
          </Link>
          {user && (
            <>
              <Link
                href="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
              >
                Meu Perfil
              </Link>
              <Link
                href="/anunciar"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
              >
                Anunciar
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
