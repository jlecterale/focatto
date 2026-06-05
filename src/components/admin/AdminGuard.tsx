"use client";

import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../lib/roles";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#ef7c2c] border-t-transparent animate-spin" />
          <p className="text-sm text-surface-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== ROLES.ADMIN) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-surface-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
