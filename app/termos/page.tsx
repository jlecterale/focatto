"use client";

import Link from "next/link";
import { ArrowLeft, Scroll } from "@phosphor-icons/react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-300 hover:text-accent mb-8 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para a Home
      </Link>

      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <Scroll size={26} weight="duotone" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Termos de Uso</h1>
          <p className="text-xs text-surface-400 mt-1">Última atualização: 4 de junho de 2026</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-10 space-y-8 text-surface-200 leading-relaxed border border-white/5 shadow-glass">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma Focatto, você concorda expressamente em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">2. Cadastro e Segurança</h2>
          <p>
            Para publicar anúncios ou realizar compras na plataforma, você deverá criar uma conta fornecendo informações precisas e completas. Você é inteiramente responsável por manter a confidencialidade das credenciais de acesso da sua conta, bem como por todas as atividades realizadas sob seu usuário.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">3. Publicação de Anúncios</h2>
          <p>
            Como anunciante, você declara possuir todos os direitos de propriedade intelectual ou autorizações necessárias sobre os itens oferecidos (instrumentos, acessórios ou serviços de luthieria). É estritamente proibido anunciar:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-surface-300">
            <li>Itens ilegais, roubados ou falsificados.</li>
            <li>Produtos que violem direitos de terceiros ou propriedade industrial.</li>
            <li>Conteúdos ofensivos, enganosos ou fraudulentos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">4. Limitação de Responsabilidade</h2>
          <p>
            A Focatto é uma plataforma de facilitação de negócios que conecta compradores, vendedores e prestadores de serviço de luthieria. Não garantimos a qualidade, segurança ou legalidade dos itens anunciados, tampouco a veracidade das informações fornecidas pelos usuários. As transações são realizadas por conta e risco das partes envolvidas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">5. Modificações nos Termos</h2>
          <p>
            Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. Quaisquer modificações entrarão em vigor imediatamente após a publicação da nova versão nesta página.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white">6. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre nossos Termos de Uso, entre em contato através do e-mail{" "}
            <a href="mailto:suporte@focatto.com" className="text-accent hover:underline">
              suporte@focatto.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
