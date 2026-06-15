"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  DotsThree,
  Trash,
  MapPin,
  UsersThree,
  X,
  CaretLeft,
  CaretRight,
  SpinnerGap,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  toggleReaction,
  extractYoutubeId,
  getYoutubeEmbedUrl,
  getSoundcloudEmbedUrl,
} from "../../lib/socialService";
import type { PostData, ReactionType } from "../../lib/roles";
import { REACTION_EMOJIS } from "../../lib/roles";

interface PostCardProps {
  post: PostData;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onDelete,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reactingType, setReactingType] = useState<string | null>(null);
  const [localReactions, setLocalReactions] = useState(post.reactions);
  const [localTotal, setLocalTotal] = useState(post.totalReactions);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId && currentUserId === post.userId;

  // Tempo relativo
  const relativeTime = useMemo(() => {
    const diff = Date.now() - post.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days < 30) return `Há ${days}d`;
    return new Date(post.createdAt).toLocaleDateString("pt-BR");
  }, [post.createdAt]);

  // Reação ativa do utilizador
  const activeReaction = useMemo(() => {
    if (!currentUserId) return null;
    for (const [type, userIds] of Object.entries(localReactions)) {
      if (userIds.includes(currentUserId)) return type as ReactionType;
    }
    return null;
  }, [localReactions, currentUserId]);

  // Toggle de reação (com atualização otimista)
  const handleReaction = useCallback(
    async (reactionType: ReactionType) => {
      if (!currentUserId || !post.id || reactingType) return;

      setReactingType(reactionType);

      // Atualização otimista
      const newReactions = { ...localReactions };
      let wasRemoved = false;

      // Remove utilizador de qualquer reação existente
      for (const key of Object.keys(newReactions)) {
        const idx = newReactions[key].indexOf(currentUserId);
        if (idx > -1) {
          newReactions[key] = newReactions[key].filter(
            (id) => id !== currentUserId
          );
          if (newReactions[key].length === 0) {
            delete newReactions[key];
          }
          wasRemoved = key === reactionType;
        }
      }

      // Adiciona nova reação se não estava a remover a mesma
      if (!wasRemoved) {
        if (!newReactions[reactionType]) {
          newReactions[reactionType] = [];
        }
        newReactions[reactionType].push(currentUserId);
      }

      const newTotal = Object.values(newReactions).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      setLocalReactions(newReactions);
      setLocalTotal(newTotal);

      try {
        await toggleReaction(post.id, currentUserId, reactionType);
      } catch (err) {
        console.error("Erro ao reagir:", err);
        // Reverte
        setLocalReactions(post.reactions);
        setLocalTotal(post.totalReactions);
        toast.error("Erro ao processar reação.");
      } finally {
        setReactingType(null);
      }
    },
    [currentUserId, post.id, post.reactions, post.totalReactions, reactingType, localReactions]
  );

  // Eliminar post
  const handleDelete = useCallback(async () => {
    if (!post.id || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(post.id);
      toast.success("Publicação eliminada.");
    } catch {
      toast.error("Erro ao eliminar publicação.");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  }, [post.id, onDelete]);

  // Carrossel de fotos
  const goToSlide = (index: number) => {
    setCurrentSlide(
      Math.max(0, Math.min(index, post.images.length - 1))
    );
  };

  // YouTube embed
  const youtubeId = post.youtubeUrl
    ? extractYoutubeId(post.youtubeUrl)
    : null;

  return (
    <>
      <article className="glass rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.2)] card-hover animate-fade-in">
        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-3 p-4 pb-3">
          {/* Avatar */}
          <Link href={`/social/${post.userId}`} className="flex-shrink-0">
            {post.userPhoto ? (
              <img
                src={post.userPhoto}
                alt={post.userName}
                className="h-10 w-10 rounded-full object-cover border border-white/10 hover:border-[#ef7c2c]/40 transition-colors"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-surface-700 border border-white/10 flex items-center justify-center text-surface-400 text-sm font-bold">
                {post.userName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </Link>

          {/* Nome e data */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/social/${post.userId}`}
              className="text-sm font-bold text-surface-50 hover:text-[#ef7c2c] transition-colors truncate block"
            >
              {post.userName}
            </Link>
            <span className="text-[10px] text-surface-500">{relativeTime}</span>
          </div>

          {/* Menu ⋯ */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors cursor-pointer"
              >
                <DotsThree size={20} weight="bold" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 glass rounded-xl overflow-hidden shadow-2xl z-50 animate-scale-in">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    {deleting ? (
                      <SpinnerGap size={14} className="animate-spin" />
                    ) : (
                      <Trash size={14} />
                    )}
                    {deleting ? "Eliminando..." : "Eliminar publicação"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== TEXTO ===== */}
        {post.text && (
          <div className="px-4 pb-3">
            <p className="text-sm text-surface-100 leading-relaxed whitespace-pre-wrap text-optimize">
              {post.text}
            </p>
          </div>
        )}

        {/* ===== CONTEÚDO MEDIA ===== */}

        {/* Fotos com carrossel */}
        {post.type === "photo" && post.images.length > 0 && (
          <div className="relative group">
            <div className="overflow-hidden">
              <img
                src={post.images[currentSlide]}
                alt={`Foto ${currentSlide + 1}`}
                className="w-full aspect-[4/3] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                onClick={() => {
                  setLightboxIndex(currentSlide);
                  setLightboxOpen(true);
                }}
              />
            </div>

            {/* Setas de navegação */}
            {post.images.length > 1 && (
              <>
                <button
                  onClick={() => goToSlide(currentSlide - 1)}
                  disabled={currentSlide === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  onClick={() => goToSlide(currentSlide + 1)}
                  disabled={currentSlide === post.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                >
                  <CaretRight size={16} weight="bold" />
                </button>

                {/* Dots indicadores */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        i === currentSlide
                          ? "w-4 bg-[#ef7c2c]"
                          : "w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* YouTube embed */}
        {post.type === "youtube" && youtubeId && (
          <div className="px-4 pb-3">
            <div className="relative w-full overflow-hidden rounded-xl border border-white/6" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={getYoutubeEmbedUrl(youtubeId)}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* SoundCloud embed */}
        {post.type === "soundcloud" && post.soundcloudUrl && (
          <div className="px-4 pb-3">
            <div className="relative w-full overflow-hidden rounded-xl border border-white/6" style={{ height: "166px" }}>
              <iframe
                src={getSoundcloudEmbedUrl(post.soundcloudUrl)}
                title="SoundCloud player"
                allow="autoplay"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* ===== METADADOS (local + tags) ===== */}
        {(post.location || (post.taggedUsers && post.taggedUsers.length > 0)) && (
          <div className="px-4 pb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {post.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-surface-400">
                <MapPin size={12} weight="fill" className="text-[#ef7c2c]" />
                {post.location}
              </span>
            )}
            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-surface-400">
                <UsersThree size={12} className="text-surface-300" />
                {post.taggedUsers.map((u, i) => (
                  <span key={u.userId}>
                    <Link
                      href={`/social/${u.userId}`}
                      className="text-surface-200 hover:text-[#ef7c2c] transition-colors"
                    >
                      {u.displayName}
                    </Link>
                    {i < post.taggedUsers.length - 1 && ", "}
                  </span>
                ))}
              </span>
            )}
          </div>
        )}

        {/* ===== BARRA DE REAÇÕES ===== */}
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {(Object.entries(REACTION_EMOJIS) as [ReactionType, { emoji: string; label: string }][]).map(
                ([type, { emoji, label }]) => {
                  const count = localReactions[type]?.length || 0;
                  const isActive = activeReaction === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      disabled={!currentUserId || reactingType !== null}
                      title={label}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                        transition-all duration-150 cursor-pointer active:scale-[0.92]
                        disabled:cursor-default disabled:opacity-60
                        ${
                          isActive
                            ? "bg-[#ef7c2c]/15 border border-[#ef7c2c]/40 text-white shadow-[0_0_8px_rgba(239,124,44,0.15)]"
                            : "bg-white/3 border border-transparent hover:bg-white/6 text-surface-300 hover:text-surface-100"
                        }
                      `}
                    >
                      <span className="text-sm leading-none">{emoji}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] font-bold ${
                            isActive ? "text-[#ef7c2c]" : "text-surface-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* Total */}
            {localTotal > 0 && (
              <span className="text-[10px] text-surface-500 ml-2 flex-shrink-0">
                {localTotal} {localTotal === 1 ? "reação" : "reações"}
              </span>
            )}
          </div>
        </div>
      </article>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && post.images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Fechar */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>

          {/* Imagem */}
          <img
            src={post.images[lightboxIndex]}
            alt={`Foto ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navegação lightbox */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    Math.max(0, lightboxIndex - 1)
                  );
                }}
                disabled={lightboxIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    Math.min(post.images.length - 1, lightboxIndex + 1)
                  );
                }}
                disabled={lightboxIndex === post.images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer"
              >
                <CaretRight size={20} weight="bold" />
              </button>

              {/* Indicador */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
                {lightboxIndex + 1} / {post.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
