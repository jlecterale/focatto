"use client";

import { useState, useEffect } from "react";
import AdminGuard from "../../../components/admin/AdminGuard";
import { useAuth } from "../../../contexts/AuthContext";
import { getPendingVerifications, getAllVerifications, reviewVerification } from "../../../lib/userService";
import type { VerificationRequest } from "../../../lib/roles";
import Link from "next/link";
import {
  Compass,
  SignOut,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Spinner,
  ArrowLeft,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminVerificacoesPage() {
  const { user, logout } = useAuth();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadVerifications();
  }, [filter]);

  async function loadVerifications() {
    setLoading(true);
    try {
      const data = filter === "pending" ? await getPendingVerifications() : await getAllVerifications();
      setVerifications(data);
    } catch {
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(verificationId: string, userId: string, status: "approved" | "rejected") {
    if (!user) return;
    setReviewingId(verificationId);
    try {
      await reviewVerification(verificationId, userId, status, adminNotes, user.uid);
      toast.success(`Verificação ${status === "approved" ? "aprovada" : "rejeitada"} com sucesso!`);
      setAdminNotes("");
      loadVerifications();
    } catch {
      toast.error("Erro ao processar verificação.");
    } finally {
      setReviewingId(null);
    }
  }

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
        {/* Header */}
        <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-surface-400 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center">
                <Compass size={20} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Verificações</h1>
                <p className="text-[10px] text-surface-400">Revise documentos de usuários</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
            >
              <SignOut size={14} />
              Sair
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter("pending")}
              className={`text-xs font-semibold py-2 px-4 rounded-xl transition-all ${
                filter === "pending"
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white"
                  : "bg-[#181615] text-surface-400 border border-[#2a2827]"
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`text-xs font-semibold py-2 px-4 rounded-xl transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white"
                  : "bg-[#181615] text-surface-400 border border-[#2a2827]"
              }`}
            >
              Todas
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size={24} className="animate-spin text-[#ef7c2c]" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck size={48} className="mx-auto text-surface-500 mb-3" />
              <p className="text-surface-400 text-sm">Nenhuma solicitação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((ver) => (
                <div
                  key={ver.id}
                  className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4"
                >
                  {/* User Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{ver.userName}</h3>
                      <p className="text-xs text-surface-400">{ver.userEmail}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        ver.status === "pending"
                          ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                          : ver.status === "approved"
                            ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                            : "bg-red-400/10 text-red-400 border border-red-400/20"
                      }`}
                    >
                      {ver.status === "pending"
                        ? "Pendente"
                        : ver.status === "approved"
                          ? "Aprovado"
                          : "Rejeitado"}
                    </span>
                  </div>

                  {/* Photos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-surface-400 mb-2">Documento</p>
                      <a
                        href={ver.documentPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-40 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden hover:border-[#ef7c2c]/30 transition-colors"
                      >
                        <img
                          src={ver.documentPhoto}
                          alt="Documento"
                          className="h-full w-full object-contain"
                        />
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 mb-2">Selfie</p>
                      <a
                        href={ver.facePhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-40 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden hover:border-[#ef7c2c]/30 transition-colors"
                      >
                        <img
                          src={ver.facePhoto}
                          alt="Selfie"
                          className="h-full w-full object-contain"
                        />
                      </a>
                    </div>
                  </div>

                  {/* Review Actions */}
                  {ver.status === "pending" && (
                    <div className="space-y-3 pt-2 border-t border-[#22201e]">
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Observações (opcional)..."
                        rows={2}
                        className={inputBase}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(ver.id, ver.userId, "approved")}
                          disabled={reviewingId === ver.id}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {reviewingId === ver.id ? (
                            <Spinner size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReview(ver.id, ver.userId, "rejected")}
                          disabled={reviewingId === ver.id}
                          className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {reviewingId === ver.id ? (
                            <Spinner size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviewed Info */}
                  {ver.status !== "pending" && ver.adminNotes && (
                    <div className="pt-2 border-t border-[#22201e]">
                      <p className="text-xs text-surface-400">
                        <span className="text-surface-500">Observações:</span> {ver.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
