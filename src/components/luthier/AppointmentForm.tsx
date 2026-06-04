"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { createAppointment } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { LuthierService } from "@/types";

interface AppointmentFormProps {
  luthierId: string;
  luthierName: string;
  service: LuthierService | null;
  onClose: () => void;
}

export function AppointmentForm({ luthierId, luthierName, service, onClose }: AppointmentFormProps) {
  const { user, profile } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;
    setSubmitting(true);
    try {
      await createAppointment({
        luthierId,
        luthierName,
        userId: user.uid,
        userName: profile?.name || user.displayName || "Usuário",
        userPhone: phone,
        serviceId: service.id,
        serviceName: service.name,
        description,
        date,
        time,
        status: "pending",
        createdAt: Date.now(),
      });
      toast.success("Solicitação de agendamento enviada!");
      onClose();
    } catch {
      toast.error("Erro ao enviar agendamento");
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return (
      <div className="text-center py-8 text-surface-400">
        Selecione um serviço para agendar
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass rounded-xl p-3 mb-4">
        <p className="text-sm font-medium">{service.name}</p>
        <p className="text-xs text-surface-400 mt-0.5">{service.description}</p>
      </div>

      {!user ? (
        <div className="text-center py-4 text-surface-400 text-sm">
          Faça login para agendar um horário
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <Input label="Telefone para contato" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(11) 99999-9999" />
          <Textarea label="Descrição do problema" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o que precisa ser feito no instrumento..." />
          <Button type="submit" className="w-full" loading={submitting}>
            Solicitar Agendamento
          </Button>
        </>
      )}
    </form>
  );
}
