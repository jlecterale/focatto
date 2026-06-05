import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrar Verificações - Focatto",
  description: "Análise e revisão de solicitações de verificação de identidade dos usuários no Focatto.",
};

export default function AdminVerificacoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
