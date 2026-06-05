import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil - Focatto",
  description: "Gerencie suas informações de perfil, foto, endereço de atendimento e verificação de conta no Focatto.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
