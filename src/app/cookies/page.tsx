import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies - Focatto",
  description: "Política de cookies e privacidade da plataforma Focatto.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-[#ef7c2c] hover:underline mb-6 inline-block">
          &larr; Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold font-heading text-white mb-8">Política de Cookies</h1>

        <div className="space-y-6 text-sm text-surface-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site.
              Eles ajudam a plataforma a funcionar corretamente, melhorar a experiência do usuário e fornecer
              informações aos proprietários do site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Como Utilizamos Cookies</h2>
            <p>O Focatto utiliza cookies para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Autenticação e segurança da sua conta</li>
              <li>Preferências de navegação e personalização</li>
              <li>Análise de desempenho e melhorias na plataforma</li>
              <li>Funcionalidades essenciais do site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Tipos de Cookies Utilizados</h2>

            <h3 className="text-white font-semibold mt-3 mb-1">Cookies Essenciais</h3>
            <p>
              Necessários para o funcionamento básico da plataforma, como autenticação e segurança.
              Não podem ser desativados.
            </p>

            <h3 className="text-white font-semibold mt-3 mb-1">Cookies de Preferência</h3>
            <p>
              Permitem que a plataforma lembre suas escolhas (como idioma e região) para oferecer
              uma experiência personalizada.
            </p>

            <h3 className="text-white font-semibold mt-3 mb-1">Cookies de Análise</h3>
            <p>
              Nos ajudam a entender como os usuários interagem com a plataforma, permitindo melhorias
              contínuas. Os dados são agregados e anônimos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Cookies de Terceiros</h2>
            <p>
              Utilizamos serviços como Firebase Authentication e Google Analytics, que podem
              armazenar cookies próprios para funcionamento e análise. Consulte as políticas de
              privacidade desses serviços para mais informações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Gerenciamento de Cookies</h2>
            <p>
              Você pode configurar seu navegador para bloquear ou alertar sobre cookies. No entanto,
              algumas funcionalidades da plataforma podem ser afetadas. Consulte as configurações do
              seu navegador para gerenciar preferências de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Contato</h2>
            <p>
              Dúvidas sobre o uso de cookies podem ser enviadas para nosso
              {" "}<Link href="/suporte" className="text-[#ef7c2c] hover:underline">suporte</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
