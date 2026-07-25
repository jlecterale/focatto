import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suporte - Vibrattoo",
  description: "Central de atendimento, suporte e perguntas frequentes (FAQ) da plataforma Vibrattoo.",
};

export default function SuporteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
