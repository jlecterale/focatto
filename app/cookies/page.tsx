"use client";

import Link from "next/link";
import { ArrowLeft, Cookie } from "@phosphor-icons/react";

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-300 hover:text-accent mb-8 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para a Home
      </Link>

      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <Cookie size={26} weight="duotone" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Política de Cookies</h1>
          <p className="text-xs text-surface-400 mt-1">Última atualização: 4 de junho de 2026</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-10 space-y-8 text-surface-200 leading-relaxed border border-white/5 shadow-glass">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto enviados para o seu computador ou dispositivo móvel quando você visita o nosso site. Eles nos ajudam a reconhecer seu dispositivo nas visitas futuras, melhorando o carregamento das páginas e lembrando suas preferências de navegação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">2. Como Utilizamos os Cookies?</h2>
          <p>
            Utilizamos as seguintes categorias de cookies na Focatto:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-surface-300">
            <li>
              <strong className="text-white font-semibold">Cookies Necessários:</strong> Fundamentais para que a plataforma funcione corretamente, permitindo que você navegue e utilize recursos de segurança e autenticação de contas.
            </li>
            <li>
              <strong className="text-white font-semibold">Cookies de Desempenho e Analíticos:</strong> Nos ajudam a entender como os visitantes interagem com o site, rastreando métricas de audiência e páginas de erro para otimização de performance.
            </li>
            <li>
              <strong className="text-white font-semibold">Cookies de Funcionalidade:</strong> Permitem memorizar suas escolhas (como filtros de busca, categoria padrão selecionada e idioma) para oferecer uma experiência mais personalizada.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">3. Gerenciamento de Cookies</h2>
          <p>
            Você pode gerenciar ou desabilitar cookies diretamente nas configurações do seu navegador web. Note que a desativação de cookies essenciais pode afetar a disponibilidade e o funcionamento correto de alguns recursos essenciais da plataforma Focatto.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">4. Contato</h2>
          <p>
            Para maiores esclarecimentos sobre nossa política de cookies, você pode nos contatar no e-mail{" "}
            <a href="mailto:suporte@focatto.com" className="text-accent hover:underline">
              suporte@focatto.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
