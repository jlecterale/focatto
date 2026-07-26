"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, UserCheck, BellSimple, BellSimpleSlash, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import {
  toggleFollowUser,
  isFollowingUser,
  toggleFollowNotifications,
} from "../../lib/socialService";

interface FollowButtonProps {
  targetUserId: string;
  targetUserName: string;
  targetUserPhoto: string | null;
  className?: string;
}

export default function FollowButton({
  targetUserId,
  targetUserName,
  targetUserPhoto,
  className = "",
}: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hovered, setHovered] = useState(false);

  // Verifica estado inicial de follow
  useEffect(() => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }
    setCheckingStatus(true);
    isFollowingUser(user.uid, targetUserId)
      .then((isFollowing) => {
        setFollowing(isFollowing);
      })
      .catch(console.error)
      .finally(() => setCheckingStatus(false));
  }, [user, targetUserId]);

  const handleToggleFollow = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const nowFollowing = await toggleFollowUser(
        user.uid,
        user.displayName || "Utilizador",
        user.photoURL || null,
        targetUserId,
        targetUserName,
        targetUserPhoto,
        true
      );
      setFollowing(nowFollowing);
      setNotifyEnabled(true);
      toast.success(
        nowFollowing
          ? `Você agora segue ${targetUserName}!`
          : `Você deixou de seguir ${targetUserName}.`
      );
    } catch (err) {
      console.error("Erro ao alterar follow:", err);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user, loading, targetUserId, targetUserName, targetUserPhoto]);

  const handleToggleNotify = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user || !following) return;
      const newValue = !notifyEnabled;
      setNotifyEnabled(newValue);
      try {
        await toggleFollowNotifications(user.uid, targetUserId, newValue);
        toast.success(
          newValue
            ? "Notificações ativadas para este perfil."
            : "Notificações desativadas para este perfil."
        );
      } catch (err) {
        console.error("Erro ao alternar notificações:", err);
        setNotifyEnabled(!newValue); // Reverte
        toast.error("Erro ao atualizar notificações.");
      }
    },
    [user, following, notifyEnabled, targetUserId]
  );

  // Não mostra o botão se for o próprio utilizador
  if (user?.uid === targetUserId) return null;

  if (checkingStatus) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/4 border border-white/6 text-sm text-surface-400 ${className}`}
      >
        <SpinnerGap size={16} className="animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Botão principal */}
      <button
        onClick={handleToggleFollow}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-200 cursor-pointer active:scale-[0.97]
          ${
            following
              ? hovered
                ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/15"
                : "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white border border-transparent shadow-[0_0_12px_rgba(239,124,44,0.2)]"
              : "bg-transparent border border-white/15 text-white hover:border-[#ef7c2c]/40 hover:bg-[#ef7c2c]/5"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <SpinnerGap size={16} className="animate-spin" />
        ) : following ? (
          hovered ? (
            <UserPlus size={16} weight="bold" />
          ) : (
            <UserCheck size={16} weight="bold" />
          )
        ) : (
          <UserPlus size={16} weight="bold" />
        )}
        <span className="animate-scale-in">
          {loading
            ? "Processando..."
            : following
            ? hovered
              ? "Deixar de seguir"
              : "Seguindo"
            : "Seguir"}
        </span>
        {following && !hovered && !loading && (
          <span className="text-[10px] opacity-80">✓</span>
        )}
      </button>

      {/* Toggle de notificações (só aparece quando seguindo) */}
      {following && !loading && (
        <button
          onClick={handleToggleNotify}
          title={
            notifyEnabled
              ? "Desativar notificações"
              : "Ativar notificações"
          }
          className={`
            h-[38px] w-[38px] rounded-xl flex items-center justify-center
            transition-all duration-200 cursor-pointer active:scale-[0.95] animate-scale-in
            ${
              notifyEnabled
                ? "bg-[#ef7c2c]/10 border border-[#ef7c2c]/25 text-[#ef7c2c] hover:bg-[#ef7c2c]/20"
                : "bg-white/4 border border-white/8 text-surface-400 hover:text-surface-200 hover:border-white/15"
            }
          `}
        >
          {notifyEnabled ? (
            <BellSimple size={16} weight="fill" />
          ) : (
            <BellSimpleSlash size={16} />
          )}
        </button>
      )}
    </div>
  );
}
