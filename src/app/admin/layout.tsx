import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Admin - Vibrattoo",
  description: "Painel de administração da plataforma Vibrattoo para gerenciar anúncios, usuários e verificações de identidade.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
