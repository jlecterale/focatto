import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Anúncios - Focatto",
  description: "Gerencie, edite ou crie novos anúncios de instrumentos musicais e acessórios no Focatto.",
};

export default function MeusAnunciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
