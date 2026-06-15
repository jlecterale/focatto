"use client";

import { useState, useEffect } from "react";
import { 
  CaretLeft, 
  CaretRight, 
  Star, 
  MapPin, 
  Sparkle,
  Crown,
  GraduationCap,
  Wrench,
  Storefront
} from "@phosphor-icons/react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";

interface BannerProduct {
  id: string;
  title: string;
  price: number;
  icon: string;
}

interface BannerData {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  ctaLink: string;
  badgeText: string;
  badgeType: "luthier" | "teacher" | "store" | "premium";
  rating?: number;
  city: string;
  state: string;
  products: BannerProduct[];
}

const FALLBACK_BANNERS: BannerData[] = [
  {
    id: "b1",
    userId: "u_luthier_1",
    title: "Guthier Luteria",
    subtitle: "Regulagem fina, reparos, blindagem e customização de guitarras e baixos.",
    coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1200",
    ctaLink: "/vendedor/u_luthier_1",
    badgeText: "Luthier Premium",
    badgeType: "luthier",
    rating: 4.9,
    city: "São Paulo",
    state: "SP",
    products: [
      { id: "bp1", title: "Regulagem Standard", price: 150, icon: "🎸" },
      { id: "bp2", title: "Blindagem de Circuito", price: 280, icon: "⚡" }
    ]
  },
  {
    id: "b2",
    userId: "u_teacher_1",
    title: "Aline Mendes - Técnica Vocal",
    subtitle: "Aulas de canto focadas em fisiologia vocal, afinação e interpretação.",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
    ctaLink: "/vendedor/u_teacher_1",
    badgeText: "Professor Destaque",
    badgeType: "teacher",
    rating: 5.0,
    city: "Rio de Janeiro",
    state: "RJ",
    products: [
      { id: "bp3", title: "Aula Online (60min)", price: 120, icon: "🎙️" },
      { id: "bp4", title: "Preparação Vocal", price: 450, icon: "📚" }
    ]
  },
  {
    id: "b3",
    userId: "u_store_1",
    title: "Vintage Guitars Store",
    subtitle: "Instrumentos clássicos, raros e pedais de boutique com garantia.",
    coverUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?auto=format&fit=crop&q=80&w=1200",
    ctaLink: "/vendedor/u_store_1",
    badgeText: "Loja Oficial",
    badgeType: "store",
    rating: 4.8,
    city: "Curitiba",
    state: "PR",
    products: [
      { id: "bp5", title: "Gibson LP Custom '78", price: 29000, icon: "🎸" },
      { id: "bp6", title: "Taylor 214ce Deluxe", price: 9800, icon: "🔊" }
    ]
  }
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState<BannerData[]>(FALLBACK_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carrega banners reais do Firestore se existirem
  useEffect(() => {
    async function fetchRealBanners() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "banners"), where("active", "==", true), limit(10));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const list: BannerData[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              userId: data.userId || "",
              title: data.title || "Destaque",
              subtitle: data.subtitle || "",
              coverUrl: data.coverUrl || "",
              ctaLink: data.ctaLink || `/vendedor/${data.userId}`,
              badgeText: data.badgeText || "Parceiro",
              badgeType: data.badgeType || "premium",
              rating: data.rating || undefined,
              city: data.city || "",
              state: data.state || "",
              products: data.products || []
            });
          });
          setBanners(list);
        }
      } catch (err) {
        console.error("Erro ao ler banners do Firestore, usando mockups:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRealBanners();
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "luthier":
        return "bg-[#ef7c2c]/10 text-[#ef7c2c] border-[#ef7c2c]/20";
      case "teacher":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "store":
        return "bg-[#d4ae12]/10 text-[#d4ae12] border-[#d4ae12]/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "luthier":
        return <Wrench size={12} weight="fill" />;
      case "teacher":
        return <GraduationCap size={12} weight="fill" />;
      case "store":
        return <Storefront size={12} weight="fill" />;
      default:
        return <Crown size={12} weight="fill" />;
    }
  };

  if (banners.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[260px] sm:h-[220px] rounded-2xl overflow-hidden border border-[#22201e] shadow-2xl mb-8 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Carousel Track */}
      <div 
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ width: `${banners.length * 100}%`, transform: `translateX(-${(currentIndex * 100) / banners.length}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="h-full relative flex items-center px-6 sm:px-12"
            style={{ 
              width: `${100 / banners.length}%`,
              backgroundImage: `linear-gradient(rgba(11, 9, 8, 0.4), rgba(11, 9, 8, 0.4)), url(${banner.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Ambient Dark Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0908]/95 via-[#0b0908]/85 to-transparent z-10" />

            {/* Slide Content */}
            <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
              <div className="max-w-xl flex flex-col gap-2">
                <span className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(banner.badgeType)}`}>
                  {getBadgeIcon(banner.badgeType)}
                  {banner.badgeText}
                </span>
                
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-tight">
                  {banner.title}
                </h2>
                
                <p className="text-xs text-surface-300 leading-relaxed max-w-md hidden sm:block">
                  {banner.subtitle}
                </p>

                <div className="flex items-center gap-4 text-[10px] sm:text-xs text-surface-400 mt-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-[#ef7c2c]" />
                    {banner.city} - {banner.state}
                  </span>
                  {banner.rating && (
                    <span className="flex items-center gap-1">
                      <Star size={14} weight="fill" className="text-[#d4ae12]" />
                      {banner.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <a 
                  href={banner.ctaLink}
                  className="inline-flex items-center justify-center self-start mt-3 px-4 py-2 bg-white text-[#0b0908] text-xs font-bold rounded-lg border border-transparent hover:bg-transparent hover:text-white hover:border-white transition-all duration-300 cursor-pointer"
                >
                  Conhecer Parceiro
                </a>
              </div>

              {/* Showcase Products (Desktop only) */}
              {banner.products && banner.products.length > 0 && (
                <div className="hidden md:flex gap-3 max-w-[45%]">
                  {banner.products.map((prod) => (
                    <div 
                      key={prod.id}
                      className="bg-[#141211]/80 hover:bg-[#1c1a19]/90 border border-white/5 hover:border-[#ef7c2c]/30 p-3 rounded-xl flex flex-col gap-2 w-[120px] backdrop-blur-md transition-all duration-300 transform hover:translate-y-[-4px]"
                    >
                      <div className="h-10 w-full rounded-lg bg-[#22201e] flex items-center justify-center text-xl select-none">
                        {prod.icon}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-white font-bold truncate" title={prod.title}>
                          {prod.title}
                        </span>
                        <span className="text-[10px] text-[#ef7c2c] font-extrabold">
                          R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Only visible on hover) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#0b0908]/60 hover:bg-[#ef7c2c] text-white border border-white/10 hover:border-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 cursor-pointer"
            aria-label="Slide anterior"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#0b0908]/60 hover:bg-[#ef7c2c] text-white border border-white/10 hover:border-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 cursor-pointer"
            aria-label="Próximo slide"
          >
            <CaretRight size={16} weight="bold" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === index ? "w-6 bg-[#ef7c2c]" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
