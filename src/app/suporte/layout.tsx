import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suporte - Focatto",
  description: "Central de atendimento, suporte e perguntas frequentes (FAQ) da plataforma Focatto.",
};

export default function SuporteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
