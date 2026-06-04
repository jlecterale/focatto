import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";

import "@/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Focatto – Marketplace de Instrumentos Musicais",
    template: "%s | Focatto",
  },
  description:
    "Compre, venda e troque instrumentos musicais, acessórios e agende serviços de luthieria. Focatto - o maior marketplace de música do Brasil.",
  keywords: [
    "instrumentos musicais", "guitarra", "baixo", "bateria", "teclado",
    "luthier", "marketplace música", "comprar guitarra", "vender instrumento",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Focatto",
    title: "Focatto – Marketplace de Instrumentos Musicais",
    description:
      "Compre, venda e troque instrumentos musicais, acessórios e agende serviços de luthieria.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay">
        <Providers>
          <Header />
          <main className="pt-16 md:pt-18 pb-20 md:pb-0 min-h-screen">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
