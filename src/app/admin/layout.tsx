import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Admin - Focatto",
  description: "Painel de administração da plataforma Focatto para gerenciar anúncios, usuários e verificações de identidade.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
