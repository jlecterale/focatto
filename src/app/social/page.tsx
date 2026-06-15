"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Plus,
  SignOut,
  User,
  MusicNotes,
  Image as ImageIcon,
  YoutubeLogo,
  SoundcloudLogo,
  Globe,
  Star,
  UsersThree,
  ArrowLeft,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { collection, getDocs, query, limit as firestoreLimit, where } from "firebase/firestore";
import { db } from "@/firebase";

import { useAuth } from "@/contexts/AuthContext";
import { getAllPosts, deletePost } from "@/lib/socialService";
import { getUserData } from "@/lib/userService";
import type { PostData, UserData } from "@/lib/roles";

import PostCard from "@/components/social/PostCard";
import CreatePostModal from "@/components/social/CreatePostModal";
import LoginModal from "@/components/LoginModal";
import ChatHeaderButton from "@/components/ChatHeaderButton";
import NotificationBell from "@/components/NotificationBell";

export default function SocialFeedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "photo" | "youtube" | "soundcloud">("all");
  const [featuredUsers, setFeaturedUsers] = useState<UserData[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Perfil do user logado
  const [profile, setProfile] = useState<UserData | null>(null);

  // Carrega perfil logado
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    getUserData(user.uid)
      .then(setProfile)
      .catch((err) => console.error("Erro ao carregar perfil:", err));
  }, [user]);

  // Carrega posts iniciais
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllPosts(10);
      setPosts(result.posts);
      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 10);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      toast.error("Erro ao carregar feed social.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega mais posts (infinite scroll)
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const result = await getAllPosts(10, lastDoc);
      setPosts((prev) => [...prev, ...result.posts]);
      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 10);
    } catch (err) {
      console.error("Erro ao carregar mais posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc]);

  // Carrega utilizadores em destaque (premium ou verificados)
  useEffect(() => {
    async function loadFeatured() {
      setLoadingFeatured(true);
      try {
        if (!db) return;
        // Busca utilizadores premium
        const q = query(
          collection(db, "users"),
          where("isPremium", "==", true),
          firestoreLimit(5)
        );
        const snap = await getDocs(q);
        let list = snap.docs.map((d) => d.data() as UserData);

        // Se houver menos de 5, busca verificados
        if (list.length < 5) {
          const qVer = query(
            collection(db, "users"),
            where("isVerified", "==", true),
            firestoreLimit(5 - list.length)
          );
          const snapVer = await getDocs(qVer);
          const verList = snapVer.docs
            .map((d) => d.data() as UserData)
            .filter((u) => !list.some((existing) => existing.uid === u.uid));
          list = [...list, ...verList];
        }

        // Se ainda for menos de 5, busca qualquer user
        if (list.length < 5) {
          const qAll = query(collection(db, "users"), firestoreLimit(10));
          const snapAll = await getDocs(qAll);
          const allList = snapAll.docs
            .map((d) => d.data() as UserData)
            .filter(
              (u) =>
                !list.some((existing) => existing.uid === u.uid) &&
                u.uid !== user?.uid
            )
            .slice(0, 5 - list.length);
          list = [...list, ...allList];
        }

        setFeaturedUsers(list);
      } catch (err) {
        console.error("Erro ao carregar utilizadores em destaque:", err);
      } finally {
        setLoadingFeatured(false);
      }
    }
    loadFeatured();
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handler para apagar post
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!user) return;
    try {
      await deletePost(postId, user.uid);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [user]);

  // Filtra os posts no client
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans relative overflow-x-hidden">
      {/* Premium Top Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_left,rgba(239,124,44,0.06),transparent_50%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center">
              <img
                src="/focattolecter.png"
                alt="Focattolecter Logo"
                className="h-10 sm:h-14 md:h-16 w-auto object-contain invert brightness-110 mix-blend-screen"
              />
            </Link>
            <span className="hidden sm:inline-block h-6 w-px bg-white/10" />
            <Link
              href="/social"
              className="text-xs sm:text-sm font-bold text-[#ef7c2c] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ef7c2c]/10 border border-[#ef7c2c]/20"
            >
              <Globe size={16} />
              Comunidade
            </Link>
          </div>

          {/* Auth e Ações */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  id="nav-new-post"
                  className="flex items-center justify-center gap-1 h-9 w-9 sm:h-auto sm:w-auto sm:py-2.5 sm:px-4 rounded-full sm:rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-bold transition-all duration-200 hover:shadow-[0_4px_15px_rgba(239,124,44,0.4)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span className="hidden sm:inline">Nova Publicação</span>
                </button>
                <ChatHeaderButton />
                <NotificationBell />
                <Link
                  href="/profile"
                  id="nav-profile-link"
                  className="flex items-center gap-2 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : user.displayName ? (
                      user.displayName.charAt(0).toUpperCase()
                    ) : (
                      user.email?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <span className="text-xs text-surface-300 hidden md:block max-w-[100px] truncate group-hover:text-white transition-colors">
                    {profile?.displayName || user.displayName || user.email}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  id="btn-logout"
                  className="text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30 hidden sm:block"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center justify-center gap-1 h-9 w-9 sm:h-auto sm:w-auto sm:py-2.5 sm:px-4 rounded-full sm:rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-bold transition-all duration-200 hover:shadow-[0_4px_15px_rgba(239,124,44,0.4)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span className="hidden sm:inline">Publicar</span>
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#2a2827] text-surface-300 text-xs font-semibold transition-all duration-200 hover:border-[#ef7c2c]/30 hover:text-white hover:bg-[#181615] active:scale-[0.97] cursor-pointer"
                >
                  <User size={14} />
                  Entrar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-heading)] gradient-text">
                Comunidade
              </h1>
              <p className="text-xs sm:text-sm text-surface-400 mt-1">
                Partilhe os seus equipamentos, fotos e faixas com o mundo da música.
              </p>
            </div>

            {/* Filtros horizontais */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
              {[
                { id: "all", label: "Tudo", icon: <Globe size={14} /> },
                { id: "photo", label: "Fotos", icon: <ImageIcon size={14} /> },
                { id: "youtube", label: "Vídeos", icon: <YoutubeLogo size={14} /> },
                { id: "soundcloud", label: "Áudios", icon: <SoundcloudLogo size={14} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id as any)}
                  className={`
                    flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0 cursor-pointer
                    ${
                      filter === item.id
                        ? "bg-[#ef7c2c] text-white shadow-md shadow-[#ef7c2c]/20"
                        : "bg-[#181615] border border-white/5 text-surface-400 hover:text-white hover:border-[#ef7c2c]/30"
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Listagem de posts */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="glass rounded-2xl p-4 border border-white/[0.06] animate-pulse space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-1/3 bg-white/10 rounded" />
                        <div className="h-2 w-1/4 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-40 bg-white/10 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass rounded-2xl p-10 border border-white/[0.06] text-center space-y-4">
                <MusicNotes size={48} className="mx-auto text-surface-500 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-surface-200">
                    Nenhuma publicação encontrada
                  </h3>
                  <p className="text-xs text-surface-400">
                    Seja o primeiro a partilhar o seu talento ou equipamento!
                  </p>
                </div>
                {user && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-bold"
                  >
                    Criar Publicação
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.uid}
                    onDelete={handleDeletePost}
                  />
                ))}

                {/* Carregar mais */}
                {hasMore && (
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="w-full py-3.5 rounded-xl border border-white/5 hover:border-[#ef7c2c]/30 text-surface-400 hover:text-white text-xs font-bold transition-all bg-white/2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Plus size={14} className="animate-spin" />
                        Carregando...
                      </span>
                    ) : (
                      "Carregar mais publicações"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block">
            <div className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                <Star size={14} className="text-[#ef7c2c]" />
                Perfis em Destaque
              </h2>

              {loadingFeatured ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-white/10" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 w-2/3 bg-white/10 rounded" />
                        <div className="h-2 w-1/2 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredUsers.length === 0 ? (
                <p className="text-xs text-surface-500">Sem perfis sugeridos.</p>
              ) : (
                <div className="space-y-3.5">
                  {featuredUsers.map((item) => (
                    <div
                      key={item.uid}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/3 transition-all border border-transparent hover:border-white/5"
                    >
                      <Link
                        href={`/social/${item.uid}`}
                        className="flex items-center gap-2.5 min-w-0"
                      >
                        {item.photoURL ? (
                          <img
                            src={item.photoURL}
                            alt={item.displayName}
                            className="h-9 w-9 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-surface-700 border border-white/10 flex items-center justify-center text-xs font-bold text-surface-400">
                            {item.displayName?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-surface-50 truncate hover:text-[#ef7c2c] transition-colors">
                            {item.displayName}
                          </p>
                          <p className="text-[10px] text-surface-400 truncate">
                            {item.isPremium
                              ? "Premium"
                              : item.isVerified
                              ? "Verificado"
                              : "Membro"}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/social/${item.uid}`}
                        className="text-[10px] font-bold text-[#ef7c2c] hover:underline flex-shrink-0"
                      >
                        Ver Perfil
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FAB Mobile */}
      {user && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white flex items-center justify-center shadow-lg shadow-[#ef7c2c]/30 active:scale-95 transition-transform z-40 cursor-pointer"
          aria-label="Nova publicação"
        >
          <Plus size={24} weight="bold" />
        </button>
      )}

      {/* Modais */}
      {user && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={loadPosts}
          userId={user.uid}
          userName={profile?.displayName || user.displayName || "Músico"}
          userPhoto={profile?.photoURL || ""}
        />
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
