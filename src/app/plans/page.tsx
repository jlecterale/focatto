"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Crown, 
  Wrench, 
  Megaphone, 
  Check, 
  ArrowLeft,
  Sparkle
} from "@phosphor-icons/react";
import { PLANS, Plan } from "../../lib/plans";

export default function PlansPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const handleToggleBilling = () => {
    setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly");
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "wrench":
        return <Wrench size={32} className="text-[#ef7c2c]" />;
      case "crown":
        return <Crown size={32} className="text-[#d4ae12]" />;
      case "megaphone":
        return <Megaphone size={32} className="text-indigo-400" />;
      default:
        return <Sparkle size={32} className="text-[#ef7c2c]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans relative overflow-x-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Premium Top Glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,rgba(239,124,44,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,174,18,0.03),transparent_50%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-semibold text-surface-400 hover:text-[#ef7c2c] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="sm:hidden">Voltar</span>
          <span className="hidden sm:inline">Voltar para a Página Inicial</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#ef7c2c]/10 text-[#ef7c2c] text-xs font-bold px-3 py-1 rounded-full border border-[#ef7c2c]/20 uppercase tracking-widest mb-4">
            Nossos Planos
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight mb-4">
            Escolha o Plano Perfeito para Você
          </h1>
          <p className="text-sm sm:text-base text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Maximize sua presença na Vibrattoo. Anuncie instrumentos, divulgue serviços de luthieria ou agende mais aulas de música com facilidade.
          </p>
        </div>

        {/* Billing Cycle Selector */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <span className={`text-sm font-semibold transition-colors ${billingCycle === "monthly" ? "text-[#ef7c2c]" : "text-surface-400"}`}>
            Mensal
          </span>
          <button 
            onClick={handleToggleBilling}
            className="w-14 h-8 bg-surface-800 rounded-full p-1 transition-all duration-300 relative border border-[#2a2827] focus:outline-none"
            aria-label="Alternar ciclo de faturamento"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] shadow-md transition-all duration-300 transform ${billingCycle === "yearly" ? "translate-x-6" : ""}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-[#ef7c2c]" : "text-surface-400"}`}>
            Anual
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Economize R$ 5/mês
            </span>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan: Plan) => {
            const isHighlighted = plan.highlight;
            const isFuture = plan.status === "future";
            const currentPrice = billingCycle === "yearly" ? plan.priceYearlyMonthly : plan.priceMonthly;

            return (
              <div 
                key={plan.id}
                className={`bg-[#141211]/90 rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                  isHighlighted 
                    ? "border-[#ef7c2c] shadow-[0_0_25px_rgba(239,124,44,0.15)] bg-gradient-to-b from-[#1d1712] to-[#141211]" 
                    : isFuture 
                    ? "border-[#22201e]/60 opacity-95 hover:border-[#2a2827]"
                    : "border-[#22201e] hover:border-[#2a2827]"
                } hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}
              >
                {/* Banner badge */}
                {plan.badgeText && (
                  <div className={`absolute top-4 right-4 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isFuture 
                      ? "bg-surface-800 text-surface-400 border border-surface-700" 
                      : "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-md"
                  }`}>
                    {plan.badgeText}
                  </div>
                )}

                <div>
                  {/* Plan Icon & Header */}
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${
                      isHighlighted 
                        ? "bg-[#ef7c2c]/10 border-[#ef7c2c]/30" 
                        : "bg-[#181615] border-[#2a2827]"
                    }`}>
                      {getIconComponent(plan.icon)}
                    </div>
                    <h2 className="text-xl font-bold text-white font-display mb-2">{plan.name}</h2>
                    <p className="text-xs text-surface-400 leading-relaxed min-h-[48px]">{plan.description}</p>
                  </div>

                  {/* Plan Price */}
                  <div className="mb-8 border-t border-[#22201e] pt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-surface-300">R$</span>
                      <span className="text-4xl font-extrabold text-white font-display tracking-tight transition-all">
                        {currentPrice.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-surface-500">/mês</span>
                    </div>
                    <p className="text-[10px] text-surface-500 mt-2 font-medium">
                      {billingCycle === "yearly" 
                        ? `Faturamento anual (R$ ${(currentPrice * 12).toFixed(2).replace(".", ",")} / ano)` 
                        : "Cobrado mensalmente"
                      }
                    </p>
                  </div>

                  {/* Plan Features */}
                  <div className="space-y-4 mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Recursos inclusos:</span>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs text-surface-300">
                          <Check size={16} weight="bold" className="text-[#ef7c2c] mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Button */}
                <div className="mt-auto pt-4 border-t border-[#22201e]/60">
                  {isFuture ? (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-[#181615] border border-[#2a2827] text-[#ef7c2c]/60 text-xs font-bold cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                    >
                      Implementação Futura
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (plan.tier === "tier1" || plan.tier === "tier2") {
                          router.push("/profile");
                        }
                      }}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        isHighlighted
                          ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-surface-800 border border-[#2a2827] text-white hover:bg-[#181615] hover:border-[#ef7c2c]/30 hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      Assinar {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Info note */}
        <div className="mt-20 text-center border-t border-[#22201e] pt-12">
          <p className="text-xs text-surface-500">
            Dúvidas sobre assinaturas? Entre em contato com nosso suporte através da página de <a href="/suporte" className="text-[#ef7c2c] hover:underline font-semibold">Suporte ao Cliente</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
