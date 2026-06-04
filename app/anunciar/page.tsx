"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product/ProductForm";
import { useAuth } from "@/hooks/useAuth";
import { createProduct, uploadProductImages } from "@/lib/db";
import { toast } from "sonner";

export default function AnunciarPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !profile) {
      router.push("/?login=true");
    }
  }, [user, profile, router]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-surface-400">Redirecionando para o login...</p>
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    try {
      const productId = await createProduct({
        sellerId: user.uid,
        sellerName: profile?.name || user.displayName || "Usuário",
        sellerPhoto: profile?.photo || user.photoURL || undefined,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? Number(formData.year) : undefined,
        color: formData.color || undefined,
        condition: formData.condition,
        handedness: formData.handedness || undefined,
        listingType: formData.acceptsProposal ? "proposta" : "venda",
        price: Number(formData.price),
        acceptsTrade: formData.acceptsTrade,
        acceptsProposal: formData.acceptsProposal,
        shipping: formData.shipping ? Number(formData.shipping) : undefined,
        images: [],
        city: formData.city,
        state: formData.state,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
        views: 0,
        favoritesCount: 0,
      });

      if (formData.images?.length > 0) {
        const imgs = await uploadProductImages(productId, formData.images);
        const { updateProduct } = await import("@/lib/db");
        await updateProduct(productId, { images: imgs } as any);
      }

      toast.success("Anúncio criado com sucesso!");
      router.push(`/produtos/${productId}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar anúncio. Tente novamente.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          Criar <span className="gradient-text">Anúncio</span>
        </h1>
        <p className="text-surface-400 mt-1 text-sm">
          Publique seu instrumento ou acessório para milhares de músicos em todo o Brasil.
        </p>
      </div>

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
