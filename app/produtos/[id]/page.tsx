"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  CalendarBlank,
  Heart,
  ChatCircleDots,
  CurrencyDollar,
  ArrowLeft,
  ShareNetwork,
  ShieldCheck,
} from "@phosphor-icons/react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Card } from "@/components/ui/Card";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton, ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useProduct, useProductsBySeller } from "@/hooks/useProdutos";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useAuth } from "@/hooks/useAuth";
import { useCreateChat } from "@/hooks/useChat";
import { incrementProductViews, createProposal } from "@/lib/db";
import { formatCurrency, formatDate, conditionColor, conditionLabel } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const id = params.id as string;
  const { product, loading } = useProduct(id);
  const { isFavorite, toggleFavorite } = useFavoritos();
  const { create } = useCreateChat();
  const { products: sellerProducts } = useProductsBySeller(product?.sellerId);

  const [showProposal, setShowProposal] = useState(false);
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [sendingProposal, setSendingProposal] = useState(false);

  useEffect(() => {
    if (id) incrementProductViews(id).catch(() => {});
  }, [id]);

  const handleChat = async () => {
    if (!user) { toast.error("Faça login para enviar mensagem"); return; }
    if (!product) return;
    const otherId = product.sellerId;
    if (user.uid === otherId) return;
    const chatId = await create(
      [user.uid, otherId],
      {
        [user.uid]: profile?.name || user.displayName || "Você",
        [otherId]: product.sellerName,
      },
      {
        [user.uid]: profile?.photo || "",
        [otherId]: product.sellerPhoto || "",
      },
      product.id,
      product.title,
      product.images?.[0]?.thumb
    );
    if (chatId) router.push("/perfil?tab=chats&chat=" + chatId);
  };

  const handleProposal = async () => {
    if (!user || !product) return;
    if (!proposalAmount || Number(proposalAmount) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setSendingProposal(true);
    try {
      await createProposal({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images?.[0]?.thumb,
        senderId: user.uid,
        senderName: profile?.name || user.displayName || "Usuário",
        receiverId: product.sellerId,
        receiverName: product.sellerName,
        amount: Number(proposalAmount),
        message: proposalMessage,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast.success("Proposta enviada com sucesso!");
      setShowProposal(false);
      setProposalAmount("");
      setProposalMessage("");
    } catch {
      toast.error("Erro ao enviar proposta");
    } finally {
      setSendingProposal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-surface-300">Produto não encontrado</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/")}>
          Voltar ao Início
        </Button>
      </div>
    );
  }

  const fav = isFavorite(product.id);
  const otherProducts = sellerProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images?.map((i) => i.url) || [],
    brand: { "@type": "Brand", name: product.brand },
    model: product.model,
    category: product.category,
    condition: product.condition === "novo" ? "NewCondition" : "UsedCondition",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BRL",
      availability: product.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      seller: { "@type": "Person", name: product.sellerName },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <button
        onClick={() => router.back()}
        className="btn-ghost mb-4 -ml-2"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        <ProductGallery images={product.images} />

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-surface-400">
                {product.brand} {product.model}
              </span>
              <span className="text-surface-500">•</span>
              <ConditionBadge condition={product.condition} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">
              {product.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold gradient-text">
              {formatCurrency(product.price)}
            </span>
            {product.shipping !== undefined && product.shipping > 0 && (
              <span className="text-sm text-surface-400">
                + Frete: {formatCurrency(product.shipping)}
              </span>
            )}
          </div>

          {product.acceptsTrade && (
            <Badge variant="info">Aceita Troca</Badge>
          )}
          {product.acceptsProposal && (
            <Badge variant="gold">Aceita Propostas</Badge>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <CalendarBlank size={12} />
              {product.year || "Ano não informado"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {product.city}, {product.state}
            </span>
            {product.color && (
              <span>Cor: {product.color}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="lg" onClick={handleChat} className="flex-1">
              <ChatCircleDots size={18} weight="fill" />
              Conversar com Vendedor
            </Button>
            {product.acceptsProposal && (
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  if (!user) { toast.error("Faça login para fazer proposta"); return; }
                  setShowProposal(true);
                }}
                className="flex-1"
              >
                <CurrencyDollar size={18} />
                Fazer Proposta
              </Button>
            )}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="btn-secondary px-3"
              aria-label="Favoritar"
            >
              <Heart size={20} weight={fav ? "fill" : "regular"} className={fav ? "text-red-400" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <Avatar src={product.sellerPhoto} name={product.sellerName} size="md" />
            <div>
              <p className="text-sm font-medium">{product.sellerName}</p>
              <p className="text-xs text-surface-400">Vendedor</p>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-surface-400 pt-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            Compra segura. Pagamento combinado diretamente com o vendedor.
          </div>
        </div>
      </div>

      {otherProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            Mais anúncios de {product.sellerName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/produtos/${p.id}`)}
                className="glass rounded-xl overflow-hidden cursor-pointer card-hover"
              >
                <div className="aspect-[4/3] bg-surface-800">
                  {p.images?.[0]?.thumb && (
                    <img src={p.images[0].thumb} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-surface-400 truncate">{p.brand}</p>
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-sm font-bold gradient-text mt-1">
                    {formatCurrency(p.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal open={showProposal} onClose={() => setShowProposal(false)} title="Fazer Proposta" size="sm">
        <div className="space-y-4">
          <div className="glass rounded-xl p-3">
            <p className="text-sm font-medium">{product.title}</p>
            <p className="text-sm text-surface-400 mt-0.5">
              Preço anunciado: {formatCurrency(product.price)}
            </p>
          </div>
          <Input
            label="Sua proposta (R$)"
            type="number"
            placeholder="0,00"
            value={proposalAmount}
            onChange={(e) => setProposalAmount(e.target.value)}
          />
          <Input
            label="Mensagem (opcional)"
            placeholder="Explique sua proposta..."
            value={proposalMessage}
            onChange={(e) => setProposalMessage(e.target.value)}
          />
          <Button className="w-full" onClick={handleProposal} loading={sendingProposal}>
            Enviar Proposta
          </Button>
        </div>
      </Modal>
    </div>
  );
}
