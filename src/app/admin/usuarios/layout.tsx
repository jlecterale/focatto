import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrar Usuários - Vibrattoo",
  description: "Gerenciamento de permissões, papéis (admin) e marcações de usuários profissionais ou verificados no Vibrattoo.",
};

export default function AdminUsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
