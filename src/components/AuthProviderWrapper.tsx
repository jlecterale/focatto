"use client";

import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1817",
            border: "1px solid #2a2827",
            color: "#f5f5f5",
          },
        }}
      />
    </AuthProvider>
  );
}
