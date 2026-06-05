import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso - Focatto",
  description: "Termos e condições de uso da plataforma Focatto.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-[#ef7c2c] hover:underline mb-6 inline-block">
          &larr; Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold font-heading text-white mb-8">Termos de Uso</h1>

        <div className="space-y-6 text-sm text-surface-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma Focatto, você concorda com os termos e condições aqui descritos.
              Caso não concorde com algum dos termos, recomendamos que não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Definições</h2>
            <p>
              &quot;Plataforma&quot; refere-se ao site e aplicativo Focatto. &quot;Usuário&quot; refere-se a qualquer pessoa
              que acesse ou utilize a plataforma. &quot;Anunciante&quot; é o usuário que cadastra produtos ou serviços.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Cadastro e Conta</h2>
            <p>
              Para utilizar certos recursos, é necessário criar uma conta. Você é responsável por manter a
              confidencialidade de seus dados de acesso e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Anúncios e Transações</h2>
            <p>
              O Focatto é uma plataforma de marketplace que conecta compradores e vendedores. Não nos
              responsabilizamos por negociações realizadas entre usuários. Recomendamos verificar a
              procedência dos produtos e a reputação dos anunciantes antes de concluir qualquer transação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Verificação de Conta</h2>
            <p>
              Usuários podem solicitar verificação de identidade enviando documentação. O Focatto se reserva
              o direito de aprovar ou rejeitar solicitações a seu critério. Dados enviados são tratados com
              sigilo conforme nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Conduta do Usuário</h2>
            <p>
              É proibido publicar conteúdo falso, ofensivo, ilegal ou que viole direitos de terceiros.
              O Focatto pode remover anúncios e suspender contas que descumprirem estas regras.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Limitação de Responsabilidade</h2>
            <p>
              O Focatto não se responsabiliza por danos diretos ou indiretos decorrentes do uso da
              plataforma, incluindo mas não se limitando a negociações entre usuários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes termos a qualquer momento. Recomendamos revisar esta página
              periodicamente. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para nosso
              {" "}<Link href="/suporte" className="text-[#ef7c2c] hover:underline">suporte</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
