"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Phone,
  Wrench,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ServiceList } from "@/components/luthier/ServiceList";
import { AppointmentForm } from "@/components/luthier/AppointmentForm";
import { useLuthier } from "@/hooks/useLuthier";
import { formatDate } from "@/lib/utils";
import type { LuthierService } from "@/types";

export default function LuthierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { luthier, loading } = useLuthier(id);
  const [selectedService, setSelectedService] = useState<LuthierService | null>(null);
  const [showAppointment, setShowAppointment] = useState(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="shimmer h-64 rounded-2xl mb-6" />
        <div className="shimmer h-48 rounded-2xl" />
      </div>
    );
  }

  if (!luthier) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-surface-300">Luthier não encontrado</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/luthier")}>
          Ver todos os luthiers
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <button onClick={() => router.back()} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} />
        Voltar
      </button>

      <Card padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar src={luthier.photo} name={luthier.name} size="xl" className="w-20 h-20 text-xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-heading font-bold">{luthier.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {luthier.city}, {luthier.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} weight="fill" className="text-amber-400" />
                    {luthier.averageRating.toFixed(1)} ({luthier.totalReviews} avaliações)
                  </span>
                </div>
              </div>
              <Badge variant={luthier.available ? "success" : "default"}>
                {luthier.available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            <p className="text-sm text-surface-300 mt-3 leading-relaxed">{luthier.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {luthier.specialties.map((s, i) => (
                <Badge key={i} variant="gold">{s}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button variant="secondary" size="sm">
                <Phone size={14} />
                {luthier.phone}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench size={18} />
          Serviços
        </h2>
        <ServiceList
          services={luthier.services}
          onSchedule={(service) => {
            setSelectedService(service);
            setShowAppointment(true);
          }}
        />
      </section>

      {luthier.portfolio.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon size={18} />
            Portfólio
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {luthier.portfolio.map((item) => (
              <Card key={item.id} padding="sm">
                <h3 className="text-sm font-medium mb-2">{item.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-surface-400 mb-1">Antes</p>
                    <img
                      src={item.beforeImage}
                      alt="Antes"
                      className="rounded-lg w-full aspect-square object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-400 mb-1">Depois</p>
                    <img
                      src={item.afterImage}
                      alt="Depois"
                      className="rounded-lg w-full aspect-square object-cover"
                    />
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-surface-400 mt-2">{item.description}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {luthier.reviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={18} />
            Avaliações
          </h2>
          <div className="space-y-3">
            {luthier.reviews.map((review) => (
              <Card key={review.id} padding="md" hover={false}>
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{review.userName}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        weight={i < review.rating ? "fill" : "regular"}
                        className={i < review.rating ? "text-amber-400" : "text-surface-500"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-surface-300 mt-1">{review.comment}</p>
                <p className="text-[11px] text-surface-500 mt-1">{formatDate(review.createdAt)}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Modal
        open={showAppointment}
        onClose={() => { setShowAppointment(false); setSelectedService(null); }}
        title="Agendar Serviço"
        size="sm"
      >
        <AppointmentForm
          luthierId={luthier.id}
          luthierName={luthier.name}
          service={selectedService}
          onClose={() => { setShowAppointment(false); setSelectedService(null); }}
        />
      </Modal>
    </div>
  );
}
