import type { Metadata } from "next";
import { fetchProductSeoData } from "../../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductSeoData(id);

  if (!product) {
    return {
      title: "Anúncio - Focattolecter",
      description: "Encontre instrumentos musicais e acessórios no Focattolecter.",
    };
  }

  const priceLabel = product.price ? ` por R$ ${product.price.toLocaleString("pt-BR")}` : "";
  const location = product.city && product.state ? ` em ${product.city}, ${product.state}` : "";
  const description =
    product.description?.slice(0, 160) ||
    `${product.title}${priceLabel}${location}. Veja fotos e fale com o anunciante no Focattolecter.`;

  return {
    title: `${product.title} - Focattolecter`,
    description,
    openGraph: {
      title: product.title,
      description,
      type: "website",
      images: product.photo ? [{ url: product.photo }] : undefined,
    },
    twitter: {
      card: product.photo ? "summary_large_image" : "summary",
      title: product.title,
      description,
      images: product.photo ? [product.photo] : undefined,
    },
  };
}

export default function AnuncioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
