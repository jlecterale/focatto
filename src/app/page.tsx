"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Wrench, 
  Tag, 
  Star, 
  Circle, 
  Compass 
} from "@phosphor-icons/react";

// Dynamically import the Map component to prevent SSR issues with Leaflet
const Map = dynamic(() => import("../Map"), { 
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-xl bg-surface-900/40 flex items-center justify-center border border-surface-800/60">
      <div className="flex flex-col items-center gap-3">
        <Circle size={28} className="animate-spin text-accent" />
        <p className="text-xs text-surface-400">Carregando mapa...</p>
      </div>
    </div>
  )
});

interface ItemLocation {
  id: string;
  title: string;
  city: string;
  state: string;
  price?: number;
  type: "produto" | "luthier";
  rating?: number;
  specialties?: string[];
  photo?: string;
}

const mockProducts: ItemLocation[] = [
  { id: "p1", title: "Gibson Les Paul Custom 1978", city: "São Paulo", state: "SP", price: 29000, type: "produto" },
  { id: "p2", title: "Fender Stratocaster American Standard", city: "Curitiba", state: "PR", price: 12500, type: "produto" },
  { id: "p3", title: "Violão Taylor 214ce Deluxe", city: "Belo Horizonte", state: "MG", price: 9800, type: "produto" },
];

const mockLuthiers: ItemLocation[] = [
  { id: "l1", title: "Guthier Luteria", city: "São Paulo", state: "SP", type: "luthier", rating: 4.9, specialties: ["Regulagem", "Pintura"] },
  { id: "l2", title: "D'Alegria Custom Guitars", city: "Rio de Janeiro", state: "RJ", type: "luthier", rating: 5.0, specialties: ["Construção", "Restauro"] },
  { id: "l3", title: "Luthieria do Sul", city: "Porto Alegre", state: "RS", type: "luthier", rating: 4.8, specialties: ["Trastes", "Eletrônica"] },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"produtos" | "luthiers">("produtos");
  const [items, setItems] = useState<ItemLocation[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemLocation | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore with fallback to mocks
  useEffect(() => {
    async function fetchData() {
      if (!db) {
        const fallbacks = activeTab === "produtos" ? mockProducts : mockLuthiers;
        setItems(fallbacks);
        setSelectedItem(fallbacks[0] || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (activeTab === "produtos") {
          const q = query(collection(db, "products"), where("status", "==", "active"), limit(10));
          const querySnapshot = await getDocs(q);
          const productsList: ItemLocation[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            productsList.push({
              id: doc.id,
              title: data.title || "Sem título",
              city: data.city || "São Paulo",
              state: data.state || "SP",
              price: data.price,
              type: "produto",
            });
          });

          const finalProducts = productsList.length > 0 ? productsList : mockProducts;
          setItems(finalProducts);
          setSelectedItem(finalProducts[0] || null);
        } else {
          const q = query(collection(db, "luthiers"), limit(10));
          const querySnapshot = await getDocs(q);
          const luthiersList: ItemLocation[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            luthiersList.push({
              id: doc.id,
              title: data.name || "Sem nome",
              city: data.city || "São Paulo",
              state: data.state || "SP",
              type: "luthier",
              rating: data.averageRating || 5.0,
              specialties: data.specialties || [],
              photo: data.photo,
            });
          });

          const finalLuthiers = luthiersList.length > 0 ? luthiersList : mockLuthiers;
          setItems(finalLuthiers);
          setSelectedItem(finalLuthiers[0] || null);
        }
      } catch (err) {
        console.error("Error loading data from Firestore:", err);
        const fallbacks = activeTab === "produtos" ? mockProducts : mockLuthiers;
        setItems(fallbacks);
        setSelectedItem(fallbacks[0] || null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans relative overflow-x-hidden">
      {/* Premium Top Glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,rgba(239,124,44,0.07),transparent_50%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center shadow-lg">
              <Compass size={22} weight="bold" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading m-0 flex items-center gap-2 text-white">
                Focatto
              </h1>
              <p className="text-[11px] text-surface-400 mt-0.5">
                Marketplace de Instrumentos Musicais
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab("produtos")}
            className={`flex items-center gap-2 py-2.5 px-5 text-xs font-semibold rounded-xl transition-all duration-300 ${
              activeTab === "produtos" 
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-[0_4px_15px_rgba(239,124,44,0.25)] font-bold scale-[1.02]" 
                : "bg-[#181615] text-surface-400 hover:text-white border border-[#252322] hover:bg-[#201e1d]"
            }`}
          >
            <Tag size={14} weight={activeTab === "produtos" ? "fill" : "regular"} />
            Instrumentos & Acessórios
          </button>
          <button
            onClick={() => setActiveTab("luthiers")}
            className={`flex items-center gap-2 py-2.5 px-5 text-xs font-semibold rounded-xl transition-all duration-300 ${
              activeTab === "luthiers" 
                ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-[0_4px_15px_rgba(239,124,44,0.25)] font-bold scale-[1.02]" 
                : "bg-[#181615] text-surface-400 hover:text-white border border-[#252322] hover:bg-[#201e1d]"
            }`}
          >
            <Wrench size={14} weight={activeTab === "luthiers" ? "fill" : "regular"} />
            Luthiers Especializados
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Explorer & Listing */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* List Container */}
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 font-body">
                  Resultados ({items.length})
                </h3>
                {loading && (
                  <Circle size={14} className="animate-spin text-[#ef7c2c]" />
                )}
              </div>

              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="shimmer h-[76px] rounded-xl border border-surface-800/50" />
                  ))
                ) : items.length > 0 ? (
                  items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#1d1b1a] border-[#ef7c2c] shadow-[0_0_12px_rgba(239,124,44,0.12)]"
                            : "bg-[#110f0e] border-[#1c1a19] hover:border-[#2a2827]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white tracking-wide font-body">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin size={12} className="text-[#8c8885]" />
                              {item.city}, {item.state}
                            </span>
                            {item.type === "luthier" && item.rating && (
                              <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                                <Star size={12} weight="fill" />
                                {item.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {item.type === "luthier" && item.specialties && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.specialties.map((s, idx) => (
                                <span key={idx} className="text-[10px] bg-[#221710] text-[#e67e22] border border-[#3d2719] px-1.5 py-0.5 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.type === "produto" && item.price !== undefined && (
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#ef7c2c]">
                                R$ {item.price.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          )}
                          
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-[#ef7c2c] shadow-[0_0_8px_#ef7c2c]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-surface-400 text-center py-8 font-body">Nenhum resultado cadastrado.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Panel: Leaflet Map */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2 font-heading text-white">
                    <MapPin size={18} className="text-[#ef7c2c]" />
                    Mapa de Localização
                  </h2>
                  <p className="text-xs text-surface-400 mt-0.5 font-body">
                    Visualização dinâmica com Leaflet
                  </p>
                </div>
                {selectedItem && (
                  <span className="text-xs font-semibold text-[#ef7c2c]">
                    {selectedItem.city}, {selectedItem.state}
                  </span>
                )}
              </div>

              {selectedItem ? (
                <Map
                  city={selectedItem.city}
                  state={selectedItem.state}
                  popupText={
                    selectedItem.type === "produto" 
                      ? `${selectedItem.title} - R$ ${selectedItem.price?.toLocaleString("pt-BR")}`
                      : `${selectedItem.title} - Luthier (${selectedItem.rating?.toFixed(1)} ★)`
                  }
                  zoom={12}
                  className="h-[480px] w-full rounded-xl overflow-hidden shadow-inner border border-[#282523]"
                />
              ) : (
                <div className="h-[480px] w-full rounded-xl bg-[#0e0d0c] flex items-center justify-center border border-[#1f1d1c]">
                  <p className="text-sm text-surface-400 font-body">Nenhum item selecionado</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c1a19]/60 mt-16 py-6 text-center text-xs text-surface-500 font-body">
        <p>&copy; {new Date().getFullYear()} Focatto. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
