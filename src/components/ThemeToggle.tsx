"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "vibrattoo-theme";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Floating light/dark switch. Light is the default; the choice persists in
 * localStorage and is applied before paint by the inline script in the layout
 * head, so this component only needs to mirror and update that state.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — theme still applies for the session */
    }
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className="fixed bottom-5 right-5 z-[9998] flex h-11 w-11 items-center justify-center rounded-full glass-strong text-surface-100 shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
