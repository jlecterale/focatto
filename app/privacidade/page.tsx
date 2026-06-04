"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-300 hover:text-accent mb-8 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para a Home
      </Link>

      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <ShieldCheck size={26} weight="duotone" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Política de Privacidade</h1>
          <p className="text-xs text-surface-400 mt-1">Última atualização: 4 de junho de 2026</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-10 space-y-8 text-surface-200 leading-relaxed border border-white/5 shadow-glass">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">1. Informações que Coletamos</h2>
          <p>
            Coletamos informações pessoais necessárias para a prestação de nossos serviços, como seu nome, endereço de e-mail, número de telefone, foto de perfil e dados de pagamento (quando aplicável). Também coletamos dados de navegação, incluindo seu endereço IP, tipo de navegador e páginas visitadas na nossa plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">2. Uso das Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-surface-300">
            <li>Processar o seu cadastro e gerenciar sua conta.</li>
            <li>Facilitar a comunicação entre compradores, vendedores e luthiers.</li>
            <li>Personalizar sua experiência e enviar comunicações sobre anúncios ou novidades.</li>
            <li>Prevenir fraudes e garantir a segurança geral da plataforma.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">3. Compartilhamento de Dados</h2>
          <p>
            Seus dados cadastrais públicos (como nome e foto) e as informações dos seus anúncios estarão visíveis para outros usuários da Focatto. Nós não vendemos seus dados pessoais. Podemos compartilhar dados com prestadores de serviço terceirizados que nos auxiliam a operar a plataforma ou quando exigido por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">4. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de seus dados pessoais a qualquer momento nas configurações do seu perfil ou entrando em contato diretamente com o nosso suporte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">5. Contato</h2>
          <p>
            Para exercer seus direitos de privacidade ou tirar dúvidas sobre esta política, fale conosco em{" "}
            <a href="mailto:privacidade@focatto.com" className="text-accent hover:underline">
              privacidade@focatto.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
