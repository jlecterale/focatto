"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserData, getTeacherProfile } from "../../../lib/userService";
import { getSellerStats, getSellerRatings, getUserRatingForSeller, addRating } from "../../../lib/ratingService";
import { getUserApprovedProducts } from "../../../lib/productService";
import type { UserData, SellerStats, ProductData, RatingData, TeacherData } from "../../../lib/roles";
import {
  ArrowLeft, Star, MapPin, ShieldCheck, WhatsappLogo, Clock,
  Sparkle, MusicNote, HeartStraight, Smiley, Tag, Package, GraduationCap, Phone, ChatCircleDots
} from "@phosphor-icons/react";
import { useAuth } from "../../../contexts/AuthContext";
import LoginModal from "../../../components/LoginModal";
import { toast } from "sonner";
import NotificationBell from "../../../components/NotificationBell";
import ChatHeaderButton from "../../../components/ChatHeaderButton";
import { createOrGetChat } from "../../../lib/chatService";

export default function VendedorPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const { user } = useAuth();
  const [seller, setSeller] = useState<UserData | null>(null);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState<RatingData | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!sellerId) return;
      setLoading(true);
      const [sellerData, sellerStats, sellerRatings, sellerProducts] = await Promise.all([
        getUserData(sellerId),
        getSellerStats(sellerId),
        getSellerRatings(sellerId),
        getUserApprovedProducts(sellerId),
      ]);
      setSeller(sellerData);
      setStats(sellerStats);
      setRatings(sellerRatings);
      setProducts(sellerProducts.filter((p) => p.status === "approved"));

      if (sellerData?.isTeacher) {
        const tProfile = await getTeacherProfile(sellerId);
        setTeacherProfile(tProfile);
      }

      if (user) {
        const existing = await getUserRatingForSeller(sellerId, user.uid);
        setUserRating(existing);
      }

      setLoading(false);
    }
    load();
  }, [sellerId, user]);

  async function handleStartChat() {
    if (!user) { setShowLogin(true); return; }
    if (!seller) return;
    if (user.uid === sellerId) {
      return;
    }
    try {
      const chatId = await createOrGetChat(
        user.uid,
        user.displayName || user.email || "Comprador",
        user.photoURL || "",
        sellerId,
        seller.displayName || "Vendedor",
        seller.photoURL || "",
      );
      router.push(`/chat?id=${chatId}`);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
    }
  }

  async function handleSubmitRating() {
    if (!user || !sellerId || ratingValue === 0) return;
    setSubmitting(true);
    try {
      await addRating(
        sellerId,
        user.uid,
        user.displayName || user.email || "Anônimo",
        ratingValue,
        ratingComment,
      );
      setRatingValue(0);
      setRatingComment("");
      toast.success("Avaliação enviada com sucesso! Ela aparecerá após aprovação do administrador.");

      const existing = await getUserRatingForSeller(sellerId, user.uid);
      setUserRating(existing);
    } catch (error) {
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-surface-400">
          <Clock size={28} className="animate-spin" />
          <p className="text-xs">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex flex-col items-center justify-center gap-4">
        <p className="text-surface-400 text-sm">Vendedor não encontrado.</p>
        <button onClick={() => router.push("/")} className="text-xs text-[#ef7c2c] hover:underline cursor-pointer">
          Voltar para o marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="h-5 w-px bg-[#2a2827]" />
            <img src="/focattolecter.png" alt="Logo" className="h-7 w-auto object-contain invert brightness-110 mix-blend-screen" />
          </div>
          <ChatHeaderButton />
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid md:grid-cols-12 gap-6">

          {/* Left: Seller Info + Profile */}
          <div className="md:col-span-7 flex flex-col gap-5">

            {/* Header Card */}
            <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] shadow-xl">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 overflow-hidden">
                  {seller.photoURL ? (
                    <img src={seller.photoURL} alt={seller.displayName} className="h-full w-full object-cover" />
                  ) : (
                    (seller.displayName || "V").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white font-heading">{seller.displayName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {seller.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <ShieldCheck size={14} weight="fill" />
                        Verificado
                      </span>
                    )}
                    {seller.isProfessional && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                        Profissional
                      </span>
                    )}
                    <span className="text-xs text-surface-500">Membro desde {formatDate(seller.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              {stats && stats.totalRatings > 0 && (
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#22201e]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">{stats.averageRating}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          weight={star <= Math.round(stats.averageRating) ? "fill" : "regular"}
                          className={star <= Math.round(stats.averageRating) ? "text-amber-400" : "text-surface-600"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-surface-500 mt-1 block">
                      {stats.totalRatings} {stats.totalRatings === 1 ? "avaliação" : "avaliações"}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.ratingDistribution[star] || 0;
                      const pct = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="text-surface-400 w-3 text-right">{star}</span>
                          <Star size={10} className="text-amber-400" weight="fill" />
                          <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-surface-500 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Location */}
              {seller.address?.city && (
                <div className="flex items-start gap-2 text-xs text-surface-300 mb-3">
                  <MapPin size={14} className="text-[#ef7c2c] mt-0.5 flex-shrink-0" />
                  <span>
                    {seller.address.city}, {seller.address.state}
                    {seller.address.neighborhood ? ` - ${seller.address.neighborhood}` : ""}
                  </span>
                </div>
              )}

              {/* Bio */}
              {seller.bio && (
                <div className="mt-4 pt-4 border-t border-[#22201e]">
                  <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{seller.bio}</p>
                </div>
              )}
            </div>

            {/* Teacher Profile Section */}
            {seller.isTeacher && teacherProfile && (
              <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#22201e]">
                  <GraduationCap size={20} className="text-[#ef7c2c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Perfil de Professor de Música</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teacherProfile.pricePerHour !== undefined && teacherProfile.pricePerHour > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider">Valor Hora/Aula:</span>
                      <span className="text-base font-bold text-[#ef7c2c]">R$ {teacherProfile.pricePerHour.toLocaleString("pt-BR")} / hora</span>
                    </div>
                  )}
                  {teacherProfile.omb && (
                    <div>
                      <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider">Registro Profissional:</span>
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ★ Reg. OMB: {teacherProfile.omb}
                      </span>
                    </div>
                  )}
                </div>

                {teacherProfile.specialties && teacherProfile.specialties.length > 0 && (
                  <div>
                    <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">Instrumentos & Especialidades:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherProfile.specialties.map((s, idx) => (
                        <span key={idx} className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {teacherProfile.levels && teacherProfile.levels.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Níveis:</span>
                      <div className="flex flex-col gap-1">
                        {teacherProfile.levels.map((l, idx) => (
                          <span key={idx} className="text-xs text-surface-300">• {l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {teacherProfile.modalities && teacherProfile.modalities.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Modalidades:</span>
                      <div className="flex flex-col gap-1">
                        {teacherProfile.modalities.map((m, idx) => (
                          <span key={idx} className="text-xs text-surface-300">• {m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {teacherProfile.targetAudience && teacherProfile.targetAudience.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Atende:</span>
                      <div className="flex flex-col gap-1">
                        {teacherProfile.targetAudience.map((a, idx) => (
                          <span key={idx} className="text-xs text-surface-300">• {a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {teacherProfile.bio && (
                  <div className="pt-2">
                    <span className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Metodologia das Aulas:</span>
                    <p className="text-xs text-surface-300 leading-relaxed whitespace-pre-wrap">{teacherProfile.bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Fun Profile Sections */}
            {seller.sellerAbout && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                  <Sparkle size={16} className="text-amber-400" weight="fill" />
                  Quem Sou Eu
                </h3>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{seller.sellerAbout}</p>
              </div>
            )}

            {seller.sellerMusic && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                  <MusicNote size={16} className="text-amber-400" weight="fill" />
                  Gosto Musical
                </h3>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{seller.sellerMusic}</p>
              </div>
            )}

            {seller.sellerHobbies && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                  <HeartStraight size={16} className="text-amber-400" weight="fill" />
                  Hobbies
                </h3>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{seller.sellerHobbies}</p>
              </div>
            )}

            {seller.sellerFunFacts && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                  <Smiley size={16} className="text-amber-400" weight="fill" />
                  Fatos Divertidos
                </h3>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{seller.sellerFunFacts}</p>
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white mb-4">
                  <Package size={16} className="text-[#ef7c2c]" />
                  Anúncios deste vendedor ({products.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/anuncio/${product.id}`}
                      className="group bg-[#110f0e] border border-[#1c1a19] rounded-xl overflow-hidden hover:border-[#ef7c2c]/30 transition-all"
                    >
                      <div className="h-28 bg-[#0d0b0a] flex items-center justify-center overflow-hidden">
                        {product.photos && product.photos.length > 0 ? (
                          <img src={product.photos[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <Tag size={24} className="text-surface-600" />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-white truncate">{product.title}</p>
                        <p className="text-xs text-[#ef7c2c] font-bold mt-1">
                          R$ {product.price.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-[10px] text-surface-500 mt-1">
                          {product.city}, {product.state}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 && (
              <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl text-center">
                <Package size={24} className="text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-500">Este vendedor ainda não possui anúncios ativos.</p>
              </div>
            )}
          </div>

          {/* Right: Contact + Stats Sidebar */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-4">Contato</h3>

              {/* Contact Buttons */}
              {seller.phone && (
                <div className="flex flex-col gap-2 mb-3">
                  <a
                    href={`https://wa.me/55${seller.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-emerald-600/20 w-full"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                    Falar no WhatsApp
                  </a>
                  <a
                    href={`tel:${seller.phone.replace(/\D/g, "")}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-600/20 w-full"
                  >
                    <Phone size={16} weight="fill" />
                    Ligar para Vendedor
                  </a>
                  {(!user || user.uid !== sellerId) && (
                    <button
                      onClick={handleStartChat}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#ef7c2c] hover:bg-[#d46a22] text-white text-xs font-semibold transition-all shadow-lg hover:shadow-[#ef7c2c]/20 w-full cursor-pointer"
                    >
                      <ChatCircleDots size={16} weight="fill" />
                      Chat Interno
                    </button>
                  )}
                </div>
              )}

              {/* Email */}
              {seller.email && (
                <div className="text-xs text-surface-500 text-center mb-4">
                  {seller.email}
                </div>
              )}

              {/* Stats Badges */}
              <div className="space-y-2">
                {stats && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#110f0e] border border-[#1c1a19]">
                    <span className="text-xs text-surface-400">Avaliações</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400" weight="fill" />
                      <span className="text-sm font-bold text-amber-400">{stats.averageRating}</span>
                      <span className="text-xs text-surface-500">({stats.totalRatings})</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#110f0e] border border-[#1c1a19]">
                  <span className="text-xs text-surface-400">Anúncios</span>
                  <span className="text-sm font-bold text-white">{products.length}</span>
                </div>
                {seller.isVerified && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#110f0e] border border-[#1c1a19]">
                    <span className="text-xs text-surface-400">Status</span>
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <ShieldCheck size={14} weight="fill" />
                      Verificado
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Reviews Section */}
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Star size={16} className="text-amber-400" weight="fill" />
                Avaliações do Perfil
                {stats && (
                  <span className="text-xs text-surface-400 font-normal">
                    ({stats.totalRatings})
                  </span>
                )}
              </h3>

              {/* Reviews List */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-4">
                {ratings.length === 0 ? (
                  <p className="text-xs text-surface-500 text-center py-4">Nenhuma avaliação aprovada ainda.</p>
                ) : (
                  ratings.map((r) => (
                    <div key={r.id} className="bg-[#110f0e] border border-[#1c1a19] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-[9px] font-bold text-white">
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-white truncate max-w-[100px]">{r.userName}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={10}
                              weight={star <= r.rating ? "fill" : "regular"}
                              className={star <= r.rating ? "text-amber-400" : "text-surface-600"}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-surface-300 mt-1">{r.comment}</p>}
                      <p className="text-[9px] text-surface-500 mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Rating Form */}
              {user ? (
                user.uid !== sellerId ? (
                  !userRating ? (
                    <div className="mt-4 pt-4 border-t border-[#22201e]">
                      <h4 className="text-xs font-bold text-white mb-2">Avaliar este perfil</h4>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingValue(star)}
                            className="cursor-pointer transition-all hover:scale-110"
                          >
                            <Star
                              size={20}
                              weight={star <= ratingValue ? "fill" : "regular"}
                              className={star <= ratingValue ? "text-amber-400" : "text-surface-600 hover:text-amber-400/50"}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Comente sua experiência com este vendedor (opcional)"
                        className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c] resize-none h-16 mb-2"
                      />
                      <button
                        onClick={handleSubmitRating}
                        disabled={ratingValue === 0 || submitting}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold transition-all hover:shadow-[0_4px_15px_rgba(239,124,44,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
                      >
                        {submitting ? "Enviando..." : "Enviar Avaliação"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-[#22201e]">
                      <p className="text-xs text-surface-400 flex items-center gap-1.5 justify-center bg-[#181615] py-2 rounded-lg border border-[#2a2827]">
                        <ShieldCheck size={14} className="text-emerald-400" weight="fill" />
                        Você já avaliou este perfil
                      </p>
                    </div>
                  )
                ) : null
              ) : (
                <div className="mt-4 pt-4 border-t border-[#22201e] text-center">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-xs text-[#ef7c2c] hover:underline cursor-pointer font-semibold"
                  >
                    Faça login para avaliar este perfil
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
