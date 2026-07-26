"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChatCircle,
  WhatsappLogo,
  Phone,
  FloppyDisk,
  SpinnerGap,
  ToggleLeft,
  ToggleRight,
  Info,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { createOrGetChat } from "../../lib/chatService";
import type { SocialContactOptions } from "../../lib/roles";

interface ContactPanelProps {
  userId: string;
  isOwnProfile: boolean;
  contactOptions?: SocialContactOptions;
  phone?: string;
  onSave?: (options: SocialContactOptions) => void;
}

export default function ContactPanel({
  userId,
  isOwnProfile,
  contactOptions,
  phone,
  onSave,
}: ContactPanelProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Estado de definições (modo edição do próprio perfil)
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    contactOptions?.whatsappEnabled ?? false
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    contactOptions?.whatsappNumber ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [chattingLoading, setChattingLoading] = useState(false);

  // Inicia chat interno
  const handleStartChat = useCallback(async () => {
    if (!user) {
      toast.error("Faça login para iniciar uma conversa.");
      return;
    }
    setChattingLoading(true);
    try {
      await createOrGetChat(
        user.uid,
        user.displayName || "Utilizador",
        user.photoURL || "",
        userId,
        "", // O nome do alvo será preenchido no chat
        ""
      );
      router.push(`/chat`);
    } catch (err) {
      console.error("Erro ao iniciar chat:", err);
      toast.error("Erro ao iniciar conversa. Tente novamente.");
    } finally {
      setChattingLoading(false);
    }
  }, [user, userId, router]);

  // Abre WhatsApp
  const handleWhatsApp = useCallback(() => {
    const number = contactOptions?.whatsappNumber?.replace(/\D/g, "");
    if (!number) return;
    window.open(`https://wa.me/${number}`, "_blank");
  }, [contactOptions]);

  // Abre link de ligação
  const handleCall = useCallback(() => {
    if (!phone) return;
    window.open(`tel:${phone.replace(/\D/g, "")}`, "_self");
  }, [phone]);

  // Salva definições de contacto
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      const options: SocialContactOptions = {
        internalChatEnabled: true,
        whatsappEnabled,
        whatsappNumber: whatsappEnabled ? whatsappNumber : null,
      };
      await onSave(options);
      toast.success("Opções de contacto atualizadas!");
    } catch (err) {
      console.error("Erro ao salvar contacto:", err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [onSave, whatsappEnabled, whatsappNumber]);

  // ===== MODO DEFINIÇÕES (perfil próprio) =====
  if (isOwnProfile) {
    return (
      <div className="glass rounded-2xl p-5 space-y-4 animate-fade-in">
        <h4 className="text-sm font-bold text-surface-100 tracking-wide">
          Definições de Contacto
        </h4>

        {/* Info chat interno */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ef7c2c]/5 border border-[#ef7c2c]/10">
          <Info size={16} className="text-[#ef7c2c] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-surface-300 leading-relaxed">
            O chat interno está sempre disponível para todos os perfis.
          </p>
        </div>

        {/* Toggle WhatsApp */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <WhatsappLogo
                size={18}
                weight="fill"
                className="text-green-400"
              />
              <span className="text-sm text-surface-100">
                Ativar WhatsApp
              </span>
            </div>
            {whatsappEnabled ? (
              <ToggleRight
                size={28}
                weight="fill"
                className="text-[#ef7c2c]"
              />
            ) : (
              <ToggleLeft size={28} className="text-surface-500" />
            )}
          </button>

          {/* Campo de número */}
          {whatsappEnabled && (
            <div className="animate-scale-in">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="input-field text-sm"
              />
              <p className="text-[10px] text-surface-500 mt-1.5 ml-1">
                Inclua o código do país (ex: +55 para Brasil)
              </p>
            </div>
          )}
        </div>

        {/* Botão salvar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <SpinnerGap size={16} className="animate-spin" />
          ) : (
            <FloppyDisk size={16} />
          )}
          {saving ? "Salvando..." : "Salvar Definições"}
        </button>
      </div>
    );
  }

  // ===== MODO VISUALIZAÇÃO (perfil de outro utilizador) =====
  return (
    <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in">
      <h4 className="text-sm font-bold text-surface-100 tracking-wide mb-1">
        Contacto
      </h4>

      {/* Botão Chat Interno — sempre visível */}
      <button
        onClick={handleStartChat}
        disabled={chattingLoading || !user}
        className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {chattingLoading ? (
          <SpinnerGap size={16} className="animate-spin" />
        ) : (
          <ChatCircle size={18} weight="fill" />
        )}
        {chattingLoading ? "Iniciando..." : "Chat Interno"}
      </button>

      {/* WhatsApp — só visível se ativado */}
      {contactOptions?.whatsappEnabled && contactOptions.whatsappNumber && (
        <button
          onClick={handleWhatsApp}
          className="btn-secondary w-full text-sm !border-green-500/20 hover:!border-green-500/40 hover:!bg-green-500/10 text-green-400"
        >
          <WhatsappLogo size={18} weight="fill" />
          WhatsApp
        </button>
      )}

      {/* Ligar — só visível se há telefone */}
      {phone && (
        <button
          onClick={handleCall}
          className="btn-secondary w-full text-sm"
        >
          <Phone size={18} weight="fill" />
          Ligar
        </button>
      )}
    </div>
  );
}
