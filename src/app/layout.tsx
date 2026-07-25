import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "../index.css";
import AuthProviderWrapper from "../components/AuthProviderWrapper";
import ThemeToggle from "../components/ThemeToggle";
import { SITE_URL } from "../lib/seo";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vibrattoo - Marketplace de Instrumentos Musicais",
  description: "Encontre instrumentos musicais e luthiers especializados perto de você.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="light" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        {/* Applies the persisted theme before first paint to avoid a flash of
            the wrong theme. Light is the default when nothing is stored. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('vibrattoo-theme');document.documentElement.dataset.theme=(t==='dark')?'dark':'light';}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen bg-surface-950 text-surface-50 antialiased selection:bg-accent/30 selection:text-white noise-overlay">
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
        <ThemeToggle />
      </body>
    </html>
  );
}
