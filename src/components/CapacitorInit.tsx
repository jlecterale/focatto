"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isNativeApp } from "../lib/native";

/**
 * Inicializa os plugins nativos quando o site roda dentro do app Capacitor
 * (Android/iOS): esconde a splash screen, configura a status bar para o tema
 * escuro do Focatto e mapeia o botão "voltar" do Android para a navegação.
 * No navegador comum este componente não faz nada.
 */
export default function CapacitorInit() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isNativeApp()) return;

    let removeBackListener: (() => void) | undefined;

    (async () => {
      try {
        const [{ SplashScreen }, { StatusBar, Style }, { App }] = await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
          import("@capacitor/app"),
        ]);

        await SplashScreen.hide();
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#0c0a09" });
        } catch {
          // setBackgroundColor não existe no iOS
        }

        const listener = await App.addListener("backButton", ({ canGoBack }) => {
          if (window.location.pathname !== "/") {
            router.back();
          } else if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
        removeBackListener = () => listener.remove();
      } catch (err) {
        console.error("Erro ao inicializar plugins do Capacitor:", err);
      }
    })();

    return () => {
      removeBackListener?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marca o <html> para permitir ajustes de CSS específicos do app nativo
  // (ex.: safe areas), via seletor `html.capacitor-native`.
  useEffect(() => {
    if (isNativeApp()) {
      document.documentElement.classList.add("capacitor-native");
    }
  }, [pathname]);

  return null;
}
