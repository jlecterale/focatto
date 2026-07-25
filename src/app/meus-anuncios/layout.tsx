import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Anúncios - Vibrattoo",
  description: "Gerencie, edite ou crie novos anúncios de instrumentos musicais e acessórios no Vibrattoo.",
};

export default function MeusAnunciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
