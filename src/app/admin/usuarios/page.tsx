"use client";

import { useState, useEffect } from "react";
import AdminGuard from "../../../components/admin/AdminGuard";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllUsers, adminUpdateUserRole, adminSetUserVerified, adminSetUserProfessional, adminSetUserTeacher, adminSetUserPremiumTier } from "../../../lib/userService";
import { ROLES, isSuperAdmin, type UserData, type UserRole } from "../../../lib/roles";
import Link from "next/link";
import {
  Compass, SignOut, Spinner, ArrowLeft, Users, ShieldCheck, Star, User,
  CheckCircle, XCircle, GraduationCap,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import NotificationBell from "../../../components/NotificationBell";
import ChatHeaderButton from "../../../components/ChatHeaderButton";

export default function AdminUsuariosPage() {
  const { user, logout } = useAuth();
  const superAdmin = isSuperAdmin(user?.email, user?.uid);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(uid: string, currentRole: UserRole) {
    setProcessingUid(uid);
    const newRole = currentRole === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
    try {
      await adminUpdateUserRole(uid, newRole);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
      toast.success(`Usuário ${newRole === "admin" ? "promovido a admin" : "revertido para usuário"}.`);
    } catch {
      toast.error("Erro ao alterar role.");
    } finally {
      setProcessingUid(null);
    }
  }

  async function handleToggleVerified(uid: string, current: boolean) {
    setProcessingUid(uid);
    const newVal = !current;
    try {
      await adminSetUserVerified(uid, newVal);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, isVerified: newVal, verificationStatus: newVal ? "approved" : "none" } : u)));
      toast.success(`Usuário ${newVal ? "verificado" : "não verificado"}.`);
    } catch {
      toast.error("Erro ao alterar verificação.");
    } finally {
      setProcessingUid(null);
    }
  }

  async function handleToggleProfessional(uid: string, current: boolean) {
    setProcessingUid(uid);
    const newVal = !current;
    try {
      await adminSetUserProfessional(uid, newVal);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, isProfessional: newVal } : u)));
      toast.success(`Usuário ${newVal ? "marcado como profissional" : "removido como profissional"}.`);
    } catch {
      toast.error("Erro ao alterar status profissional.");
    } finally {
      setProcessingUid(null);
    }
  }

  async function handleToggleTeacher(uid: string, current: boolean) {
    setProcessingUid(uid);
    const newVal = !current;
    try {
      await adminSetUserTeacher(uid, newVal);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, isTeacher: newVal } : u)));
      toast.success(`Usuário ${newVal ? "marcado como professor" : "removido como professor"}.`);
    } catch {
      toast.error("Erro ao alterar status de professor.");
    } finally {
      setProcessingUid(null);
    }
  }

  async function handleChangeUserTier(uid: string, tier: string) {
    setProcessingUid(uid);
    try {
      await adminSetUserPremiumTier(uid, tier);
      const isPremium = tier === "tier1" || tier === "tier2";
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, premiumTier: tier, isPremium } : u))
      );
      toast.success("Plano de assinatura atualizado com sucesso!");
    } catch {
      toast.error("Erro ao alterar o plano de assinatura.");
    } finally {
      setProcessingUid(null);
    }
  }

  const filtered = search
    ? users.filter((u) =>
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
        <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/admin" id="admin-users-back-btn" className="text-surface-400 hover:text-white transition-colors flex-shrink-0">
                <ArrowLeft size={18} />
              </Link>
              <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center flex-shrink-0">
                <Compass size={18} weight="bold" className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white truncate">Usuários</h1>
                <p className="text-[10px] text-surface-400">
                  Gerencie permissões {user?.email && `• ${user.email}`}
                </p>
              </div>
            </div>
            <ChatHeaderButton />
            <NotificationBell />
            <button onClick={logout}
              id="admin-users-logout-btn"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
            >
              <SignOut size={14} /> Sair
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            id="admin-user-search-input"
            placeholder="Buscar por nome ou email..."
            aria-label="Buscar usuários por nome ou e-mail"
            className={inputBase}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size={24} className="animate-spin text-[#ef7c2c]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-surface-500 mb-3" />
              <p className="text-surface-400 text-sm">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((u) => (
                <div key={u.uid} className="bg-[#141211] rounded-2xl p-4 sm:p-5 border border-[#22201e] space-y-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{u.displayName}</h4>
                      <p className="text-xs text-surface-400 truncate">{u.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {u.role === "admin" && (
                          <span className="text-[10px] bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 px-2 py-0.5 rounded-full font-semibold">Admin</span>
                        )}
                        {u.isVerified && (
                          <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle size={10} weight="fill" /> Verificado
                          </span>
                        )}
                        {u.isProfessional && (
                          <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Star size={10} weight="fill" /> Profissional
                          </span>
                        )}
                        {u.isTeacher && (
                          <span className="text-[10px] bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <GraduationCap size={10} weight="fill" /> Professor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#22201e]">
                    {/* Toggle Admin */}
                    <button onClick={() => handleToggleRole(u.uid, u.role)}
                      disabled={processingUid === u.uid}
                      id={`toggle-role-${u.uid}`}
                      className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
                        u.role === "admin"
                          ? "bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 hover:bg-[#ef7c2c]/20"
                          : "bg-[#181615] text-surface-400 border border-[#2a2827] hover:text-white"
                      }`}
                    >
                      {processingUid === u.uid ? <Spinner size={12} className="animate-spin" /> : <ShieldCheck size={14} />}
                      {u.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                    </button>

                    {/* Toggle Verified */}
                    <button onClick={() => handleToggleVerified(u.uid, u.isVerified)}
                      disabled={processingUid === u.uid}
                      id={`toggle-verif-${u.uid}`}
                      className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
                        u.isVerified
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-[#181615] text-surface-400 border border-[#2a2827] hover:text-white"
                      }`}
                    >
                      {processingUid === u.uid ? <Spinner size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                      {u.isVerified ? "Remover Verificado" : "Marcar Verificado"}
                    </button>

                    {/* Toggle Professional */}
                    <button onClick={() => handleToggleProfessional(u.uid, u.isProfessional)}
                      disabled={processingUid === u.uid}
                      id={`toggle-prof-${u.uid}`}
                      className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
                        u.isProfessional
                          ? "bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20"
                          : "bg-[#181615] text-surface-400 border border-[#2a2827] hover:text-white"
                      }`}
                    >
                      {processingUid === u.uid ? <Spinner size={12} className="animate-spin" /> : <Star size={14} />}
                      {u.isProfessional ? "Remover Profissional" : "Marcar Profissional"}
                    </button>

                    {/* Toggle Teacher */}
                    <button onClick={() => handleToggleTeacher(u.uid, !!u.isTeacher)}
                      disabled={processingUid === u.uid}
                      id={`toggle-teacher-${u.uid}`}
                      className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
                        u.isTeacher
                          ? "bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/20"
                          : "bg-[#181615] text-surface-400 border border-[#2a2827] hover:text-white"
                      }`}
                    >
                      {processingUid === u.uid ? <Spinner size={12} className="animate-spin" /> : <GraduationCap size={14} />}
                      {u.isTeacher ? "Remover Professor" : "Marcar Professor"}
                    </button>

                    {/* Alterar Assinatura (Apenas para jfreire.comercial@gmail.com) */}
                    {superAdmin && (
                      <div className="flex items-center gap-2 bg-[#181615] border border-[#2a2827] rounded-xl px-3 py-2.5 text-xs font-semibold">
                        <span className="text-surface-400">Plano:</span>
                        <select
                          value={u.premiumTier || "tier3"}
                          onChange={(e) => handleChangeUserTier(u.uid, e.target.value)}
                          disabled={processingUid === u.uid}
                          className="bg-transparent border-none text-[#ef7c2c] font-bold outline-none cursor-pointer"
                        >
                          <option value="tier3" className="bg-[#0b0908] text-white">Tier 3 (Grátis)</option>
                          <option value="tier2" className="bg-[#0b0908] text-white">Tier 2 (Plus)</option>
                          <option value="tier1" className="bg-[#0b0908] text-white">Tier 1 (Pro)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
