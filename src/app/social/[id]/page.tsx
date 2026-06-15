"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Compass,
  GraduationCap,
  MapPin,
  MusicNotes,
  Plus,
  ShieldCheck,
  Star,
  User,
  Wrench,
  PencilSimple,
  Sliders,
  Warning,
  Eye,
  DeviceMobile,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPosts,
  deletePost,
  getFollowCounts,
  updateContactOptions,
  updateEquipments,
} from "@/lib/socialService";
import { getUserData } from "@/lib/userService";
import type { PostData, UserData, EquipmentItem, SocialContactOptions } from "@/lib/roles";

import PostCard from "@/components/social/PostCard";
import FollowButton from "@/components/social/FollowButton";
import ContactPanel from "@/components/social/ContactPanel";
import EquipmentManager from "@/components/social/EquipmentManager";
import CreatePostModal from "@/components/social/CreatePostModal";
import LoginModal from "@/components/LoginModal";
import ChatHeaderButton from "@/components/ChatHeaderButton";
import NotificationBell from "@/components/NotificationBell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserSocialProfilePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.id;

  const { user, logout } = useAuth();
  const isOwnProfile = user?.uid === targetUserId;

  // Estados dos dados do perfil alvo
  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Estados sociais do perfil alvo
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [activeTab, setActiveTab] = useState<"posts" | "equipments" | "about">("posts");

  // Modais e toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactSettings, setShowContactSettings] = useState(false);

  // Perfil do user logado
  const [loggedProfile, setLoggedProfile] = useState<UserData | null>(null);

  // Carrega perfil logado
  useEffect(() => {
    if (!user) {
      setLoggedProfile(null);
      return;
    }
    getUserData(user.uid)
      .then(setLoggedProfile)
      .catch((err) => console.error("Erro ao carregar perfil logado:", err));
  }, [user]);

  // Carrega informações do perfil alvo e estatísticas
  const loadProfileData = useCallback(async () => {
    setLoadingUser(true);
    try {
      const uData = await getUserData(targetUserId);
      if (!uData) {
        toast.error("Usuário não encontrado.");
        router.push("/social");
        return;
      }
      setTargetUser(uData);

      // Carrega estatísticas de seguidor/seguindo
      const counts = await getFollowCounts(targetUserId);
      setFollowCounts(counts);
    } catch (err) {
      console.error("Erro ao carregar perfil social:", err);
      toast.error("Erro ao carregar perfil.");
    } finally {
      setLoadingUser(false);
    }
  }, [targetUserId, router]);

  // Carrega posts do perfil alvo
  const loadUserPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const userPosts = await getUserPosts(targetUserId, 20);
      setPosts(userPosts);
    } catch (err) {
      console.error("Erro ao carregar posts do utilizador:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadProfileData();
    loadUserPosts();
  }, [loadProfileData, loadUserPosts]);

  // Atualiza opções de contacto
  const handleSaveContactOptions = async (options: SocialContactOptions) => {
    try {
      await updateContactOptions(targetUserId, options);
      // Atualiza localmente
      setTargetUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          social: {
            ...prev.social,
            equipments: prev.social?.equipments || [],
            contactOptions: options,
          },
        };
      });
      setShowContactSettings(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Atualiza equipamentos
  const handleUpdateEquipments = async (newEquipments: EquipmentItem[]) => {
    try {
      await updateEquipments(targetUserId, newEquipments);
      // Atualiza localmente
      setTargetUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          social: {
            ...prev.social,
            contactOptions: prev.social?.contactOptions || {
              internalChatEnabled: true,
              whatsappEnabled: false,
              whatsappNumber: null,
            },
            equipments: newEquipments,
          },
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

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

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <MusicNotes size={32} className="animate-spin text-[#ef7c2c]" />
          <p className="text-xs text-surface-400">Carregando perfil social...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) return null;

  // Equipamentos do usuário
  const equipmentsList = targetUser.social?.equipments || [];

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans relative overflow-x-hidden">
      {/* Premium Banner Glow */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#ef7c2c]/10 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/social"
              className="text-surface-400 hover:text-white transition-colors h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/5"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <Compass size={18} className="text-[#ef7c2c]" />
              <span className="text-xs font-bold text-surface-300">Perfil Social</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <ChatHeaderButton />
                <NotificationBell />
                <Link
                  href="/profile"
                  id="nav-profile-link"
                  className="flex items-center gap-2 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {loggedProfile?.photoURL ? (
                      <img
                        src={loggedProfile.photoURL}
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
                    {loggedProfile?.displayName || user.displayName || user.email}
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
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#2a2827] text-surface-300 text-xs font-semibold transition-all duration-200 hover:border-[#ef7c2c]/30 hover:text-white hover:bg-[#181615] active:scale-[0.97] cursor-pointer"
              >
                <User size={14} />
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">
        
        {/* Banner/Hero Card */}
        <section className="glass rounded-3xl p-6 border border-white/[0.06] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Avatar grande */}
            <div className="relative flex-shrink-0">
              {targetUser.photoURL ? (
                <img
                  src={targetUser.photoURL}
                  alt={targetUser.displayName}
                  className="h-28 w-28 rounded-full object-cover border-4 border-[#ef7c2c] shadow-md"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-surface-750 border-4 border-[#ef7c2c] flex items-center justify-center text-4xl font-bold text-surface-400 shadow-md">
                  {targetUser.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-heading)] text-white">
                    {targetUser.displayName}
                  </h1>

                  {/* Badges */}
                  {targetUser.isVerified && (
                    <span
                      title="Verificado"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20"
                    >
                      <ShieldCheck size={11} weight="fill" />
                      Verificado
                    </span>
                  )}
                  {targetUser.isPremium && (
                    <span
                      title="Membro Premium"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold border border-yellow-500/20"
                    >
                      <Star size={11} weight="fill" />
                      Pro
                    </span>
                  )}
                  {targetUser.luthierStatus === "approved" && (
                    <span
                      title="Luthier Parceiro"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20"
                    >
                      <Wrench size={11} weight="fill" />
                      Luthier
                    </span>
                  )}
                  {targetUser.teacherStatus === "approved" && (
                    <span
                      title="Professor de Música"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20"
                    >
                      <GraduationCap size={11} weight="fill" />
                      Professor
                    </span>
                  )}
                </div>

                {targetUser.bio && (
                  <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-2xl font-light">
                    {targetUser.bio}
                  </p>
                )}
              </div>

              {/* Localização & Membro Desde */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-surface-400">
                {targetUser.address?.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[#ef7c2c]" />
                    {targetUser.address.city}, {targetUser.address.state}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} />
                  Membro desde {new Date(targetUser.createdAt).getFullYear()}
                </span>
              </div>

              {/* Stats de seguidores */}
              <div className="flex justify-center sm:justify-start items-center gap-5 pt-1 text-xs">
                <div>
                  <span className="font-extrabold text-white">{posts.length}</span>{" "}
                  <span className="text-surface-400">publicações</span>
                </div>
                <div>
                  <span className="font-extrabold text-white">{followCounts.followers}</span>{" "}
                  <span className="text-surface-400">seguidores</span>
                </div>
                <div>
                  <span className="font-extrabold text-white">{followCounts.following}</span>{" "}
                  <span className="text-surface-400">seguindo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-4 border-t border-white/[0.04]">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Plus size={14} />
                  Nova Publicação
                </button>
                <Link href="/profile" className="btn-secondary text-xs py-2 px-4">
                  <PencilSimple size={14} />
                  Editar Perfil
                </Link>
                <button
                  onClick={() => setShowContactSettings(!showContactSettings)}
                  className={`btn-secondary text-xs py-2 px-4 ${
                    showContactSettings ? "bg-white/10" : ""
                  }`}
                >
                  <Sliders size={14} />
                  Opções de Contacto
                </button>
              </>
            ) : (
              <>
                <FollowButton
                  targetUserId={targetUserId}
                  targetUserName={targetUser.displayName}
                  targetUserPhoto={targetUser.photoURL}
                />
                <button
                  onClick={() => setShowContactSettings(!showContactSettings)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  <DeviceMobile size={14} />
                  Contacto
                </button>
              </>
            )}
          </div>

          {/* ContactPanel Dropdown/Inline */}
          {showContactSettings && (
            <div className="mt-3">
              <ContactPanel
                userId={targetUserId}
                isOwnProfile={isOwnProfile}
                contactOptions={targetUser.social?.contactOptions}
                phone={targetUser.phone}
                onSave={handleSaveContactOptions}
              />
            </div>
          )}
        </section>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.06] p-0.5 gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "posts", label: `Publicações (${posts.length})` },
            { id: "equipments", label: `Equipamentos (${equipmentsList.length})` },
            { id: "about", label: "Sobre" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-4 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer flex-shrink-0
                ${
                  activeTab === tab.id
                    ? "border-[#ef7c2c] text-[#ef7c2c]"
                    : "border-transparent text-surface-400 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== CONTEÚDO DA TAB SELECIONADA ===== */}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="glass rounded-2xl p-4 border border-white/[0.06] animate-pulse space-y-3"
                  >
                    <div className="h-10 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-40 bg-white/10 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="glass rounded-2xl p-10 border border-white/[0.06] text-center space-y-3">
                <MusicNotes size={36} className="mx-auto text-surface-500 opacity-40" />
                <p className="text-xs text-surface-400">
                  {isOwnProfile
                    ? "Você ainda não publicou nada. Compartilhe a sua primeira publicação!"
                    : "Este usuário ainda não fez nenhuma publicação."}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="py-2 px-4 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 hover:bg-[#ef7c2c]/20 text-xs font-bold"
                  >
                    Nova Publicação
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.uid}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "equipments" && (
          <div>
            {isOwnProfile ? (
              <EquipmentManager
                userId={targetUserId}
                equipments={equipmentsList}
                onUpdate={handleUpdateEquipments}
                planTier={targetUser.premiumTier || "free"}
              />
            ) : equipmentsList.length === 0 ? (
              <div className="glass rounded-2xl p-10 border border-white/[0.06] text-center space-y-2">
                <MusicNotes size={32} className="mx-auto text-surface-500 opacity-40" />
                <p className="text-xs text-surface-400">
                  Nenhum equipamento listado no perfil deste usuário.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {equipmentsList.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-3.5 flex items-center gap-3 border border-white/[0.05]"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-surface-700 border border-white/6 flex items-center justify-center flex-shrink-0">
                        <MusicNotes size={20} className="text-surface-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-surface-50 truncate">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-surface-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <section className="glass rounded-2xl p-5 border border-white/[0.06] space-y-4 animate-fade-in text-xs sm:text-sm">
            <h3 className="text-sm font-bold text-surface-100 uppercase tracking-wide">
              Sobre {targetUser.displayName}
            </h3>

            <div className="space-y-3.5 text-surface-200">
              {targetUser.bio && (
                <div className="space-y-1">
                  <span className="font-bold text-surface-400 text-xs">Bio</span>
                  <p className="leading-relaxed font-light">{targetUser.bio}</p>
                </div>
              )}

              {/* Informações detalhadas do vendedor / luthier / professor */}
              {targetUser.sellerAbout && (
                <div className="space-y-1">
                  <span className="font-bold text-surface-400 text-xs">Apresentação</span>
                  <p className="leading-relaxed font-light">{targetUser.sellerAbout}</p>
                </div>
              )}

              {targetUser.sellerMusic && (
                <div className="space-y-1">
                  <span className="font-bold text-surface-400 text-xs">Estilos & Música</span>
                  <p className="leading-relaxed font-light">{targetUser.sellerMusic}</p>
                </div>
              )}

              {targetUser.sellerHobbies && (
                <div className="space-y-1">
                  <span className="font-bold text-surface-400 text-xs">Interesses & Hobbies</span>
                  <p className="leading-relaxed font-light">{targetUser.sellerHobbies}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                <div className="space-y-0.5">
                  <span className="text-xs text-surface-400 block font-semibold">Localização</span>
                  <span className="text-surface-250 font-bold">
                    {targetUser.address?.city ? (
                      `${targetUser.address.city}, ${targetUser.address.state}`
                    ) : (
                      "Não informada"
                    )}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-surface-400 block font-semibold">Status de Cadastro</span>
                  <span className="text-surface-250 font-bold">
                    {targetUser.isPremium ? "Usuário Pro" : "Membro Standard"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Criação de Post */}
      {isOwnProfile && user && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={loadUserPosts}
          userId={user.uid}
          userName={targetUser.displayName}
          userPhoto={targetUser.photoURL || ""}
        />
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
