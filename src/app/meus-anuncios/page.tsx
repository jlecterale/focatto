"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserData } from "../../lib/userService";
import { createProduct, getUserProducts } from "../../lib/productService";
import type { ProductData } from "../../lib/roles";
import Link from "next/link";
import {
  Compass, SignOut, Package, Plus, Spinner, ArrowLeft, Clock, CheckCircle, XCircle,
  MapPin, CurrencyDollar, Tag, FileImage, Trash,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const CATEGORIES = [
  "Guitarra", "Violão", "Baixo", "Bateria", "Teclado", "Saxofone", "Violino",
  "Acessório", "Equipamento de Áudio", "Outro",
];

const CONDITIONS = ["Novo", "Como novo", "Excelente", "Bom", "Regular", "Para peças"];

export default function MeusAnunciosPage() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    loadProducts();
  }, [user]);

  async function loadProducts() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserProducts(user.uid);
      setProducts(data);
    } catch {
      toast.error("Erro ao carregar anúncios.");
    } finally {
      setLoading(false);
    }
  }

  function handlePhotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 6);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!user) return;
    if (!title.trim()) { toast.error("Título é obrigatório."); return; }
    if (!price || Number(price) <= 0) { toast.error("Preço inválido."); return; }
    if (!city.trim() || !state.trim()) { toast.error("Cidade e estado são obrigatórios."); return; }

    setSubmitting(true);
    try {
      const profile = await getUserData(user.uid);
      await createProduct(
        user.uid,
        user.email || "",
        profile?.displayName || user.displayName || "Usuário",
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition,
          city: city.trim(),
          state: state.trim(),
        },
        photos,
      );
      toast.success("Anúncio enviado para aprovação!");
      setShowForm(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory(CATEGORIES[0]);
      setCondition(CONDITIONS[0]);
      setCity("");
      setState("");
      setPhotos([]);
      setPhotoPreviews([]);
      loadProducts();
    } catch {
      toast.error("Erro ao criar anúncio.");
    } finally {
      setSubmitting(false);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold"><CheckCircle size={12} weight="fill" /> Aprovado</span>;
      case "rejected":
        return <span className="flex items-center gap-1 text-xs text-red-400 font-semibold"><XCircle size={12} weight="fill" /> Reprovado</span>;
      default:
        return <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold"><Clock size={12} weight="fill" /> Pendente</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <p className="text-surface-400">Faça login para gerenciar seus anúncios.</p>
      </div>
    );
  }

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" id="announcements-back-btn" className="text-surface-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center">
              <Compass size={20} weight="bold" className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Meus Anúncios</h1>
              <p className="text-[10px] text-surface-400">Gerencie seus produtos cadastrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(true)}
              id="announcements-create-modal-trigger"
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold transition-all hover:shadow-[0_4px_15px_rgba(239,124,44,0.3)]"
            >
              <Plus size={14} /> Novo Anúncio
            </button>
            <button onClick={logout}
              id="announcements-logout-btn"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#2a2827]"
            >
              <SignOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Product Creation Form */}
        {showForm && (
          <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400">Criar Anúncio</h2>
              <button onClick={() => setShowForm(false)}
                id="announcements-close-form-btn"
                aria-label="Fechar formulário de anúncio"
                className="text-surface-400 hover:text-white"
              >
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-surface-500 -mt-2">Seu anúncio será analisado e aprovado por nossa equipe antes de ficar visível.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="announcement-title-input" className="block text-xs text-surface-400 mb-1.5">Título do anúncio *</label>
                <input type="text" id="announcement-title-input" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fender Stratocaster 2022"
                  className={inputBase}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="announcement-description-textarea" className="block text-xs text-surface-400 mb-1.5">Descrição</label>
                <textarea id="announcement-description-textarea" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o produto, estado, motivo da venda..."
                  rows={3} className={`${inputBase} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="announcement-price-input" className="block text-xs text-surface-400 mb-1.5">Preço (R$) *</label>
                <input type="number" id="announcement-price-input" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="10000"
                  className={inputBase}
                />
              </div>

              <div>
                <label htmlFor="announcement-category-select" className="block text-xs text-surface-400 mb-1.5">Categoria</label>
                <select id="announcement-category-select" value={category} onChange={(e) => setCategory(e.target.value)} className={inputBase}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="announcement-condition-select" className="block text-xs text-surface-400 mb-1.5">Estado do produto</label>
                <select id="announcement-condition-select" value={condition} onChange={(e) => setCondition(e.target.value)} className={inputBase}>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="announcement-city-input" className="block text-xs text-surface-400 mb-1.5">Cidade *</label>
                <input type="text" id="announcement-city-input" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className={inputBase}
                />
              </div>

              <div>
                <label htmlFor="announcement-state-input" className="block text-xs text-surface-400 mb-1.5">Estado (UF) *</label>
                <input type="text" id="announcement-state-input" value={state} onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  className={inputBase}
                />
              </div>

              {/* Photos */}
              <div className="sm:col-span-2">
                <label htmlFor="announcement-photos-input" className="block text-xs text-surface-400 mb-1.5">Fotos (máx. 6)</label>
                <div className="flex flex-wrap gap-2">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-xl border border-[#2a2827] overflow-hidden">
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center"
                      >
                        <Trash size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <button onClick={() => photoInputRef.current?.click()}
                      id="announcement-photos-trigger-btn"
                      aria-label="Adicionar fotos"
                      className="h-20 w-20 rounded-xl border-2 border-dashed border-[#2a2827] bg-[#181615] flex items-center justify-center text-surface-400 hover:border-[#ef7c2c]/50 transition-colors"
                    >
                      <FileImage size={20} />
                    </button>
                  )}
                </div>
                <input ref={photoInputRef} id="announcement-photos-input" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosSelect} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              id="announcements-submit-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner size={16} className="animate-spin" /> : null}
              Enviar para Aprovação
            </button>
          </div>
        )}

        {/* My Products List */}
        <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400">Meus Anúncios ({products.length})</h2>
            {loading && <Spinner size={14} className="animate-spin text-[#ef7c2c]" />}
          </div>

          {products.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-surface-500 mb-3" />
              <p className="text-sm text-surface-400">Você ainda não tem anúncios.</p>
              <button onClick={() => setShowForm(true)}
                id="announcements-create-first-btn"
                className="mt-3 py-2 px-4 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold"
              >
                Criar primeiro anúncio
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id}
                  className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white">{product.title}</h3>
                      <p className="text-xs text-surface-400 mt-0.5">
                        <MapPin size={10} className="inline mr-0.5" />
                        {product.city}, {product.state}
                        {product.price ? ` | R$ ${product.price.toLocaleString("pt-BR")}` : ""}
                      </p>
                    </div>
                    {statusBadge(product.status)}
                  </div>
                  {product.adminNotes && product.status === "rejected" && (
                    <p className="text-xs text-red-400/80 bg-red-400/5 rounded-lg p-2 border border-red-400/10">
                      Motivo: {product.adminNotes}
                    </p>
                  )}
                  {product.photos && product.photos.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto">
                      {product.photos.map((photo, idx) => (
                        <img key={idx} src={photo} alt=""
                          className="h-14 w-14 rounded-lg object-cover border border-[#2a2827] flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
