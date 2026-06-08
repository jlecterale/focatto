"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { getProductById } from "../../../lib/productService";
import { getUserData } from "../../../lib/userService";
import {
  addRating, getProductRatings, getUserRatingForProduct, getSellerStats,
} from "../../../lib/ratingService";
import { useAuth } from "../../../contexts/AuthContext";
import LoginModal from "../../../components/LoginModal";
import type { ProductData, UserData, RatingData, SellerStats } from "../../../lib/roles";
import {
  ArrowLeft, Star, MapPin, User, Tag, ShieldCheck, Clock,WhatsappLogo
} from "@phosphor-icons/react";

export default function AnuncioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [seller, setSeller] = useState<UserData | null>(null);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [userRating, setUserRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!productId) return;
      setLoading(true);
      const prod = await getProductById(productId);
      setProduct(prod);

      if (prod) {
        const [sellerData, stats, productRatings] = await Promise.all([
          getUserData(prod.userId),
          getSellerStats(prod.userId),
          getProductRatings(productId),
        ]);
        setSeller(sellerData);
        setSellerStats(stats);
        setRatings(productRatings);

        if (user) {
          const existing = await getUserRatingForProduct(productId, user.uid);
          setUserRating(existing);
        }
      }
      setLoading(false);
    }
    load();
  }, [productId, user]);

  async function handleSubmitRating() {
    if (!user || !product || ratingValue === 0) return;
    setSubmitting(true);
    try {
      await addRating(
        productId,
        product.userId,
        user.uid,
        user.displayName || user.email || "Anônimo",
        ratingValue,
        ratingComment,
      );
      setRatingValue(0);
      setRatingComment("");

      const [newRatings, newStats] = await Promise.all([
        getProductRatings(productId),
        getSellerStats(product.userId),
      ]);
      setRatings(newRatings);
      setSellerStats(newStats);

      const existing = await getUserRatingForProduct(productId, user.uid);
      setUserRating(existing);
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div className="h-5 w-px bg-[#2a2827]" />
          <img src="/focattolecter.png" alt="Logo" className="h-7 w-auto object-contain invert brightness-110 mix-blend-screen" />
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                  {product.category}
                </span>
                {product.condition && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                    {product.condition}
                  </span>
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

            {/* Ratings Section */}
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-400" weight="fill" />
                Avaliações
                {sellerStats && (
                  <span className="text-xs text-surface-400 font-normal">
                    ({sellerStats.totalRatings} {sellerStats.totalRatings === 1 ? "avaliação" : "avaliações"})
                  </span>
                )}
              </h3>

              {sellerStats && sellerStats.totalRatings > 0 && (
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#22201e]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">{sellerStats.averageRating}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          weight={star <= Math.round(sellerStats.averageRating) ? "fill" : "regular"}
                          className={star <= Math.round(sellerStats.averageRating) ? "text-amber-400" : "text-surface-600"}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = sellerStats.ratingDistribution[star] || 0;
                      const pct = sellerStats.totalRatings > 0 ? (count / sellerStats.totalRatings) * 100 : 0;
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

              {/* Rating List */}
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                {ratings.length === 0 ? (
                  <p className="text-xs text-surface-500 text-center py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
                ) : (
                  ratings.map((r) => (
                    <div key={r.id} className="bg-[#110f0e] border border-[#1c1a19] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-[10px] font-bold text-white">
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-white">{r.userName}</span>
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
                      <p className="text-[10px] text-surface-500 mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Rating Form */}
              {user ? (
                !userRating ? (
                  <div className="mt-4 pt-4 border-t border-[#22201e]">
                    <h4 className="text-xs font-bold text-white mb-3">Avaliar este anúncio</h4>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingValue(star)}
                          className="cursor-pointer transition-all hover:scale-110"
                        >
                          <Star
                            size={22}
                            weight={star <= ratingValue ? "fill" : "regular"}
                            className={star <= ratingValue ? "text-amber-400" : "text-surface-600 hover:text-amber-400/50"}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Comente sua experiência (opcional)"
                      className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c] resize-none h-20 mb-3"
                    />
                    <button
                      onClick={handleSubmitRating}
                      disabled={ratingValue === 0 || submitting}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold transition-all hover:shadow-[0_4px_15px_rgba(239,124,44,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? "Enviando..." : "Enviar Avaliação"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[#22201e]">
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={14} weight="fill" />
                      Você já avaliou este anúncio
                    </p>
                  </div>
                )
              ) : (
                <div className="mt-4 pt-4 border-t border-[#22201e]">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-xs text-[#ef7c2c] hover:underline cursor-pointer"
                  >
                    Faça login para avaliar
                  </button>
                </div>
              )}
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
                  <div className="flex items-center gap-1 mt-0.5">
                    {seller?.isVerified && (
                      <ShieldCheck size={14} className="text-blue-400" weight="fill" />
                    )}
                    <span className="text-xs text-surface-400">
                      {seller?.isVerified ? "Verificado" : "Membro"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seller Stats */}
              {sellerStats && sellerStats.totalRatings > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#110f0e] border border-[#1c1a19]">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={18} weight="fill" />
                    <span className="text-lg font-bold">{sellerStats.averageRating}</span>
                  </div>
                  <div className="text-xs text-surface-400">
                    <span className="block">{sellerStats.totalRatings} {sellerStats.totalRatings === 1 ? "avaliação" : "avaliações"}</span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-2 text-xs text-surface-300 mb-3">
                <MapPin size={14} className="text-[#ef7c2c] mt-0.5 flex-shrink-0" />
                <span>
                  {product.city}, {product.state}
                  {seller?.address?.neighborhood ? ` - ${seller.address.neighborhood}` : ""}
                </span>
              </div>

              {/* Contact */}
              {seller?.phone && (
                <a
                  href={`https://wa.me/55${seller.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-emerald-600/20 w-full"
                >
                  <WhatsappLogo size={16} weight="fill" />
                  Falar no WhatsApp
                </a>
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
