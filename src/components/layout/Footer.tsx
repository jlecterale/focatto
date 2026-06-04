"use client";

import Link from "next/link";
import { 
  InstagramLogo, 
  FacebookLogo, 
  YoutubeLogo, 
  Envelope, 
  MapPin, 
  ShieldCheck 
} from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-surface-950 border-t border-white/5 relative overflow-hidden mt-12">
      {/* Accent gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-gold-500 flex items-center justify-center text-white font-bold text-sm">
                F
              </span>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Focatto
              </span>
            </Link>
            <p className="text-sm text-surface-300 leading-relaxed">
              O maior e mais completo marketplace brasileiro dedicado a músicos, luthieres e apaixonados por música. Compre, venda e conecte-se.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-surface-300 hover:text-accent hover:bg-white/10 transition-all"
                aria-label="Instagram"
              >
                <InstagramLogo size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-surface-300 hover:text-accent hover:bg-white/10 transition-all"
                aria-label="Facebook"
              >
                <FacebookLogo size={18} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-surface-300 hover:text-accent hover:bg-white/10 transition-all"
                aria-label="YouTube"
              >
                <YoutubeLogo size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-semibold text-white tracking-wide">Explorar</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/?categoria=instrumentos" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Instrumentos
                </Link>
              </li>
              <li>
                <Link href="/?categoria=acessorios" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Acessórios
                </Link>
              </li>
              <li>
                <Link href="/luthier" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Luthiers
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Anunciar Produto
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional / Legal */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-semibold text-white tracking-wide">Institucional</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/termos" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-surface-300 hover:text-accent transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <span className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} weight="bold" /> Ambiente 100% Seguro
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-semibold text-white tracking-wide">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-surface-300">
                <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <span>São Paulo, SP - Brasil</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-surface-300">
                <Envelope size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <a href="mailto:suporte@focatto.com" className="hover:text-accent transition-colors">
                  suporte@focatto.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} Focatto. Todos os direitos reservados.
          </p>
          <p className="text-xs text-surface-400 flex items-center gap-1">
            Feito com paixão pela música 🎸
          </p>
        </div>
      </div>
    </footer>
  );
}
