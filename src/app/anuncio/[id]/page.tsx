"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  getProductById, incrementProductViews, isProductFavorited, toggleFavoriteProduct,
} from "../../../lib/productService";
import { getUserData } from "../../../lib/userService";
import {
  getSellerStats,
} from "../../../lib/ratingService";
import { useAuth } from "../../../contexts/AuthContext";
import LoginModal from "../../../components/LoginModal";
import type { ProductData, UserData, RatingData, SellerStats } from "../../../lib/roles";
import {
  ArrowLeft, Star, MapPin, User, Tag, ShieldCheck, Clock, WhatsappLogo, HeartStraight, Phone, ChatCircleDots,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import NotificationBell from "../../../components/NotificationBell";
import ChatHeaderButton from "../../../components/ChatHeaderButton";
import { createOrGetChat } from "../../../lib/chatService";

export default function AnuncioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [seller, setSeller] = useState<UserData | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!productId) return;
      setLoading(true);
      const prod = await getProductById(productId);
      setProduct(prod);

      if (prod) {
        // Increment views if viewer is not the seller
        if (!user || user.uid !== prod.userId) {
          await incrementProductViews(productId);
        }

        const [sellerData, stats] = await Promise.all([
          getUserData(prod.userId),
          getSellerStats(prod.userId),
        ]);
        setSeller(sellerData);
        setSellerStats(stats);

        if (user) {
          const favStatus = await isProductFavorited(productId, user.uid);
          setIsFavorited(favStatus);
        }
      }
      setLoading(false);
    }
    load();
  }, [productId, user]);

  async function handleToggleFavorite() {
    if (!user || !product) return;
    setFavoriteLoading(true);
    try {
      const { favorited } = await toggleFavoriteProduct(
        productId,
        product.title,
        user.uid,
        user.displayName || user.email || "Usuário",
        user.email || "",
        product.userId
      );
      setIsFavorited(favorited);
      if (favorited) {
        toast.success("Adicionado aos favoritos!");
      } else {
        toast.success("Removido dos favoritos.");
      }
    } catch (error) {
      toast.error("Erro ao atualizar favoritos.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleStartChat() {
    if (!user) { setShowLogin(true); return; }
    if (!product || !seller) {
      toast.error("Erro: Anunciante não encontrado.");
      return;
    }
    if (user.uid === product.userId) {
      toast.error("Você não pode iniciar um chat com você mesmo.");
      return;
    }
    try {
      const chatId = await createOrGetChat(
        user.uid,
        user.displayName || user.email || "Comprador",
        user.photoURL || "",
        product.userId,
        seller.displayName || "Anunciante",
        seller.photoURL || "",
        { id: productId, title: product.title, photo: product.photos?.[0] || "" }
      );
      router.push(`/chat?id=${chatId}`);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      toast.error("Erro ao iniciar chat interno.");
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
          <p className="text-xs">Carregando anúncio...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex flex-col items-center justify-center gap-4">
        <p className="text-surface-400 text-sm">Anúncio não encontrado.</p>
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

          {/* Left: Product Details */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {/* Photos */}
            <div className="bg-[#141211] rounded-2xl border border-[#22201e] overflow-hidden shadow-xl">
              <div className="h-[300px] sm:h-[400px] w-full bg-[#0d0b0a] flex items-center justify-center">
                {product.photos && product.photos.length > 0 ? (
                  <img src={product.photos[0]} alt={product.title} className="h-full w-full object-contain" />
                ) : (
                  <Tag size={64} className="text-surface-600" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  {product.condition && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                      {product.condition}
                    </span>
                  )}
                </div>
                {/* Heart Button */}
                {(!user || user.uid !== product.userId) && (
                  <button
                    onClick={user ? handleToggleFavorite : () => setShowLogin(true)}
                    disabled={favoriteLoading}
                    className="flex items-center justify-center p-2 rounded-xl border border-[#2a2827] bg-[#181615] text-surface-400 hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer flex-shrink-0"
                    title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <HeartStraight
                      size={18}
                      weight={isFavorited ? "fill" : "regular"}
                      className={isFavorited ? "text-red-500" : ""}
                    />
                  </button>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-heading mt-2">{product.title}</h1>
              <p className="text-2xl font-bold text-[#ef7c2c] mt-2">
                R$ {product.price.toLocaleString("pt-BR")}
              </p>
              <hr className="border-[#22201e] my-4" />
              <p className="text-sm text-surface-300 font-body leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs text-surface-400">
                <Clock size={14} />
                Anunciado em {formatDate(product.createdAt)}
              </div>
            </div>
          </div>

          {/* Right: Seller Profile */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-4">Vendedor</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-lg font-bold text-white flex-shrink-0 overflow-hidden">
                  {seller?.photoURL ? (
                    <img src={seller.photoURL} alt={seller.displayName} className="h-full w-full object-cover" />
                  ) : (
                    (product.userName || "A").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-white truncate font-heading">
                    {product.userName}
                  </h4>
                  
                  {sellerStats && sellerStats.totalRatings > 0 && (
                    <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            weight={star <= Math.round(sellerStats.averageRating) ? "fill" : "regular"}
                            className={star <= Math.round(sellerStats.averageRating) ? "text-amber-400" : "text-surface-600"}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold ml-1">{sellerStats.averageRating}</span>
                      <span className="text-[10px] text-surface-500 font-normal">({sellerStats.totalRatings})</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1">
                    {seller?.isVerified && (
                      <ShieldCheck size={14} className="text-blue-400" weight="fill" />
                    )}
                    <span className="text-xs text-surface-400">
                      {seller?.isVerified ? "Verificado" : "Membro"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-xs text-surface-300 mb-3">
                <MapPin size={14} className="text-[#ef7c2c] mt-0.5 flex-shrink-0" />
                <span>
                  {product.city}, {product.state}
                  {product.neighborhood ? ` - ${product.neighborhood}` : (seller?.address?.neighborhood ? ` - ${seller.address.neighborhood}` : "")}
                </span>
              </div>

              {/* Contact */}
              {seller?.phone && (
                <div className="flex flex-col gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/55${seller.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-emerald-600/20 w-full"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                    Falar no WhatsApp
                  </a>

                  {/* Direct Call */}
                  <a
                    href={`tel:${seller.phone.replace(/\D/g, "")}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-600/20 w-full"
                  >
                    <Phone size={16} weight="fill" />
                    Ligar para Anunciante
                  </a>

                  {/* Internal Chat */}
                  {(!user || user.uid !== product?.userId) && (
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

              {product.userEmail && (
                <div className="mt-3 text-xs text-surface-500 text-center">
                  {product.userEmail}
                </div>
              )}

              <Link
                href={`/vendedor/${product.userId}`}
                className="mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 text-xs font-semibold hover:bg-[#ef7c2c]/20 transition-all w-full"
              >
                Ver Perfil Completo
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
