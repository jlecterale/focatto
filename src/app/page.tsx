"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Wrench, 
  Tag, 
  Star, 
  Circle, 
  Compass,
  User,
  MagnifyingGlass,
  Faders,
  X,
  GraduationCap,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Phone,
  ChatCircleDots
} from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "../components/LoginModal";
import BannerCarousel from "../components/BannerCarousel";
import NotificationBell from "../components/NotificationBell";
import ChatHeaderButton from "../components/ChatHeaderButton";
import { ROLES, UserData } from "../lib/roles";
import { getUserData } from "../lib/userService";
import { createOrGetChat } from "../lib/chatService";
import { toast } from "sonner";

// Dynamically import the Map component to prevent SSR issues with Leaflet
const Map = dynamic(() => import("../Map"), { 
  ssr: false,
  loading: () => (
    <div className="h-[280px] md:h-[480px] w-full rounded-xl bg-surface-900/40 flex items-center justify-center border border-surface-800/60">
      <div className="flex flex-col items-center gap-3">
        <Circle size={28} className="animate-spin text-accent" />
        <p className="text-xs text-surface-400">Carregando mapa...</p>
      </div>
    </div>
  )
});

interface ItemLocation {
  id: string;
  userId?: string;
  title: string;
  city: string;
  state: string;
  neighborhood?: string;
  price?: number;
  type: "produto" | "luthier" | "teacher";
  rating?: number;
  specialties?: string[];
  photo?: string;
  category?: string;
  levels?: string[];
  modalities?: string[];
  targetAudience?: string[];
  omb?: string;
  phone?: string;
  bio?: string;
  premiumTier?: string;
  isPremium?: boolean;
}

const mockProducts: ItemLocation[] = [
  { id: "p1", title: "Gibson Les Paul Custom 1978", city: "São Paulo", state: "SP", neighborhood: "Pinheiros", price: 29000, type: "produto", category: "Guitarra", photo: "/gibson_les_paul.png", premiumTier: "tier1", isPremium: true, userId: "mock_seller_p1", phone: "11999999999" },
  { id: "p2", title: "Fender Stratocaster American Standard", city: "Curitiba", state: "PR", neighborhood: "Centro", price: 12500, type: "produto", category: "Guitarra", photo: "/fender_stratocaster.png", userId: "mock_seller_p2", phone: "41988888888" },
  { id: "p3", title: "Violão Taylor 214ce Deluxe", city: "Belo Horizonte", state: "MG", neighborhood: "Savassi", price: 9800, type: "produto", category: "Violão", photo: "/taylor_acoustic.png", premiumTier: "tier2", isPremium: true, userId: "mock_seller_p3", phone: "31977777777" },
  { id: "p4", title: "Cabo P10 Santo Angelo 5m", city: "São Paulo", state: "SP", neighborhood: "Vila Mariana", price: 150, type: "produto", category: "Acessório", userId: "mock_seller_p4", phone: "11966666666" },
  { id: "p5", title: "Palhetas Dunlop Tortex (Pacote)", city: "Rio de Janeiro", state: "RJ", neighborhood: "Copacabana", price: 75, type: "produto", category: "Acessório", userId: "mock_seller_p5", phone: "21955555555" },
  { id: "p6", title: "Pedal de Efeito Boss DS-1 Distortion", city: "São Paulo", state: "SP", neighborhood: "Pinheiros", price: 650, type: "produto", category: "Acessório", userId: "mock_seller_p6", phone: "11944444444" },
];

const mockLuthiers: ItemLocation[] = [
  { id: "l1", title: "Guthier Luteria", city: "São Paulo", state: "SP", neighborhood: "Pinheiros", type: "luthier", rating: 4.9, specialties: ["Regulagem", "Pintura"], premiumTier: "tier1", isPremium: true, userId: "l1", phone: "11999999999" },
  { id: "l2", title: "D'Alegria Custom Guitars", city: "Rio de Janeiro", state: "RJ", neighborhood: "Botafogo", type: "luthier", rating: 5.0, specialties: ["Construção", "Restauro"], userId: "l2", phone: "21988888888" },
  { id: "l3", title: "Luthieria do Sul", city: "Porto Alegre", state: "RS", neighborhood: "Moinhos de Vento", type: "luthier", rating: 4.8, specialties: ["Trastes", "Eletrônica"], userId: "l3", phone: "51977777777" },
];

const mockTeachers: ItemLocation[] = [
  { id: "t1", title: "João Silva - Aulas de Violão & Guitarra", city: "São Paulo", state: "SP", neighborhood: "Pinheiros", price: 80, type: "teacher", rating: 4.8, specialties: ["Violão", "Guitarra", "Teoria Musical"], levels: ["Iniciante", "Intermediário"], modalities: ["Presencial", "Online"], targetAudience: ["Crianças", "Adultos"], omb: "34.567-SP", bio: "Professor com mais de 10 anos de experiência didática no ensino de cordas.", phone: "11999999999", premiumTier: "tier1", isPremium: true },
  { id: "t2", title: "Aline Mendes - Técnica Vocal & Canto", city: "Rio de Janeiro", state: "RJ", neighborhood: "Copacabana", price: 120, type: "teacher", rating: 5.0, specialties: ["Canto / Técnica Vocal", "Teoria Musical"], levels: ["Iniciante", "Intermediário", "Avançado"], modalities: ["Online"], targetAudience: ["Adultos", "Melhor Idade"], omb: "21.904-RJ", bio: "Aulas focadas em fisiologia vocal, respiração, afinação e interpretação.", phone: "21988888888", premiumTier: "tier2", isPremium: true },
  { id: "t3", title: "Roberto K. - Aulas de Bateria", city: "Curitiba", state: "PR", neighborhood: "Centro", price: 90, type: "teacher", rating: 4.9, specialties: ["Bateria"], levels: ["Iniciante", "Intermediário", "Avançado"], modalities: ["Presencial"], targetAudience: ["Todas as idades"], bio: "Aprenda ritmos, rudimentos, leitura de partitura e grooves diversos.", phone: "41977777777" },
];

export default function HomePage() {
  const router = useRouter();
  const { user, userRole, loading: authLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<"produtos" | "luthiers" | "professores">("produtos");
  const [items, setItems] = useState<ItemLocation[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemLocation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<any | null>(null);
  const [showAnunciarModal, setShowAnunciarModal] = useState(false);
  const [adminPendingCount, setAdminPendingCount] = useState(0);

  useEffect(() => {
    if (!user || userRole !== "admin" || !db) {
      setAdminPendingCount(0);
      return;
    }

    const prodQ = query(collection(db, "products"), where("status", "==", "pending"));
    const verQ = query(collection(db, "verifications"), where("status", "==", "pending"));
    const luthQ = query(collection(db, "luthiers"), where("status", "==", "pending"));
    const teachQ = query(collection(db, "teachers"), where("status", "==", "pending"));

    let prodCount = 0;
    let verCount = 0;
    let luthCount = 0;
    let teachCount = 0;

    const updateCount = () => {
      setAdminPendingCount(prodCount + verCount + luthCount + teachCount);
    };

    const unsubProd = onSnapshot(prodQ, (snap) => {
      prodCount = snap.size;
      updateCount();
    }, () => {});

    const unsubVer = onSnapshot(verQ, (snap) => {
      verCount = snap.size;
      updateCount();
    }, () => {});

    const unsubLuth = onSnapshot(luthQ, (snap) => {
      luthCount = snap.size;
      updateCount();
    }, () => {});

    const unsubTeach = onSnapshot(teachQ, (snap) => {
      teachCount = snap.size;
      updateCount();
    }, () => {});

    return () => {
      unsubProd();
      unsubVer();
      unsubLuth();
      unsubTeach();
    };
  }, [user, userRole]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const uid = user.uid;
    async function loadProfile() {
      try {
        const data = await getUserData(uid);
        setProfile(data);
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
      }
    }
    loadProfile();
  }, [user]);

  const [selectedItemSeller, setSelectedItemSeller] = useState<UserData | null>(null);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedItemSeller(null);
      return;
    }
    if (selectedItem.type === "produto" && selectedItem.userId) {
      getUserData(selectedItem.userId)
        .then((data) => {
          setSelectedItemSeller(data);
        })
        .catch((err) => {
          console.error("Error fetching seller details:", err);
          setSelectedItemSeller(null);
        });
    } else {
      setSelectedItemSeller(null);
    }
  }, [selectedItem]);

  const handleStartChat = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    const targetUserId = selectedItem?.userId || selectedItemSeller?.uid;
    if (!targetUserId) {
      toast.error("Erro: Anunciante não encontrado.");
      return;
    }
    if (user.uid === targetUserId) {
      toast.error("Você não pode iniciar um chat com você mesmo.");
      return;
    }
    try {
      const sellerName = selectedItem?.type === "produto" 
        ? (selectedItemSeller?.displayName || "Anunciante") 
        : selectedItem?.title || "Anunciante";
      const sellerPhoto = selectedItem?.type === "produto"
        ? (selectedItemSeller?.photoURL || "")
        : selectedItem?.photo || "";
        
      const prodContext = selectedItem?.type === "produto" ? {
        id: selectedItem.id,
        title: selectedItem.title,
        photo: selectedItem.photo || ""
      } : undefined;

      const chatId = await createOrGetChat(
        user.uid,
        user.displayName || user.email || "Comprador",
        user.photoURL || "",
        targetUserId,
        sellerName,
        sellerPhoto,
        prodContext
      );

      router.push(`/chat?id=${chatId}`);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      toast.error("Erro ao iniciar chat interno.");
    }
  };

  // Sidebar Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"todas" | "instrumentos" | "acessorios" | "luthier" | "professor">("todas");
  const [quickPriceFilter, setQuickPriceFilter] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [searchRadius, setSearchRadius] = useState(false);
  const [sortBy, setSortBy] = useState<"priceAsc" | "priceDesc" | null>(null);
  const [viewMode, setViewMode] = useState<"photo" | "map">("photo");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "details">("list");

  // Handle dropdown category changes and sync with activeTab
  const handleCategoryChange = (cat: "todas" | "instrumentos" | "acessorios" | "luthier" | "professor") => {
    setSelectedCategory(cat);
    setMobileView("list");
    if (cat === "luthier") {
      setActiveTab("luthiers");
    } else if (cat === "professor") {
      setActiveTab("professores");
    } else {
      setActiveTab("produtos");
    }
  };

  // Sync tab clicks back to selectedCategory dropdown
  const handleTabChange = (tab: "produtos" | "luthiers" | "professores") => {
    setActiveTab(tab);
    setMobileView("list");
    if (tab === "produtos") {
      setSelectedCategory("todas");
    } else if (tab === "luthiers") {
      setSelectedCategory("luthier");
    } else {
      setSelectedCategory("professor");
    }
  };

  // Clear all filters helper
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("todas");
    setActiveTab("produtos");
    setQuickPriceFilter(null);
    setMinPrice("");
    setMaxPrice("");
    setStateFilter("");
    setCityFilter("");
    setNeighborhoodFilter("");
    setSortBy(null);
  };

  // Fetch data from Firestore with fallback to mocks
  useEffect(() => {
    async function fetchData() {
      if (!db) {
        const fallbacks = activeTab === "produtos" ? mockProducts : activeTab === "luthiers" ? mockLuthiers : mockTeachers;
        setItems(fallbacks);
        setSelectedItem(fallbacks[0] || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (activeTab === "produtos") {
          const q = query(collection(db, "products"), where("status", "==", "approved"), limit(10));
          const querySnapshot = await getDocs(q);
          const productsList: ItemLocation[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            productsList.push({
              id: doc.id,
              userId: data.userId || "",
              title: data.title || "Sem título",
              city: data.city || "São Paulo",
              state: data.state || "SP",
              neighborhood: data.neighborhood || data.bairro || "",
              price: data.price,
              type: "produto",
              category: data.category || "",
              photo: data.photo || (data.photos && data.photos[0]) || undefined,
              premiumTier: data.premiumTier || undefined,
              isPremium: data.isPremium || false,
            });
          });

          const finalProducts = productsList.length > 0 ? productsList : mockProducts;
          setItems(finalProducts);
          setSelectedItem(finalProducts[0] || null);
        } else if (activeTab === "luthiers") {
          const q = query(collection(db, "luthiers"), limit(10));
          const querySnapshot = await getDocs(q);
          const luthiersList: ItemLocation[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === "pending" || data.status === "rejected") {
              return;
            }
            luthiersList.push({
              id: doc.id,
              userId: doc.id,
              title: data.name || "Sem nome",
              city: data.city || "São Paulo",
              state: data.state || "SP",
              neighborhood: data.neighborhood || data.bairro || "",
              type: "luthier",
              rating: data.averageRating || 5.0,
              specialties: data.specialties || [],
              photo: data.photo,
              phone: data.phone || "",
              premiumTier: data.premiumTier || undefined,
              isPremium: data.isPremium || false,
            });
          });

          const finalLuthiers = luthiersList.length > 0 ? luthiersList : mockLuthiers;
          setItems(finalLuthiers);
          setSelectedItem(finalLuthiers[0] || null);
        } else {
          const q = query(collection(db, "teachers"), limit(10));
          const querySnapshot = await getDocs(q);
          const teachersList: ItemLocation[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === "pending" || data.status === "rejected") {
              return;
            }
            teachersList.push({
              id: doc.id,
              userId: doc.id,
              title: data.name || "Sem nome",
              city: data.city || "São Paulo",
              state: data.state || "SP",
              neighborhood: data.neighborhood || "",
              price: data.pricePerHour,
              type: "teacher",
              rating: data.rating || 5.0,
              specialties: data.specialties || [],
              photo: data.photoURL || undefined,
              levels: data.levels || [],
              modalities: data.modalities || [],
              targetAudience: data.targetAudience || [],
              omb: data.omb || "",
              phone: data.phone || "",
              bio: data.bio || "",
              premiumTier: data.premiumTier || undefined,
              isPremium: data.isPremium || false,
            });
          });

          const finalTeachers = teachersList.length > 0 ? teachersList : mockTeachers;
          setItems(finalTeachers);
          setSelectedItem(finalTeachers[0] || null);
        }
      } catch (err) {
        console.error("Error loading data from Firestore:", err);
        const fallbacks = activeTab === "produtos" ? mockProducts : activeTab === "luthiers" ? mockLuthiers : mockTeachers;
        setItems(fallbacks);
        setSelectedItem(fallbacks[0] || null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  // Client-side filtering and sorting
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query (checks title, city, state, neighborhood, and specialties)
      if (searchQuery.trim() !== "") {
        const queryText = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(queryText);
        const matchesCity = item.city.toLowerCase().includes(queryText);
        const matchesState = item.state.toLowerCase().includes(queryText);
        const matchesNeighborhood = (item.neighborhood || "").toLowerCase().includes(queryText);
        const matchesSpecialties = item.specialties?.some(s => s.toLowerCase().includes(queryText)) || false;
        
        if (!matchesTitle && !matchesCity && !matchesState && !matchesNeighborhood && !matchesSpecialties) {
          return false;
        }
      }

      // 2. Category Dropdown Filter
      if (item.type === "produto") {
        if (selectedCategory === "instrumentos") {
          // Exclude Accessory and Audio Equipment
          const isAccessory = item.category?.toLowerCase() === "acessório" || 
                              item.category?.toLowerCase() === "equipamento de áudio" || 
                              item.category?.toLowerCase() === "acessorio";
          if (isAccessory) return false;
        } else if (selectedCategory === "acessorios") {
          // Include only Accessory and Audio Equipment
          const isAccessory = item.category?.toLowerCase() === "acessório" || 
                              item.category?.toLowerCase() === "equipamento de áudio" || 
                              item.category?.toLowerCase() === "acessorio";
          if (!isAccessory) return false;
        }
      } else if (item.type === "luthier") {
        if (selectedCategory !== "luthier" && selectedCategory !== "todas") {
          return false;
        }
      } else if (item.type === "teacher") {
        if (selectedCategory !== "professor" && selectedCategory !== "todas") {
          return false;
        }
      }

      // 3. Price Filter (only for products and teachers)
      if (item.type === "produto" || item.type === "teacher") {
        const itemPrice = item.price || 0;
        
        // Quick Price Pill Filter
        if (quickPriceFilter !== null) {
          if (itemPrice > quickPriceFilter) return false;
        }

        // Min Price input
        if (minPrice.trim() !== "") {
          const minVal = parseFloat(minPrice);
          if (!isNaN(minVal) && itemPrice < minVal) return false;
        }

        // Max Price input
        if (maxPrice.trim() !== "") {
          const maxVal = parseFloat(maxPrice);
          if (!isNaN(maxVal) && itemPrice > maxVal) return false;
        }
      }

      // 4. Location: Estado
      if (stateFilter.trim() !== "") {
        if (item.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
      }

      // 5. Location: Município (Cidade)
      if (cityFilter.trim() !== "") {
        if (!item.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      }

      // 6. Location: Bairro
      if (neighborhoodFilter.trim() !== "") {
        const itemNeighborhood = item.neighborhood || "";
        if (!itemNeighborhood.toLowerCase().includes(neighborhoodFilter.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "priceAsc") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === "priceDesc") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0; // Default order
    });
  }, [items, searchQuery, selectedCategory, quickPriceFilter, minPrice, maxPrice, stateFilter, cityFilter, neighborhoodFilter, sortBy]);

  // Keep selectedItem in sync with filtered items
  useEffect(() => {
    if (filteredItems.length > 0) {
      if (!selectedItem || !filteredItems.some((item) => item.id === selectedItem.id)) {
        setSelectedItem(filteredItems[0]);
      }
    } else {
      setSelectedItem(null);
    }
    setViewMode("photo");
  }, [filteredItems, selectedItem]);

  const filterContent = (
    <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex flex-col gap-5 shadow-xl">
      
      {/* Search input with icon */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
          <MagnifyingGlass size={16} />
        </span>
        <input
          type="text"
          id="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ex: Fender, Gibson, Regulagem..."
          aria-label="Pesquisar por instrumentos, acessórios ou luthiers"
          className="w-full bg-[#181615] border border-[#2a2827] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]"
        />
      </div>

      {/* VER RESULTADOS DE */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category-select" className="text-[10px] font-bold uppercase tracking-wider text-[#ef7c2c] opacity-90">
          Ver resultados de:
        </label>
        <div className="relative">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as any)}
            className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-2.5 text-xs text-white outline-none appearance-none transition-all duration-200 focus:border-[#ef7c2c] cursor-pointer"
          >
            <option value="todas">🎸 Todas as Categorias</option>
            <option value="instrumentos">🎸 Instrumentos</option>
            <option value="acessorios">🔌 Acessórios</option>
            <option value="luthier">🛠️ Luthier</option>
            <option value="professor">🎓 Professor de Música</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-surface-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* OFERTAS RÁPIDAS */}
      {selectedCategory !== "luthier" && (
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
            Ofertas rápidas
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickPriceFilter(null)}
              id="quick-price-all"
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                quickPriceFilter === null
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] border-transparent text-white shadow-[0_2px_8px_rgba(239,124,44,0.25)]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              Todas as Ofertas
            </button>
            <button
              onClick={() => setQuickPriceFilter(1000)}
              id="quick-price-1000"
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                quickPriceFilter === 1000
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] border-transparent text-white shadow-[0_2px_8px_rgba(239,124,44,0.25)]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              Até R$ 1.000
            </button>
            <button
              onClick={() => setQuickPriceFilter(3000)}
              id="quick-price-3000"
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                quickPriceFilter === 3000
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] border-transparent text-white shadow-[0_2px_8px_rgba(239,124,44,0.25)]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              Até R$ 3.000
            </button>
            <button
              onClick={() => setQuickPriceFilter(5000)}
              id="quick-price-5000"
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                quickPriceFilter === 5000
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] border-transparent text-white shadow-[0_2px_8px_rgba(239,124,44,0.25)]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              Até R$ 5.000
            </button>
          </div>
        </div>
      )}

      <hr className="border-[#22201e]" />

      {/* PRICE MIN / MAX INPUTS */}
      {selectedCategory !== "luthier" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="min-price-input" className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
              Preço Mín. (R$)
            </label>
            <input
              type="number"
              id="min-price-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Mínimo"
              className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="max-price-input" className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
              Preço Máx. (R$)
            </label>
            <input
              type="number"
              id="max-price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Máximo"
              className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
            />
          </div>
        </div>
      )}

      {/* LOCALIZAÇÃO (Estado, Município, Bairro) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-surface-300 font-semibold text-xs">
          <MapPin size={14} className="text-[#ef7c2c]" />
          Localização
        </div>
        
        <label htmlFor="search-radius-checkbox" className="flex items-center gap-2 text-xs text-surface-400 select-none cursor-pointer">
          <input
            type="checkbox"
            id="search-radius-checkbox"
            checked={searchRadius}
            onChange={(e) => setSearchRadius(e.target.checked)}
            className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
          />
          Pesquisar por raio
        </label>

        <div className="flex flex-col gap-2.5">
          <input
            type="text"
            id="state-filter-input"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="Estado (Ex: SP, RJ, MG)"
            aria-label="Filtrar por Estado (UF)"
            className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2.5 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
          />
          <input
            type="text"
            id="city-filter-input"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Município (Cidade)"
            aria-label="Filtrar por Município (Cidade)"
            className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2.5 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
          />
          <input
            type="text"
            id="neighborhood-filter-input"
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            placeholder="Bairro"
            aria-label="Filtrar por Bairro"
            className="w-full bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2.5 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
          />
        </div>
      </div>

      <hr className="border-[#22201e]" />

      {/* ORDENAR POR PREÇO */}
      {selectedCategory !== "luthier" && (
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
            Ordenar por preço
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSortBy(sortBy === "priceAsc" ? null : "priceAsc")}
              id="sort-price-asc"
              className={`w-full py-2 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                sortBy === "priceAsc"
                  ? "bg-[#ef7c2c]/10 border-[#ef7c2c] text-[#ef7c2c]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              📈 Mais baixo
            </button>
            <button
              onClick={() => setSortBy(sortBy === "priceDesc" ? null : "priceDesc")}
              id="sort-price-desc"
              className={`w-full py-2 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                sortBy === "priceDesc"
                  ? "bg-[#ef7c2c]/10 border-[#ef7c2c] text-[#ef7c2c]"
                  : "bg-[#181615] border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30"
              }`}
            >
              📉 Mais caro
            </button>
          </div>
        </div>
      )}

      {/* LIMPAR FILTROS */}
      <button
        onClick={clearFilters}
        id="clear-filters-btn"
        className="w-full py-2.5 rounded-xl border border-[#2a2827] hover:border-[#ef7c2c] text-surface-400 hover:text-[#ef7c2c] text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        Limpar filtros
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans relative overflow-x-hidden">
      {/* Premium Top Glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,rgba(239,124,44,0.07),transparent_50%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <img 
              src="/focattolecter.png" 
              alt="Focattolecter Logo" 
              className="h-10 sm:h-14 md:h-20 w-auto object-contain invert brightness-110 mix-blend-screen" 
            />
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAnunciarModal(true)}
                  id="nav-anunciar"
                  className="flex items-center justify-center gap-1 h-9 w-9 sm:h-auto sm:w-auto sm:py-2.5 sm:px-4 rounded-full sm:rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-bold transition-all duration-200 hover:shadow-[0_4px_15px_rgba(239,124,44,0.4)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span className="hidden sm:inline">Anunciar</span>
                </button>
                {userRole === ROLES.ADMIN && (
                  <a
                    href="/admin"
                    id="nav-admin"
                    className="text-xs text-[#ef7c2c] hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#ef7c2c]/30 hover:border-[#ef7c2c]/60 flex items-center gap-1.5"
                  >
                    <span>Admin</span>
                    {adminPendingCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {adminPendingCount}
                      </span>
                    )}
                  </a>
                )}
                <ChatHeaderButton />
                <NotificationBell />
                <a
                  href="/profile"
                  id="nav-profile-link"
                  className="flex items-center gap-2 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm text-surface-300 hidden sm:block max-w-[120px] truncate group-hover:text-white transition-colors">
                    {user.displayName || user.email}
                  </span>
                </a>
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
                  onClick={() => setShowLogin(true)}
                  id="nav-anunciar-loggedout"
                  className="flex items-center justify-center gap-1 h-9 w-9 sm:h-auto sm:w-auto sm:py-2.5 sm:px-4 rounded-full sm:rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-bold transition-all duration-200 hover:shadow-[0_4px_15px_rgba(239,124,44,0.4)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span className="hidden sm:inline">Anunciar</span>
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  id="btn-login-modal-trigger"
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

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        
        <BannerCarousel />
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-3 mb-6 scrollbar-hide flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          <button
            onClick={() => handleTabChange("produtos")}
            id="tab-produtos"
            className={`flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0 whitespace-nowrap ${
              activeTab === "produtos" 
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-[0_4px_15px_rgba(239,124,44,0.25)] font-bold scale-[1.02]" 
                : "bg-[#181615] text-surface-400 hover:text-white border border-[#252322] hover:bg-[#201e1d]"
            }`}
          >
            <Tag size={14} weight={activeTab === "produtos" ? "fill" : "regular"} />
            <span className="sm:hidden">Instrumentos</span>
            <span className="hidden sm:inline">Instrumentos & Acessórios</span>
          </button>
          <button
            onClick={() => handleTabChange("luthiers")}
            id="tab-luthiers"
            className={`flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0 whitespace-nowrap ${
              activeTab === "luthiers" 
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-[0_4px_15px_rgba(239,124,44,0.25)] font-bold scale-[1.02]" 
                : "bg-[#181615] text-surface-400 hover:text-white border border-[#252322] hover:bg-[#201e1d]"
            }`}
          >
            <Wrench size={14} weight={activeTab === "luthiers" ? "fill" : "regular"} />
            <span className="sm:hidden">Luthiers</span>
            <span className="hidden sm:inline">Luthiers Especializados</span>
          </button>
          <button
            onClick={() => handleTabChange("professores")}
            id="tab-professores"
            className={`flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0 whitespace-nowrap ${
              activeTab === "professores" 
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-[0_4px_15px_rgba(239,124,44,0.25)] font-bold scale-[1.02]" 
                : "bg-[#181615] text-surface-400 hover:text-white border border-[#252322] hover:bg-[#201e1d]"
            }`}
          >
            <GraduationCap size={14} weight={activeTab === "professores" ? "fill" : "regular"} />
            <span className="sm:hidden">Professores</span>
            <span className="hidden sm:inline">Professores de Música</span>
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <button onClick={() => setShowMobileFilters(true)}
            id="mobile-filter-toggle"
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#181615] border border-[#2a2827] text-xs font-semibold text-surface-300 hover:text-white transition-all cursor-pointer"
          >
            <Faders size={14} />
            Filtros
          </button>
          {filteredItems.length > 0 && (
            <span className="text-[10px] text-surface-500">({filteredItems.length} resultados)</span>
          )}
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[380px] bg-[#0b0908] border-r border-[#22201e] p-6 overflow-y-auto animate-slide-right">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Filtros</h3>
                <button onClick={() => setShowMobileFilters(false)}
                  id="mobile-filter-close"
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-[#181615] transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}

        {/* Mobile View Toggle Bar */}
        <div className="md:hidden flex bg-[#141211] border border-[#22201e]/80 rounded-xl p-1.5 mb-6 gap-2">
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileView === "list"
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-md font-bold"
                : "text-surface-400 hover:text-white"
            }`}
          >
            <Tag size={14} />
            Lista ({filteredItems.length})
          </button>
          <button
            onClick={() => setMobileView("details")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileView === "details"
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-md font-bold"
                : "text-surface-400 hover:text-white"
            }`}
          >
            <Compass size={14} />
            <span className="sm:hidden">Detalhes</span>
            <span className="hidden sm:inline">Detalhes & Mapa</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Desktop */}
          <div className="hidden lg:block lg:col-span-3">
            {filterContent}
          </div>

          {/* Right Panel: Content Grid */}
          <div className="lg:col-span-9 grid md:grid-cols-12 gap-6">
            
            {/* Listings Panel */}
            <div className={`md:col-span-5 flex flex-col gap-4 min-w-0 ${mobileView !== "list" ? "hidden md:flex" : "flex"}`}>
              <div className="bg-[#141211] rounded-2xl p-3 sm:p-5 border border-[#22201e] flex flex-col gap-4 shadow-xl min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 font-body">
                    Resultados ({filteredItems.length})
                  </h3>
                  {loading && (
                    <Circle size={14} className="animate-spin text-[#ef7c2c]" />
                  )}
                </div>

                <div className="flex flex-col gap-3 max-h-[280px] sm:max-h-[360px] md:max-h-[420px] overflow-y-auto pr-1 scrollbar-thin min-w-0">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="shimmer h-[76px] rounded-xl border border-surface-800/50" />
                    ))
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => { setSelectedItem(item); setViewMode("photo"); setMobileView("details"); }}
                          className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-2 sm:gap-3 min-w-0 ${
                            isSelected
                              ? "bg-[#1d1b1a] border-[#ef7c2c] shadow-[0_0_12px_rgba(239,124,44,0.12)]"
                              : "bg-[#110f0e] border-[#1c1a19] hover:border-[#2a2827]"
                          }`}
                        >
                          {/* Photo / Fallback Thumbnail */}
                          <div className="h-12 w-12 rounded-lg bg-[#181615] border border-[#2a2827] flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {item.photo ? (
                              <img src={item.photo} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              item.type === "luthier" ? (
                                <Wrench size={20} className="text-[#ef7c2c]" />
                              ) : item.type === "teacher" ? (
                                <GraduationCap size={20} className="text-indigo-400" />
                              ) : (
                                <Tag size={20} className="text-[#d4ae12]" />
                              )
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white tracking-wide font-body flex items-center gap-1.5 min-w-0">
                              <span className="block truncate">{item.title}</span>
                              {item.omb && (
                                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold px-1.5 rounded uppercase tracking-wider flex-shrink-0" title={`Registro OMB: ${item.omb}`}>
                                  ★ OMB
                                </span>
                              )}
                              {item.premiumTier === "tier1" && (
                                <span className="bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/30 text-[9px] font-extrabold px-1.5 rounded uppercase tracking-wider flex-shrink-0">PRO</span>
                              )}
                              {item.premiumTier === "tier2" && (
                                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[9px] font-extrabold px-1.5 rounded uppercase tracking-wider flex-shrink-0">PLUS</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-surface-400 min-w-0">
                              <span className="flex items-center gap-1 font-medium min-w-0">
                                <MapPin size={10} className="text-[#8c8885] flex-shrink-0" />
                                <span className="block truncate">
                                  {item.city}, {item.state}
                                  {item.neighborhood ? ` (${item.neighborhood})` : ""}
                                </span>
                              </span>
                              {(item.type === "luthier" || item.type === "teacher") && item.rating && (
                                <span className="flex items-center gap-0.5 text-amber-400 font-semibold flex-shrink-0">
                                  <Star size={10} weight="fill" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            {(item.type === "luthier" || item.type === "teacher") && item.specialties && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.specialties.slice(0, 2).map((s, idx) => (
                                  <span key={idx} className={`text-[9px] px-1.5 py-0.2 rounded border ${
                                    item.type === "teacher"
                                      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                                      : "bg-[#221710] text-[#e67e22] border-[#3d2719]"
                                  }`}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price / Actions */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {(item.type === "produto" || item.type === "teacher") && item.price !== undefined && (
                              <span className="text-xs font-bold text-[#ef7c2c] whitespace-nowrap">
                                R$ {item.price.toLocaleString("pt-BR")}{item.type === "teacher" ? " / h" : ""}
                              </span>
                            )}
                            {item.type === "produto" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/anuncio/${item.id}`); }}
                                className="text-[9px] px-2 py-0.5 rounded border border-[#2a2827] text-surface-400 hover:text-white hover:border-[#ef7c2c] transition-all cursor-pointer"
                              >
                                Detalhes
                              </button>
                            )}
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#ef7c2c] shadow-[0_0_8px_#ef7c2c]" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-surface-400 text-center py-8 font-body">Nenhum resultado corresponde aos filtros.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`md:col-span-7 flex flex-col gap-4 min-w-0 ${mobileView !== "details" ? "hidden md:flex" : "flex"}`}>
              <div className="bg-[#141211] rounded-2xl p-3 sm:p-5 border border-[#22201e] flex flex-col gap-4 shadow-xl min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="md:hidden flex items-center justify-center p-2 rounded-lg bg-[#181615] border border-[#2a2827] text-white transition-all cursor-pointer"
                      title="Voltar para a lista"
                      aria-label="Voltar para a lista"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2 font-heading text-white">
                        {viewMode === "photo" ? (
                          <>
                            <Tag size={18} className="text-[#ef7c2c]" />
                            <span className="sm:hidden">Anúncio</span>
                            <span className="hidden sm:inline">Visualização do Anúncio</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={18} className="text-[#ef7c2c]" />
                            <span className="sm:hidden">Mapa</span>
                            <span className="hidden sm:inline">Mapa de Localização</span>
                          </>
                        )}
                      </h2>
                      <p className="text-xs text-surface-400 mt-0.5 font-body">
                        {viewMode === "photo" ? "Detalhes e foto do item selecionado" : "Visualização dinâmica com Leaflet"}
                      </p>
                    </div>
                  </div>
                  
                  {selectedItem && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === "photo" ? "map" : "photo")}
                        id="toggle-view-btn"
                        className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-[#181615] border border-[#2a2827] hover:border-[#ef7c2c] text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        {viewMode === "photo" ? (
                          <>
                            <MapPin size={14} className="text-[#ef7c2c]" />
                            Ver no Mapa
                          </>
                        ) : (
                          <>
                            <Tag size={14} className="text-[#d4ae12]" />
                            Ver Foto
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {selectedItem ? (
                  viewMode === "photo" ? (
                    <div className="flex flex-col gap-4">
                      {/* Photo Container */}
                      <div className="relative h-[220px] sm:h-[300px] md:h-[360px] w-full rounded-xl overflow-hidden bg-[#0d0b0a] border border-[#22201e] flex items-center justify-center">
                        {selectedItem.photo ? (
                          <img
                            src={selectedItem.photo}
                            alt={selectedItem.title}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-surface-500">
                            {selectedItem.type === "luthier" ? (
                              <Wrench size={48} className="text-[#ef7c2c]/40 animate-pulse" />
                            ) : selectedItem.type === "teacher" ? (
                              <GraduationCap size={48} className="text-indigo-400/40 animate-pulse" />
                            ) : (
                              <Tag size={48} className="text-[#d4ae12]/40 animate-pulse" />
                            )}
                            <span className="text-xs">Sem foto cadastrada</span>
                          </div>
                        )}
                        
                        {/* Location Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/5 flex items-center justify-between gap-3 text-white">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold truncate">{selectedItem.title}</p>
                            <p className="text-[10px] text-surface-300 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-[#ef7c2c] flex-shrink-0" />
                              <span className="truncate">{selectedItem.city}, {selectedItem.state}{selectedItem.neighborhood ? ` - ${selectedItem.neighborhood}` : ""}</span>
                            </p>
                          </div>
                          {(selectedItem.type === "produto" || selectedItem.type === "teacher") && selectedItem.price !== undefined && (
                            <span className="text-sm font-bold text-[#ef7c2c] whitespace-nowrap">
                              R$ {selectedItem.price.toLocaleString("pt-BR")}{selectedItem.type === "teacher" ? " / hora" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Text Info */}
                      <div className="p-4 rounded-xl bg-[#110f0e] border border-[#1c1a19] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded">
                            {selectedItem.type === "produto" ? "Produto / Instrumento" : selectedItem.type === "teacher" ? "Professor de Música" : "Luthier Especializado"}
                          </span>
                          {(selectedItem.type === "luthier" || selectedItem.type === "teacher") && selectedItem.rating && (
                            <span className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
                              <Star size={12} weight="fill" />
                              {selectedItem.rating.toFixed(1)} de 5.0
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white font-body mt-1">
                          {selectedItem.title}
                        </h3>
                        {(selectedItem.type === "luthier" || selectedItem.type === "teacher") && selectedItem.specialties && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            <span className="text-[10px] font-bold text-surface-400">Especialidades:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedItem.specialties.map((s, idx) => (
                                <span key={idx} className={`text-[10px] border px-2.5 py-0.5 rounded ${
                                  selectedItem.type === "teacher"
                                    ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                                    : "bg-[#221710] text-[#e67e22] border-[#3d2719]"
                                }`}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedItem.type === "teacher" && (
                          <>
                            {selectedItem.modalities && selectedItem.modalities.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-surface-400">Modalidades:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedItem.modalities.map((m, idx) => (
                                    <span key={idx} className="text-[10px] bg-surface-800 text-surface-300 px-2.5 py-0.5 rounded border border-surface-700">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedItem.levels && selectedItem.levels.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-surface-400">Níveis atendidos:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedItem.levels.map((l, idx) => (
                                    <span key={idx} className="text-[10px] bg-surface-800 text-surface-300 px-2.5 py-0.5 rounded border border-surface-700">
                                      {l}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedItem.targetAudience && selectedItem.targetAudience.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-surface-400">Público-Alvo Atendido:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedItem.targetAudience.map((audience, idx) => (
                                    <span key={idx} className="text-[10px] bg-surface-800 text-surface-300 px-2.5 py-0.5 rounded border border-surface-700">
                                      {audience}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedItem.omb && (
                              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-amber-300">
                                <div className="h-7 w-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 text-amber-400">
                                  <ShieldCheck size={16} weight="fill" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold uppercase tracking-wider">Membro da Ordem dos Músicos</p>
                                  <p className="text-xs text-amber-400/90 truncate font-semibold">Reg. OMB: {selectedItem.omb}</p>
                                </div>
                              </div>
                            )}
                            {selectedItem.bio && (
                              <div className="flex flex-col gap-1 mt-2">
                                <span className="text-[10px] font-bold text-surface-400">Sobre as Aulas:</span>
                                <p className="text-xs text-surface-300 font-body leading-relaxed">
                                  {selectedItem.bio}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                        {(selectedItem.phone || selectedItemSeller?.phone) && (
                          <div className="flex flex-col gap-2 mt-3">
                            {/* WhatsApp Button */}
                            <a
                              href={`https://wa.me/55${(selectedItem.phone || selectedItemSeller?.phone || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-emerald-600/20 w-full"
                            >
                              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.888-9.886.002-5.48-4.421-9.929-9.893-9.929-5.462 0-9.898 4.438-9.9 9.888-.001 2.124.6 3.736 1.597 5.4l-.994 3.635 3.737-.98c.002.001.002.001.002.001zm10.292-6.568c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.667.149-.198.297-.766.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.174.2-.298.3-.496.099-.198.05-.371-.025-.52-.075-.149-.667-1.61-.915-2.203-.242-.579-.487-.501-.667-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                              </svg>
                              Falar no WhatsApp
                            </a>

                            {/* Direct Call Button */}
                            <a
                              href={`tel:${(selectedItem.phone || selectedItemSeller?.phone || "").replace(/\D/g, "")}`}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-600/20 w-full"
                            >
                              <Phone size={16} weight="fill" />
                              Ligar para Anunciante
                            </a>

                            {/* Internal Chat Button */}
                            {(!user || user.uid !== (selectedItem.userId || selectedItemSeller?.uid)) && (
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
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => router.push(`/anuncio/${selectedItem.id}`)}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold transition-all hover:shadow-[0_4px_15px_rgba(239,124,44,0.3)] cursor-pointer"
                          >
                            Ver Anúncio Completo
                          </button>
                        </div>
                        <p className="text-xs text-surface-400 font-body leading-relaxed mt-2">
                          <span className="sm:hidden">Clique em <strong className="text-white">Ver no Mapa</strong> para ver a localização.</span>
                          <span className="hidden sm:inline">Clique em <strong className="text-white">Ver no Mapa</strong> acima para visualizar a localização geográfica do anunciante em tempo real no mapa dinâmico.</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Map
                      city={selectedItem.city}
                      state={selectedItem.state}
                      popupText={
                        selectedItem.type === "produto" 
                          ? `${selectedItem.title} - R$ ${selectedItem.price?.toLocaleString("pt-BR")}`
                          : selectedItem.type === "teacher"
                            ? `${selectedItem.title} - Aula (${selectedItem.rating?.toFixed(1)} ★) - R$ ${selectedItem.price?.toLocaleString("pt-BR")}/h`
                            : `${selectedItem.title} - Luthier (${selectedItem.rating?.toFixed(1)} ★)`
                      }
                      zoom={12}
                      className="h-[280px] md:h-[480px] w-full rounded-xl overflow-hidden shadow-inner border border-[#282523]"
                    />
                  )
                ) : (
                  <div className="h-[280px] md:h-[480px] w-full rounded-xl bg-[#0e0d0c] flex items-center justify-center border border-[#1f1d1c]">
                    <p className="text-sm text-surface-400 font-body">Nenhum item selecionado</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Selection Modal for Anunciar */}
      {showAnunciarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e0c0b] border border-[#2a2827] rounded-3xl shadow-2xl p-6 relative overflow-hidden">
            {/* Ambient background glow inside modal */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[radial-gradient(circle,rgba(239,124,44,0.1),transparent_60%)] pointer-events-none" />
            
            <button
              onClick={() => setShowAnunciarModal(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-surface-400 hover:text-white hover:bg-[#1c1a19] transition-all cursor-pointer"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-white font-heading">O que você deseja anunciar?</h2>
              <p className="text-xs text-surface-400 mt-1">Escolha a categoria ideal para o seu anúncio</p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Instrument & Accessory */}
              <div
                onClick={() => {
                  setShowAnunciarModal(false);
                  router.push("/meus-anuncios");
                }}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-[#141211] border border-[#22201e] hover:border-[#ef7c2c]/40 hover:bg-[#1c1a19] cursor-pointer transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 group-hover:scale-110 transition-transform">
                  <Tag size={20} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#ef7c2c] transition-colors">Instrumento ou Acessório</h4>
                  <p className="text-[11px] text-surface-400 mt-0.5 leading-relaxed">Venda guitarras, baixos, pedais, amplificadores ou outros acessórios.</p>
                </div>
              </div>

              {/* Option 2: Luthier */}
              <div
                onClick={async () => {
                  setShowAnunciarModal(false);
                  if (profile?.isProfessional) {
                    router.push("/profile");
                    toast.success("Habilitado! Edite seu Perfil de Luthier na página de perfil.");
                  } else {
                    const confirmActivate = window.confirm("Seu perfil de Luthier não está ativo. Deseja ir para seu perfil para ativar as atividades de Luthier?");
                    if (confirmActivate) {
                      router.push("/profile");
                    }
                  }
                }}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-[#141211] border border-[#22201e] hover:border-[#ef7c2c]/40 hover:bg-[#1c1a19] cursor-pointer transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 group-hover:scale-110 transition-transform">
                  <Wrench size={20} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#ef7c2c] transition-colors">Luthier Especializado</h4>
                  <p className="text-[11px] text-surface-400 mt-0.5 leading-relaxed">Ofereça serviços de regulagem, customização, elétrica e reparo de instrumentos.</p>
                </div>
              </div>

              {/* Option 3: Teacher */}
              <div
                onClick={async () => {
                  setShowAnunciarModal(false);
                  if (profile?.isTeacher) {
                    router.push("/profile");
                    toast.success("Habilitado! Edite seu Perfil de Professor na página de perfil.");
                  } else {
                    const confirmActivate = window.confirm("Seu perfil de Professor não está ativo. Deseja ir para seu perfil para ativar as atividades de Professor?");
                    if (confirmActivate) {
                      router.push("/profile");
                    }
                  }
                }}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-[#141211] border border-[#22201e] hover:border-indigo-500/40 hover:bg-[#1c1a19] cursor-pointer transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <GraduationCap size={20} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Professor de Música</h4>
                  <p className="text-[11px] text-surface-400 mt-0.5 leading-relaxed">Ofereça aulas particulares ou online, divulgue suas especialidades e encontre alunos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1c1a19]/60 mt-12 sm:mt-16 py-6 sm:py-8 text-center text-xs text-surface-500 font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a href="/termos" id="footer-link-termos" className="hover:text-surface-300 transition-colors">
              Termos de Uso
            </a>
            <a href="/cookies" id="footer-link-cookies" className="hover:text-surface-300 transition-colors">
              Política de Cookies
            </a>
            <a href="/plans" id="footer-link-plans" className="hover:text-surface-300 transition-colors">
              Planos de Assinatura
            </a>
            <a href="/suporte" id="footer-link-suporte" className="hover:text-surface-300 transition-colors">
              Contato de Suporte
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} Focattolecter. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
