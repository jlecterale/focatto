"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "rgba(18, 18, 20, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#f5f5f5",
          borderRadius: "12px",
          fontSize: "14px",
        },
        duration: 4000,
      }}
    />
  );
}
