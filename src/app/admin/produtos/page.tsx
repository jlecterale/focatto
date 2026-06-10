"use client";

import { useState, useEffect } from "react";
import AdminGuard from "../../../components/admin/AdminGuard";
import { useAuth } from "../../../contexts/AuthContext";
import { getPendingProducts, getAllProducts, reviewProduct } from "../../../lib/productService";
import type { ProductData } from "../../../lib/roles";
import Link from "next/link";
import {
  Compass, SignOut, CheckCircle, XCircle, Clock, Package, Spinner, ArrowLeft, CurrencyDollar,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import NotificationBell from "../../../components/NotificationBell";

export default function AdminProdutosPage() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadProducts();
  }, [filter]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = filter === "pending" ? await getPendingProducts() : await getAllProducts();
      setProducts(data);
    } catch {
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(productId: string, status: "approved" | "rejected") {
    if (!user) return;
    setReviewingId(productId);
    try {
      await reviewProduct(productId, status, adminNotes, user.uid);
      toast.success(`Produto ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso!`);
      setAdminNotes("");
      loadProducts();
    } catch {
      toast.error("Erro ao processar produto.");
    } finally {
      setReviewingId(null);
    }
  }

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
        <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/admin" id="admin-products-back-btn" className="text-surface-400 hover:text-white transition-colors flex-shrink-0">
                <ArrowLeft size={18} />
              </Link>
              <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center flex-shrink-0">
                <Compass size={18} weight="bold" className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white truncate">Produtos / Anúncios</h1>
                <p className="text-[10px] text-surface-400 hidden sm:block">Revise anúncios de usuários</p>
              </div>
            </div>
            <NotificationBell />
            <button onClick={logout}
              id="admin-products-logout-btn"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
            >
              <SignOut size={14} /> Sair
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setFilter("pending")}
              id="filter-pending-btn"
              className={`text-xs font-semibold py-2 px-4 rounded-xl transition-all ${
                filter === "pending"
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white"
                  : "bg-[#181615] text-surface-400 border border-[#2a2827]"
              }`}
            >
              Pendentes
            </button>
            <button onClick={() => setFilter("all")}
              id="filter-all-btn"
              className={`text-xs font-semibold py-2 px-4 rounded-xl transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white"
                  : "bg-[#181615] text-surface-400 border border-[#2a2827]"
              }`}
            >
              Todos
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size={24} className="animate-spin text-[#ef7c2c]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-surface-500 mb-3" />
              <p className="text-surface-400 text-sm">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate">{product.title}</h3>
                      <p className="text-xs text-surface-400">
                        {product.userName} &middot; {product.userEmail}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {product.city}, {product.state} &middot; {product.category}
                        {product.price ? ` &middot; R$ ${product.price.toLocaleString("pt-BR")}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ml-3 ${
                      product.status === "pending"
                        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                        : product.status === "approved"
                          ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                          : "bg-red-400/10 text-red-400 border border-red-400/20"
                    }`}>
                      {product.status === "pending" ? "Pendente" : product.status === "approved" ? "Aprovado" : "Rejeitado"}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">{product.description}</p>
                  )}

                  {product.photos && product.photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {product.photos.map((photo, idx) => (
                        <a key={idx} href={photo} target="_blank" rel="noopener noreferrer"
                          className="h-24 w-24 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden flex-shrink-0 hover:border-[#ef7c2c]/30 transition-colors"
                        >
                          <img src={photo} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {product.status === "pending" && (
                    <div className="space-y-3 pt-2 border-t border-[#22201e]">
                      <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Observações (opcional)..."
                        id={`admin-notes-prod-${product.id}`}
                        aria-label="Observações do administrador para aprovação ou rejeição do produto"
                        rows={2} className={inputBase}
                      />
                      <div className="flex gap-3">
                        <button onClick={() => handleReview(product.id!, "approved")}
                          disabled={reviewingId === product.id}
                          id={`approve-prod-${product.id}`}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {reviewingId === product.id ? <Spinner size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Aprovar
                        </button>
                        <button onClick={() => handleReview(product.id!, "rejected")}
                          disabled={reviewingId === product.id}
                          id={`reject-prod-${product.id}`}
                          className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {reviewingId === product.id ? <Spinner size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  )}

                  {product.status !== "pending" && product.adminNotes && (
                    <div className="pt-2 border-t border-[#22201e]">
                      <p className="text-xs text-surface-400">
                        <span className="text-surface-500">Observações:</span> {product.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
