"use client";

import { useState } from "react";
import Link from "next/link";
import { Envelope, ChatCircle, Question, Spinner } from "@phosphor-icons/react";
import { toast } from "sonner";

const FAQ_ITEMS = [
  {
    q: "Como criar uma conta?",
    a: "Clique em \"Entrar\" no canto superior direito e selecione \"Cadastre-se\". Preencha seus dados e pronto!",
  },
  {
    q: "Como funciona a verificação de conta?",
    a: "Acesse seu perfil, vá até a seção \"Verificação de Conta\" e envie foto do documento e selfie. Nossa equipe analisará e aprovará em até 48 horas.",
  },
  {
    q: "Como anunciar um produto?",
    a: "Após criar sua conta, você poderá cadastrar produtos na plataforma. Em breve disponibilizaremos a funcionalidade completa de anúncios.",
  },
  {
    q: "O Focattolecter cobra taxas?",
    a: "Atualmente o cadastro e a navegação são gratuitos. Futuramente poderão ser implementadas taxas para funcionalidades premium.",
  },
  {
    q: "Como entrar em contato com um vendedor?",
    a: "Utilize o chat disponível nos anúncios para conversar diretamente com o vendedor.",
  },
];

export default function SuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSending(true);
    // Simulate sending - in production this would call an API
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Mensagem enviada! Responderemos em breve.");
    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  }

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" id="back-to-home-link" className="text-sm text-[#ef7c2c] hover:underline mb-6 inline-block">
          &larr; Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold font-heading text-white mb-2">Suporte</h1>
        <p className="text-surface-400 text-sm mb-10">Estamos aqui para ajudar.</p>

        {/* FAQ */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Question size={20} className="text-[#ef7c2c]" />
            <h2 className="text-lg font-bold text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#141211] rounded-xl border border-[#22201e] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  id={`faq-item-toggle-${idx}`}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-item-panel-${idx}`}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-medium text-white hover:bg-[#1a1817] transition-colors"
                >
                  {item.q}
                  <span
                    className={`text-surface-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  >
                    &#9660;
                  </span>
                </button>
                {openFaq === idx && (
                  <div
                    id={`faq-item-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-item-toggle-${idx}`}
                    className="px-5 pb-4 text-sm text-surface-400 leading-relaxed"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ChatCircle size={20} className="text-[#ef7c2c]" />
            <h2 className="text-lg font-bold text-white">Fale Conosco</h2>
          </div>

          <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="support-name-input" className="block text-xs text-surface-400 mb-1.5">Nome</label>
                <input
                  type="text"
                  id="support-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className={inputBase}
                />
              </div>

              <div>
                <label htmlFor="support-email-input" className="block text-xs text-surface-400 mb-1.5">Email</label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="email"
                    id="support-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="support-message-textarea" className="block text-xs text-surface-400 mb-1.5">Mensagem</label>
                <textarea
                  id="support-message-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema..."
                  rows={5}
                  className={`${inputBase} resize-none`}
                />
              </div>

              <button
                type="submit"
                id="support-submit-btn"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? <Spinner size={16} className="animate-spin" /> : null}
                Enviar Mensagem
              </button>
            </form>
          </div>
        </section>

        {/* Direct Email */}
        <section className="mt-8 text-center">
          <p className="text-xs text-surface-400">
            Prefere enviar um email direto?{" "}
            <a
              href="mailto:suporte@focattolecter.com.br"
              id="support-direct-email-link"
              className="text-[#ef7c2c] hover:underline"
            >
              suporte@focattolecter.com.br
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
