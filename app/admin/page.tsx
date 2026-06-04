"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getPendingProducts, moderateProduct } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !profile?.isAdmin)) {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    getPendingProducts()
      .then(setProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleModerate = async (id: string, status: "active" | "inactive") => {
    try {
      await moderateProduct(id, status);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Anúncio ${status === "active" ? "aprovado" : "rejeitado"}`);
    } catch {
      toast.error("Erro ao moderar anúncio");
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <ShieldCheck size={22} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold">Moderação de Anúncios</h1>
          <p className="text-sm text-surface-400">
            {products.length} anúncio{products.length !== 1 ? "s" : ""} pendente{products.length !== 1 ? "s" : ""} de aprovação
          </p>
        </div>
      </div>

      {loadingProducts ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Nenhum anúncio pendente</p>
          <p className="text-sm mt-1">Todos os anúncios foram moderados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} padding="md" hover={false}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-800 flex-shrink-0">
                  {product.images?.[0]?.thumb ? (
                    <img src={product.images[0].thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-surface-600 font-heading text-xl">F</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">
                      <Clock size={10} />
                      Pendente
                    </Badge>
                    <ConditionBadge condition={product.condition} />
                  </div>
                  <h3 className="font-medium truncate">{product.title}</h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {product.brand} {product.model} • {formatCurrency(product.price)} • {product.city}, {product.state}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Vendido por {product.sellerName} • {formatDate(product.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleModerate(product.id, "active")}
                    className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    title="Aprovar"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleModerate(product.id, "inactive")}
                    className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                    title="Rejeitar"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
