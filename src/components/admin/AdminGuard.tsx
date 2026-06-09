"use client";

import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../lib/roles";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userRole !== ROLES.ADMIN)) {
      router.push("/");
    }
  }, [user, userRole, loading, router]);

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
    return null;
  }

  return <>{children}</>;
}
