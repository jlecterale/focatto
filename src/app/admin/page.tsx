"use client";

import AdminGuard from "../../components/admin/AdminGuard";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { Compass, Users, Package, Wrench, Calendar, SignOut, ShieldCheck } from "@phosphor-icons/react";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
        {/* Header */}
        <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center">
                <Compass size={20} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Painel Admin</h1>
                <p className="text-[10px] text-surface-400">Focatto</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-xs text-surface-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#2a2827]"
              >
                Perfil
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
              >
                <SignOut size={14} />
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white font-heading">Dashboard</h2>
            <p className="text-sm text-surface-400 mt-1">Gerencie sua plataforma Focatto</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/verificacoes"
              className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex items-center gap-4 hover:border-[#ef7c2c]/30 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-[#ef7c2c]/10 flex items-center justify-center">
                <ShieldCheck size={24} className="text-[#ef7c2c]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Verificações</p>
                <p className="text-xs text-surface-400">Revise documentos de usuários</p>
              </div>
            </Link>

            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#d4ae12]/10 flex items-center justify-center">
                <Package size={24} className="text-[#d4ae12]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">--</p>
                <p className="text-xs text-surface-400">Produtos</p>
              </div>
            </div>

            <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#ef7c2c]/10 flex items-center justify-center">
                <Wrench size={24} className="text-[#ef7c2c]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">--</p>
                <p className="text-xs text-surface-400">Luthiers</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
