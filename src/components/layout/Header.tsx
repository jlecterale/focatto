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
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
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

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/?categoria=instrumentos"
              className="btn-ghost text-sm px-3 py-2 rounded-lg"
            >
              Instrumentos
            </Link>
            <Link
              href="/?categoria=acessorios"
              className="btn-ghost text-sm px-3 py-2 rounded-lg"
            >
              Acessórios
            </Link>
            <Link
              href="/luthier"
              className="btn-ghost text-sm px-3 py-2 rounded-lg"
            >
              Luthiers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Buscar"
            >
              <MagnifyingGlass size={20} />
            </button>

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

      {searchOpen && (
        <div className="border-t border-white/5 p-3 animate-slide-up">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar instrumentos, marcas, luthiers..."
              className="input-field flex-1"
              autoFocus
            />
            <Button type="submit" size="md">
              <MagnifyingGlass size={18} />
              Buscar
            </Button>
          </form>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 p-4 animate-slide-up space-y-1">
          <Link
            href="/?categoria=instrumentos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            Instrumentos
          </Link>
          <Link
            href="/?categoria=acessorios"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            Acessórios
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
