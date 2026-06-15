import type { Metadata } from "next";
import { fetchSellerSeoData } from "../../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const seller = await fetchSellerSeoData(id);

  if (!seller) {
    return {
      title: "Vendedor - Focattolecter",
      description: "Conheça vendedores, luthiers e professores no Focattolecter.",
    };
  }

  const description =
    seller.bio?.slice(0, 160) ||
    `Veja os anúncios e avaliações de ${seller.displayName} no Focattolecter.`;

  return {
    title: `${seller.displayName} - Focattolecter`,
    description,
    openGraph: {
      title: seller.displayName,
      description,
      type: "profile",
      images: seller.photoURL ? [{ url: seller.photoURL }] : undefined,
    },
  };
}

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
