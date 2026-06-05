import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrar Usuários - Focatto",
  description: "Gerenciamento de permissões, papéis (admin) e marcações de usuários profissionais ou verificados no Focatto.",
};

export default function AdminUsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
