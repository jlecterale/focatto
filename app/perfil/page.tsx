"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  PencilSimple,
  SignOut,
  MapPin,
  EnvelopeSimple,
  Phone,
} from "@phosphor-icons/react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ListingCard } from "@/components/profile/ListingCard";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useProductsBySeller } from "@/hooks/useProdutos";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useChats } from "@/hooks/useChat";
import {
  getAppointmentsByUser,
  getProposalsByUser,
  createOrUpdateUserProfile,
  deleteProduct,
} from "@/lib/db";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import type { Chat, Appointment, Proposal } from "@/types";

type Tab = "anuncios" | "favoritos" | "propostas" | "agendamentos" | "chats" | "dados";

function PerfilPageContent() {
  const { user, profile, loading: authLoading, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("anuncios");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editBio, setEditBio] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const { products, loading: productsLoading } = useProductsBySeller(user?.uid);
  const { favorites, favoriteProducts, loading: favLoading, toggleFavorite } = useFavoritos();
  const { chats, loading: chatsLoading } = useChats(user?.uid);

  useEffect(() => {
    if (!authLoading && !user) router.push("/?login=true");
  }, [user, authLoading, router]);

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && ["anuncios", "favoritos", "propostas", "agendamentos", "chats", "dados"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAppointmentsByUser(user!.uid).then(setAppointments).catch(() => {}),
      getProposalsByUser(user!.uid).then(setProposals).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditCity(profile.city || "");
      setEditState(profile.state || "");
      setEditBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await createOrUpdateUserProfile(user!.uid, {
        name: editName,
        phone: editPhone,
        city: editCity,
        state: editState,
        bio: editBio,
      });
      await refreshProfile();
      toast.success("Perfil atualizado!");
      setShowEditProfile(false);
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Anúncio removido");
    } catch {
      toast.error("Erro ao remover anúncio");
    }
  };

  const currentUser = user!;

  const otherParticipantId = activeChat
    ? activeChat.participants.find((id) => id !== currentUser.uid)
    : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="glass rounded-2xl p-5 md:p-7 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar src={profile?.photo} name={profile?.name} size="xl" className="w-16 h-16 md:w-20 md:h-20 text-xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-bold">
                  {profile?.name || currentUser.displayName || "Usuário"}
                </h1>
                <p className="text-sm text-surface-400 mt-0.5">{currentUser.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                >
                  <PencilSimple size={14} />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <SignOut size={14} />
                </Button>
              </div>
            </div>
            {profile?.bio && (
              <p className="text-sm text-surface-300 mt-2">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-surface-400">
              {profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {profile.city}
                  {profile.state && `, ${profile.state}`}
                </span>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {profile.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <EnvelopeSimple size={12} />
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        products={products}
        favorites={favoriteProducts}
        chats={chats}
        appointments={appointments}
        proposals={proposals}
      />

      {activeTab === "anuncios" && (
        <div className="space-y-3">
          {productsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-2xl" />
            ))
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-surface-400">
              <p className="font-medium">Nenhum anúncio ativo</p>
              <Button variant="secondary" className="mt-3" onClick={() => router.push("/anunciar")}>
                Criar Anúncio
              </Button>
            </div>
          ) : (
            products.map((product) => (
              <ListingCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "favoritos" && (
        <>
          {favLoading ? (
            <Skeleton height="20rem" className="rounded-2xl" />
          ) : (
            <ProductGrid products={favoriteProducts} emptyMessage="Nenhum favorito ainda" />
          )}
        </>
      )}

      {activeTab === "propostas" && (
        <div className="space-y-3">
          {loadingData ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-2xl" />
            ))
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-surface-400">
              <p className="font-medium">Nenhuma proposta</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} userId={currentUser.uid} />
            ))
          )}
        </div>
      )}

      {activeTab === "agendamentos" && (
        <div className="space-y-3">
          {loadingData ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-2xl" />
            ))
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-surface-400">
              <p className="font-medium">Nenhum agendamento</p>
              <Button variant="secondary" className="mt-3" onClick={() => router.push("/luthier")}>
                Encontrar Luthier
              </Button>
            </div>
          ) : (
            appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </div>
      )}

      {activeTab === "chats" && (
        <div className="grid md:grid-cols-[340px_1fr] gap-0 md:gap-4 min-h-[60vh]">
          <div className="glass rounded-2xl overflow-hidden md:block">
            <ChatList
              chats={chats}
              userId={currentUser.uid}
              onSelect={setActiveChat}
              activeChatId={activeChat?.id}
            />
          </div>
          <div className="glass rounded-2xl overflow-hidden hidden md:block">
            {activeChat && otherParticipantId ? (
              <ChatWindow
                chatId={activeChat.id}
                otherParticipantName={activeChat.participantNames[otherParticipantId] || "Usuário"}
                otherParticipantPhoto={activeChat.participantPhotos[otherParticipantId]}
                onClose={() => setActiveChat(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400 text-sm p-8 text-center">
                Selecione uma conversa para começar
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "dados" && (
        <div className="max-w-md space-y-4">
          <Input label="Nome" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label="Telefone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(11) 99999-9999" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
            <Input label="Estado" value={editState} onChange={(e) => setEditState(e.target.value)} maxLength={2} />
          </div>
          <Input label="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Fale sobre você..." />
          <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
        </div>
      )}

      <Modal open={showEditProfile} onClose={() => setShowEditProfile(false)} title="Editar Perfil" size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label="Telefone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
            <Input label="Estado" value={editState} onChange={(e) => setEditState(e.target.value)} maxLength={2} />
          </div>
          <Input label="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} />
          <Button className="w-full" onClick={handleSaveProfile}>Salvar</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="shimmer h-48 rounded-2xl mb-6" />
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    }>
      <PerfilPageContent />
    </Suspense>
  );
}

function ProposalCard({ proposal, userId }: { proposal: Proposal; userId: string }) {
  const isSent = proposal.senderId === userId;
  const statusLabels: Record<string, { label: string; variant: "warning" | "success" | "danger" | "info" }> = {
    pending: { label: "Pendente", variant: "warning" },
    accepted: { label: "Aceita", variant: "success" },
    rejected: { label: "Recusada", variant: "danger" },
    countered: { label: "Contra-proposta", variant: "info" },
  };
  const status = statusLabels[proposal.status];

  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      {proposal.productImage && (
        <img src={proposal.productImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{proposal.productTitle}</p>
        <p className="text-xs text-surface-400">
          {isSent ? `Para: ${proposal.receiverName}` : `De: ${proposal.senderName}`}
        </p>
        <p className="text-sm font-bold gradient-text mt-0.5">
          {proposal.status === "countered" && proposal.counterAmount
            ? `Contra-proposta: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposal.counterAmount)}`
            : `Proposta: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposal.amount)}`}
        </p>
      </div>
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
        status.variant === "warning" ? "bg-orange-500/15 text-orange-300 border-orange-500/20" :
        status.variant === "success" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" :
        status.variant === "danger" ? "bg-red-500/15 text-red-300 border-red-500/20" :
        "bg-blue-500/15 text-blue-300 border-blue-500/20"
      }`}>
        {status.label}
      </span>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const statusLabels: Record<string, { label: string; variant: "warning" | "success" | "danger" | "info" }> = {
    pending: { label: "Pendente", variant: "warning" },
    confirmed: { label: "Confirmado", variant: "success" },
    cancelled: { label: "Cancelado", variant: "danger" },
    completed: { label: "Concluído", variant: "info" },
  };
  const status = statusLabels[appointment.status];

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{appointment.serviceName}</p>
          <p className="text-xs text-surface-400 mt-0.5">{appointment.luthierName}</p>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
          status.variant === "warning" ? "bg-orange-500/15 text-orange-300 border-orange-500/20" :
          status.variant === "success" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" :
          status.variant === "danger" ? "bg-red-500/15 text-red-300 border-red-500/20" :
          "bg-blue-500/15 text-blue-300 border-blue-500/20"
        }`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
        <span>{appointment.date} às {appointment.time}</span>
        {appointment.description && <span className="truncate">{appointment.description}</span>}
      </div>
    </div>
  );
}
