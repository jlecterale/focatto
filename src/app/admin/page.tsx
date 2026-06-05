"use client";

import { useState, useEffect } from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import {
  Compass, SignOut, Clock, Users, Package, Wrench, MusicNote,
  CheckCircle, XCircle, Spinner, ArrowLeft, GraduationCap,
} from "@phosphor-icons/react";
import { getPendingProducts, getProductsByCategory, getProductsByCategories, reviewProduct } from "../../lib/productService";
import { getPendingVerifications, getAllUsers, getProfessionalUsers, getTeacherUsers, reviewVerification, adminUpdateUserRole, adminSetUserVerified, adminSetUserProfessional, adminSetUserTeacher } from "../../lib/userService";
import type { ProductData, VerificationRequest, UserData } from "../../lib/roles";
import { ROLES } from "../../lib/roles";
import { toast } from "sonner";

type Tab = "pendentes" | "luthier" | "acessorios" | "instrumentos" | "usuarios" | "professores";

const INSTRUMENT_CATEGORIES = ["Guitarra", "Violão", "Baixo", "Bateria", "Teclado", "Saxofone", "Violino"];

const inputBase =
  "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

function ProductCard({
  product,
  onReview,
  reviewingId,
  adminNotes,
  setAdminNotes,
}: {
  product: ProductData;
  onReview: (id: string, status: "approved" | "rejected") => void;
  reviewingId: string | null;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
}) {
  return (
    <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate">{product.title}</h4>
          <p className="text-xs text-surface-400">
            {product.userName} &middot; {product.userEmail}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {product.city}, {product.state} &middot; {product.category}
            {product.price ? ` &middot; R$ ${product.price.toLocaleString("pt-BR")}` : ""}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ml-3 ${
          product.status === "pending"
            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
            : product.status === "approved"
              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
              : "bg-red-400/10 text-red-400 border border-red-400/20"
        }`}>
          {product.status === "pending" ? "Pendente" : product.status === "approved" ? "Aprovado" : "Rejeitado"}
        </span>
      </div>

      {product.description && (
        <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">{product.description}</p>
      )}

      {product.photos && product.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {product.photos.map((photo, idx) => (
            <a key={idx} href={photo} target="_blank" rel="noopener noreferrer"
              className="h-20 sm:h-24 w-20 sm:w-24 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden flex-shrink-0 hover:border-[#ef7c2c]/30 transition-colors"
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      {product.status === "pending" && (
        <div className="space-y-3 pt-2 border-t border-[#22201e]">
          <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Observações (opcional)..."
            id={`admin-notes-prod-${product.id}`}
            aria-label="Observações do administrador para aprovação ou rejeição do produto"
            rows={2} className={inputBase}
          />
          <div className="flex gap-3">
            <button onClick={() => onReview(product.id!, "approved")}
              disabled={reviewingId === product.id}
              id={`approve-prod-${product.id}`}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {reviewingId === product.id ? <Spinner size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Aprovar
            </button>
            <button onClick={() => onReview(product.id!, "rejected")}
              disabled={reviewingId === product.id}
              id={`reject-prod-${product.id}`}
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {reviewingId === product.id ? <Spinner size={14} className="animate-spin" /> : <XCircle size={14} />}
              Rejeitar
            </button>
          </div>
        </div>
      )}

      {product.status !== "pending" && product.adminNotes && (
        <div className="pt-2 border-t border-[#22201e]">
          <p className="text-xs text-surface-400">
            <span className="text-surface-500">Observações:</span> {product.adminNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function VerificationCard({
  ver,
  onReview,
  reviewingId,
  adminNotes,
  setAdminNotes,
}: {
  ver: VerificationRequest;
  onReview: (id: string, userId: string, status: "approved" | "rejected") => void;
  reviewingId: string | null;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
}) {
  return (
    <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">{ver.userName}</h4>
          <p className="text-xs text-surface-400">{ver.userEmail}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          ver.status === "pending"
            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
            : ver.status === "approved"
              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
              : "bg-red-400/10 text-red-400 border border-red-400/20"
        }`}>
          {ver.status === "pending" ? "Pendente" : ver.status === "approved" ? "Aprovado" : "Rejeitado"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href={ver.documentPhoto} target="_blank" rel="noopener noreferrer"
          className="h-28 sm:h-32 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden hover:border-[#ef7c2c]/30 transition-colors"
        >
          <img src={ver.documentPhoto} alt="Documento" className="h-full w-full object-cover" />
        </a>
        <a href={ver.facePhoto} target="_blank" rel="noopener noreferrer"
          className="h-28 sm:h-32 rounded-xl bg-[#181615] border border-[#2a2827] overflow-hidden hover:border-[#ef7c2c]/30 transition-colors"
        >
          <img src={ver.facePhoto} alt="Selfie" className="h-full w-full object-cover" />
        </a>
      </div>

      {ver.status === "pending" && (
        <div className="space-y-3 pt-2 border-t border-[#22201e]">
          <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Observações (opcional)..."
            id={`admin-notes-ver-${ver.id}`}
            aria-label="Observações do administrador para aprovação ou rejeição da verificação"
            rows={2} className={inputBase}
          />
          <div className="flex gap-3">
            <button onClick={() => onReview(ver.id, ver.userId, "approved")}
              disabled={reviewingId === ver.id}
              id={`approve-ver-${ver.id}`}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {reviewingId === ver.id ? <Spinner size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Aprovar
            </button>
            <button onClick={() => onReview(ver.id, ver.userId, "rejected")}
              disabled={reviewingId === ver.id}
              id={`reject-ver-${ver.id}`}
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {reviewingId === ver.id ? <Spinner size={14} className="animate-spin" /> : <XCircle size={14} />}
              Rejeitar
            </button>
          </div>
        </div>
      )}

      {ver.status !== "pending" && ver.adminNotes && (
        <div className="pt-2 border-t border-[#22201e]">
          <p className="text-xs text-surface-400">
            <span className="text-surface-500">Observações:</span> {ver.adminNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function UserCard({
  u,
  onToggleRole,
  onToggleVerified,
  onToggleProfessional,
  onToggleTeacher,
  toggling,
}: {
  u: UserData;
  onToggleRole: (uid: string) => void;
  onToggleVerified: (uid: string, v: boolean) => void;
  onToggleProfessional: (uid: string, v: boolean) => void;
  onToggleTeacher: (uid: string, v: boolean) => void;
  toggling: string | null;
}) {
  return (
    <div className="bg-[#141211] rounded-2xl p-4 sm:p-5 border border-[#22201e] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-[#181615] border border-[#2a2827] overflow-hidden flex-shrink-0">
        {u.photoURL ? (
          <img src={u.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-surface-500 text-sm font-bold">
            {u.displayName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-white truncate">{u.displayName}</h4>
        <p className="text-xs text-surface-400 truncate">{u.email}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {u.role === "admin" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20">Admin</span>
          )}
          {u.isVerified && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Verificado</span>
          )}
          {u.isProfessional && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4ae12]/10 text-[#d4ae12] border border-[#d4ae12]/20">Profissional</span>
          )}
          {u.isTeacher && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-400/10 text-indigo-400 border border-indigo-400/20">Professor</span>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 flex-shrink-0">
        <button onClick={() => onToggleRole(u.uid)}
          disabled={toggling === u.uid}
          id={`toggle-role-${u.uid}`}
          className={`text-[10px] font-semibold py-2 px-3 rounded-lg border transition-all disabled:opacity-60 ${
            u.role === "admin"
              ? "bg-[#ef7c2c]/10 text-[#ef7c2c] border-[#ef7c2c]/20 hover:bg-[#ef7c2c]/20"
              : "bg-[#181615] text-surface-400 border-[#2a2827] hover:border-[#ef7c2c]/30"
          }`}
        >
          Admin
        </button>
        <button onClick={() => onToggleVerified(u.uid, !u.isVerified)}
          disabled={toggling === u.uid}
          id={`toggle-verif-${u.uid}`}
          className={`text-[10px] font-semibold py-2 px-3 rounded-lg border transition-all disabled:opacity-60 ${
            u.isVerified
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/20"
              : "bg-[#181615] text-surface-400 border-[#2a2827] hover:border-emerald-400/30"
          }`}
        >
          Verif.
        </button>
        <button onClick={() => onToggleProfessional(u.uid, !u.isProfessional)}
          disabled={toggling === u.uid}
          id={`toggle-prof-${u.uid}`}
          className={`text-[10px] font-semibold py-2 px-3 rounded-lg border transition-all disabled:opacity-60 ${
            u.isProfessional
              ? "bg-[#d4ae12]/10 text-[#d4ae12] border-[#d4ae12]/20 hover:bg-[#d4ae12]/20"
              : "bg-[#181615] text-surface-400 border-[#2a2827] hover:border-[#d4ae12]/30"
          }`}
        >
          Prof.
        </button>
        <button onClick={() => onToggleTeacher(u.uid, !!u.isTeacher)}
          disabled={toggling === u.uid}
          id={`toggle-teacher-${u.uid}`}
          className={`text-[10px] font-semibold py-2 px-3 rounded-lg border transition-all disabled:opacity-60 ${
            u.isTeacher
              ? "bg-indigo-400/10 text-indigo-400 border-indigo-400/20 hover:bg-indigo-400/20"
              : "bg-[#181615] text-surface-400 border-[#2a2827] hover:border-indigo-400/30"
          }`}
        >
          Prof.Mús.
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pendentes");

  const [pendingProducts, setPendingProducts] = useState<ProductData[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationRequest[]>([]);
  const [acessorioProducts, setAcessorioProducts] = useState<ProductData[]>([]);
  const [instrumentoProducts, setInstrumentoProducts] = useState<ProductData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [professionalUsers, setProfessionalUsers] = useState<UserData[]>([]);
  const [teacherUsers, setTeacherUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const [productAdminNotes, setProductAdminNotes] = useState("");
  const [verAdminNotes, setVerAdminNotes] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  async function loadTabData() {
    setLoading(true);
    try {
      switch (activeTab) {
        case "pendentes": {
          const [prods, vers] = await Promise.all([
            getPendingProducts(),
            getPendingVerifications(),
          ]);
          setPendingProducts(prods);
          setPendingVerifications(vers);
          break;
        }
        case "luthier": {
          const pros = await getProfessionalUsers();
          setProfessionalUsers(pros);
          break;
        }
        case "professores": {
          const teachers = await getTeacherUsers();
          setTeacherUsers(teachers);
          break;
        }
        case "acessorios": {
          const prods = await getProductsByCategory("Acessório");
          setAcessorioProducts(prods);
          break;
        }
        case "instrumentos": {
          const prods = await getProductsByCategories(INSTRUMENT_CATEGORIES);
          setInstrumentoProducts(prods);
          break;
        }
        case "usuarios": {
          const us = await getAllUsers();
          setUsers(us);
          break;
        }
      }
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProductReview(productId: string, status: "approved" | "rejected") {
    if (!user) return;
    setReviewingId(productId);
    try {
      await reviewProduct(productId, status, productAdminNotes, user.uid);
      toast.success(`Produto ${status === "approved" ? "aprovado" : "rejeitado"}!`);
      setProductAdminNotes("");
      loadTabData();
    } catch {
      toast.error("Erro ao processar produto.");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleVerReview(verId: string, userId: string, status: "approved" | "rejected") {
    if (!user) return;
    setReviewingId(verId);
    try {
      await reviewVerification(verId, userId, status, verAdminNotes, user.uid);
      toast.success(`Verificação ${status === "approved" ? "aprovada" : "rejeitada"}!`);
      setVerAdminNotes("");
      loadTabData();
    } catch {
      toast.error("Erro ao processar verificação.");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleToggleRole(uid: string) {
    if (!user) return;
    setTogglingUser(uid);
    try {
      const target = users.find((u) => u.uid === uid);
      if (!target) return;
      const newRole = target.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
      await adminUpdateUserRole(uid, newRole);
      toast.success(`Papel alterado para ${newRole}.`);
      loadTabData();
    } catch {
      toast.error("Erro ao alterar papel.");
    } finally {
      setTogglingUser(null);
    }
  }

  async function handleToggleVerified(uid: string, value: boolean) {
    setTogglingUser(uid);
    try {
      await adminSetUserVerified(uid, value);
      toast.success(value ? "Usuário verificado!" : "Verificação removida.");
      loadTabData();
    } catch {
      toast.error("Erro ao alterar verificação.");
    } finally {
      setTogglingUser(null);
    }
  }

  async function handleToggleProfessional(uid: string, value: boolean) {
    setTogglingUser(uid);
    try {
      await adminSetUserProfessional(uid, value);
      toast.success(value ? "Usuário marcado como profissional!" : "Marca profissional removida.");
      loadTabData();
    } catch {
      toast.error("Erro ao alterar status profissional.");
    } finally {
      setTogglingUser(null);
    }
  }

  async function handleToggleTeacher(uid: string, value: boolean) {
    setTogglingUser(uid);
    try {
      await adminSetUserTeacher(uid, value);
      toast.success(value ? "Usuário marcado como professor!" : "Marca professor removida.");
      loadTabData();
    } catch {
      toast.error("Erro ao alterar status de professor.");
    } finally {
      setTogglingUser(null);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "pendentes", label: "Pendentes", icon: <Clock size={16} weight="bold" /> },
    { key: "luthier", label: "Luthier", icon: <Wrench size={16} weight="bold" /> },
    { key: "professores", label: "Professores", icon: <GraduationCap size={16} weight="bold" /> },
    { key: "acessorios", label: "Acessórios", icon: <Package size={16} weight="bold" /> },
    { key: "instrumentos", label: "Instrumentos", icon: <MusicNote size={16} weight="bold" /> },
    { key: "usuarios", label: "Usuários", icon: <Users size={16} weight="bold" /> },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
        <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <Link href="/" className="flex flex-col items-start gap-0">
              <img 
                src="/focattolecter.png" 
                alt="Focattolecter Logo" 
                className="h-10 sm:h-12 w-auto object-contain invert brightness-110 mix-blend-screen" 
              />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#ef7c2c] pl-1.5 -mt-2 sm:-mt-2.5">
                Admin
              </span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link
                href="/profile"
                className="text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827]"
              >
                Perfil
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
              >
                <SignOut size={14} />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white font-heading">Dashboard</h2>
            <p className="text-sm text-surface-400 mt-1">Gerencie sua plataforma Focattolecter</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                id={`admin-tab-btn-${tab.key}`}
                className={`flex items-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-lg shadow-[#ef7c2c]/20"
                    : "bg-[#181615] text-surface-400 border border-[#2a2827] hover:border-[#ef7c2c]/30 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size={28} className="animate-spin text-[#ef7c2c]" />
            </div>
          ) : (
            <>
              {/* Pendentes */}
              {activeTab === "pendentes" && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Package size={18} className="text-[#d4ae12]" />
                      Anúncios Pendentes
                    </h3>
                    {pendingProducts.length === 0 ? (
                      <div className="text-center py-8 bg-[#141211] rounded-2xl border border-[#22201e]">
                        <Package size={40} className="mx-auto text-surface-500 mb-2" />
                        <p className="text-surface-400 text-sm">Nenhum anúncio pendente.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            onReview={handleProductReview}
                            reviewingId={reviewingId}
                            adminNotes={productAdminNotes}
                            setAdminNotes={setProductAdminNotes}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheckIcon />
                      Avaliações Pendentes
                    </h3>
                    {pendingVerifications.length === 0 ? (
                      <div className="text-center py-8 bg-[#141211] rounded-2xl border border-[#22201e]">
                        <ShieldCheckIcon />
                        <p className="text-surface-400 text-sm mt-2">Nenhuma verificação pendente.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingVerifications.map((v) => (
                          <VerificationCard
                            key={v.id}
                            ver={v}
                            onReview={handleVerReview}
                            reviewingId={reviewingId}
                            adminNotes={verAdminNotes}
                            setAdminNotes={setVerAdminNotes}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* Luthier */}
              {activeTab === "luthier" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Wrench size={18} className="text-[#d4ae12]" />
                    Luthiers / Profissionais
                  </h3>
                  {professionalUsers.length === 0 ? (
                    <div className="text-center py-12 bg-[#141211] rounded-2xl border border-[#22201e]">
                      <Wrench size={40} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-surface-400 text-sm">Nenhum profissional cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {professionalUsers.map((u) => (
                        <UserCard
                          key={u.uid}
                          u={u}
                          onToggleRole={handleToggleRole}
                          onToggleVerified={handleToggleVerified}
                          onToggleProfessional={handleToggleProfessional}
                          onToggleTeacher={handleToggleTeacher}
                          toggling={togglingUser}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Professores */}
              {activeTab === "professores" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-[#d4ae12]" />
                    Professores de Música
                  </h3>
                  {teacherUsers.length === 0 ? (
                    <div className="text-center py-12 bg-[#141211] rounded-2xl border border-[#22201e]">
                      <GraduationCap size={40} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-surface-400 text-sm">Nenhum professor cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teacherUsers.map((u) => (
                        <UserCard
                          key={u.uid}
                          u={u}
                          onToggleRole={handleToggleRole}
                          onToggleVerified={handleToggleVerified}
                          onToggleProfessional={handleToggleProfessional}
                          onToggleTeacher={handleToggleTeacher}
                          toggling={togglingUser}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Acessórios */}
              {activeTab === "acessorios" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Package size={18} className="text-[#d4ae12]" />
                    Acessórios
                  </h3>
                  {acessorioProducts.length === 0 ? (
                    <div className="text-center py-12 bg-[#141211] rounded-2xl border border-[#22201e]">
                      <Package size={40} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-surface-400 text-sm">Nenhum acessório cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {acessorioProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onReview={handleProductReview}
                          reviewingId={reviewingId}
                          adminNotes={productAdminNotes}
                          setAdminNotes={setProductAdminNotes}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instrumentos */}
              {activeTab === "instrumentos" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MusicNote size={18} className="text-[#d4ae12]" />
                    Instrumentos
                  </h3>
                  {instrumentoProducts.length === 0 ? (
                    <div className="text-center py-12 bg-[#141211] rounded-2xl border border-[#22201e]">
                      <MusicNote size={40} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-surface-400 text-sm">Nenhum instrumento cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {instrumentoProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onReview={handleProductReview}
                          reviewingId={reviewingId}
                          adminNotes={productAdminNotes}
                          setAdminNotes={setProductAdminNotes}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Usuários */}
              {activeTab === "usuarios" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={18} className="text-[#ef7c2c]" />
                    Usuários
                  </h3>

                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por nome ou email..."
                    id="admin-user-search-input"
                    aria-label="Buscar usuários por nome ou e-mail"
                    className={inputBase + " mb-4"}
                  />

                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-[#141211] rounded-2xl border border-[#22201e]">
                      <Users size={40} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-surface-400 text-sm">Nenhum usuário encontrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((u) => (
                        <UserCard
                          key={u.uid}
                          u={u}
                          onToggleRole={handleToggleRole}
                          onToggleVerified={handleToggleVerified}
                          onToggleProfessional={handleToggleProfessional}
                          onToggleTeacher={handleToggleTeacher}
                          toggling={togglingUser}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" className="text-[#ef7c2c]">
      <path fill="currentColor" d="M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19 23.06 18.86 46 25.27 47 25.53a8 8 0 0 0 4.2 0c1-.26 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m-40.58 62.26-40 40a8 8 0 0 1-11.32 0l-16-16a8 8 0 0 1 11.32-11.32L124 124.69l34.34-34.35a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
}
