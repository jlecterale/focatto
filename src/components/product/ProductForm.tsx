"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple, X, Image as ImageIcon } from "@phosphor-icons/react";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { compressImage, cn } from "@/lib/utils";
import type { Category, Subcategory, Condition, Handedness, ListingType } from "@/types";

const categories: { value: Category; label: string }[] = [
  { value: "instrumentos", label: "Instrumentos" },
  { value: "acessorios", label: "Acessórios" },
  { value: "luthier", label: "Luthier" },
];

const subcategories: Record<Category, { value: Subcategory; label: string }[]> = {
  instrumentos: [
    { value: "guitarra", label: "Guitarra" },
    { value: "baixo", label: "Baixo" },
    { value: "bateria", label: "Bateria" },
    { value: "teclado", label: "Teclado" },
    { value: "violao", label: "Violão" },
    { value: "sopros", label: "Sopros" },
    { value: "outros", label: "Outros" },
  ],
  acessorios: [
    { value: "pedais", label: "Pedais / Efeitos" },
    { value: "cabos", label: "Cabos" },
    { value: "cordas", label: "Cordas" },
    { value: "captadores", label: "Captadores" },
    { value: "cases", label: "Cases / Bag" },
    { value: "palhetas", label: "Palhetas" },
    { value: "outros", label: "Outros" },
  ],
  luthier: [
    { value: "outros", label: "Outros" },
  ],
};

const conditions: { value: Condition; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "como_novo", label: "Como Novo" },
  { value: "excelente", label: "Excelente" },
  { value: "bom", label: "Bom" },
  { value: "desgastado", label: "Desgastado" },
  { value: "restauro", label: "Para Restauro" },
];

interface ProductFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initial?: Partial<FormData>;
}

interface FormData {
  title: string;
  description: string;
  category: Category;
  subcategory: Subcategory;
  brand: string;
  model: string;
  year: string;
  color: string;
  condition: Condition;
  handedness: Handedness;
  listingType: ListingType;
  price: string;
  acceptsTrade: boolean;
  acceptsProposal: boolean;
  shipping: string;
  city: string;
  state: string;
  images: File[];
}

const defaultForm: FormData = {
  title: "", description: "", category: "instrumentos", subcategory: "guitarra",
  brand: "", model: "", year: "", color: "", condition: "bom", handedness: "destro",
  listingType: "venda", price: "", acceptsTrade: false, acceptsProposal: false,
  shipping: "", city: "", state: "", images: [],
};

export function ProductForm({ onSubmit, initial }: ProductFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ ...defaultForm, ...initial });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const update = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 7 - form.images.length);
    const compressed = await Promise.all(
      fileArray.map((f) => compressImage(f, 1200, 0.85))
    );
    const previews = compressed.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
    update("images", [...form.images, ...compressed]);
  }, [form.images]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    update("images", form.images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = (s: number) => {
    if (s === 1) return form.images.length > 0;
    if (s === 2) return form.title && form.brand && form.model;
    if (s === 3) return form.price && Number(form.price) > 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                s <= step
                  ? "bg-gradient-to-br from-accent to-gold-500 text-white"
                  : "bg-white/5 text-surface-400"
              )}
            >
              {s}
            </div>
            <span className={cn("text-sm hidden sm:block", s <= step ? "text-surface-50" : "text-surface-500")}>
              {s === 1 ? "Fotos" : s === 2 ? "Detalhes" : "Preço"}
            </span>
            {s < 3 && <div className={cn("flex-1 h-px", s < step ? "bg-accent" : "bg-white/5")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold">Adicione fotos do seu produto</h3>
          <p className="text-sm text-surface-400">Até 7 imagens. A primeira será a capa do anúncio.</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files); }}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              dragOver ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/20"
            )}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            />
            <UploadSimple size={32} className="mx-auto mb-3 text-surface-400" />
            <p className="font-medium">Arraste fotos ou clique para selecionar</p>
            <p className="text-sm text-surface-400 mt-1">JPG, PNG ou WebP</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-medium rounded bg-accent/80 text-white">
                      CAPA
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold">Detalhes do produto</h3>
          <Input label="Título do anúncio" placeholder="Ex: Fender Stratocaster American Standard 2008" value={form.title} onChange={(e) => update("title", e.target.value)} />
          <Textarea label="Descrição" placeholder="Descreva o estado, histórico, modificações..." value={form.description} onChange={(e) => update("description", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoria" value={form.category} onChange={(e) => update("category", e.target.value)} options={categories} />
            <Select label="Subcategoria" value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} options={subcategories[form.category]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" placeholder="Fender, Gibson, Yamaha..." value={form.brand} onChange={(e) => update("brand", e.target.value)} />
            <Input label="Modelo" placeholder="Stratocaster, Les Paul..." value={form.model} onChange={(e) => update("model", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ano de fabricação" type="number" placeholder="Ex: 2008" value={form.year} onChange={(e) => update("year", e.target.value)} />
            <Input label="Cor" placeholder="Ex: Sunburst" value={form.color} onChange={(e) => update("color", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Condição" value={form.condition} onChange={(e) => update("condition", e.target.value)} options={conditions} />
            <Select label="Destinatário" value={form.handedness} onChange={(e) => update("handedness", e.target.value)} options={[{ value: "destro", label: "Destro" }, { value: "canhoto", label: "Canhoto" }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <Input label="Estado" placeholder="SP" value={form.state} onChange={(e) => update("state", e.target.value)} maxLength={2} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold">Preço e envio</h3>
          <Input label="Preço (R$)" type="number" placeholder="0,00" value={form.price} onChange={(e) => update("price", e.target.value)} />
          <Input label="Valor do frete (R$) - opcional" type="number" placeholder="0,00" value={form.shipping} onChange={(e) => update("shipping", e.target.value)} />
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptsTrade} onChange={(e) => update("acceptsTrade", e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-accent" />
              <span className="text-sm text-surface-200">Aceito trocas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptsProposal} onChange={(e) => update("acceptsProposal", e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-accent" />
              <span className="text-sm text-surface-200">Aceito propostas</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext(step)}>
            Continuar
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} disabled={!canNext(3)}>
            Publicar Anúncio
          </Button>
        )}
      </div>
    </div>
  );
}
