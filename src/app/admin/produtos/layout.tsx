import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrar Anúncios - Focatto",
  description: "Revisão, aprovação ou rejeição de anúncios de produtos e serviços dos usuários no Focatto.",
};

export default function AdminProdutosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
