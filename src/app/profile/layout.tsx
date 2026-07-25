import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil - Vibrattoo",
  description: "Gerencie suas informações de perfil, foto, endereço de atendimento e verificação de conta no Vibrattoo.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
