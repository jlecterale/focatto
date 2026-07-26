"use client";

import { useState, useCallback } from "react";
import {
  Pencil,
  Trash,
  Plus,
  X,
  Upload,
  SpinnerGap,
  MusicNotes,
  Check,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  uploadEquipmentImage,
  deleteEquipmentImage,
} from "../../lib/socialService";
import type { EquipmentItem } from "../../lib/roles";
import { SOCIAL_EQUIPMENT_LIMITS } from "../../lib/roles";

interface EquipmentManagerProps {
  userId: string;
  equipments: EquipmentItem[];
  onUpdate: (equipments: EquipmentItem[]) => void;
  planTier?: string;
}

interface EditingState {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  newImageFile: File | null;
  newImagePreview: string | null;
}

export default function EquipmentManager({
  userId,
  equipments,
  onUpdate,
  planTier = "free",
}: EquipmentManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditingState | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<EditingState>({
    id: "",
    name: "",
    description: "",
    imageUrl: null,
    newImageFile: null,
    newImagePreview: null,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const maxEquipments =
    SOCIAL_EQUIPMENT_LIMITS[planTier] ?? SOCIAL_EQUIPMENT_LIMITS.free;
  const canAdd = equipments.length < maxEquipments;

  // Inicia edição inline
  const startEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setEditState({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      newImageFile: null,
      newImagePreview: null,
    });
    setAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  // Salva edição de um equipamento existente
  const saveEdit = useCallback(async () => {
    if (!editState || !editState.name.trim()) {
      toast.error("Nome do equipamento é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editState.imageUrl;

      // Upload de nova imagem se houver
      if (editState.newImageFile) {
        imageUrl = await uploadEquipmentImage(userId, editState.newImageFile);
        // Remove imagem antiga se existia
        if (editState.imageUrl) {
          await deleteEquipmentImage(editState.imageUrl);
        }
      }

      const updated = equipments.map((eq) =>
        eq.id === editState.id
          ? {
              ...eq,
              name: editState.name.trim(),
              description: editState.description.trim(),
              imageUrl,
            }
          : eq
      );
      onUpdate(updated);
      setEditingId(null);
      setEditState(null);
      toast.success("Equipamento atualizado!");
    } catch (err) {
      console.error("Erro ao salvar equipamento:", err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [editState, equipments, onUpdate, userId]);

  // Adiciona novo equipamento
  const saveNew = useCallback(async () => {
    if (!newItem.name.trim()) {
      toast.error("Nome do equipamento é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (newItem.newImageFile) {
        imageUrl = await uploadEquipmentImage(userId, newItem.newImageFile);
      }

      const item: EquipmentItem = {
        id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        imageUrl,
        createdAt: Date.now(),
      };
      onUpdate([...equipments, item]);
      setAddingNew(false);
      setNewItem({
        id: "",
        name: "",
        description: "",
        imageUrl: null,
        newImageFile: null,
        newImagePreview: null,
      });
      toast.success("Equipamento adicionado!");
    } catch (err) {
      console.error("Erro ao adicionar equipamento:", err);
      toast.error("Erro ao adicionar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [newItem, equipments, onUpdate, userId]);

  // Elimina equipamento
  const handleDelete = useCallback(
    async (id: string) => {
      const item = equipments.find((eq) => eq.id === id);
      if (!item) return;

      setSaving(true);
      try {
        if (item.imageUrl) {
          await deleteEquipmentImage(item.imageUrl);
        }
        const updated = equipments.filter((eq) => eq.id !== id);
        onUpdate(updated);
        setConfirmDeleteId(null);
        toast.success("Equipamento removido.");
      } catch (err) {
        console.error("Erro ao remover equipamento:", err);
        toast.error("Erro ao remover. Tente novamente.");
      } finally {
        setSaving(false);
      }
    },
    [equipments, onUpdate]
  );

  // Handler de seleção de imagem
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "edit" | "new"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }
    const preview = URL.createObjectURL(file);
    if (target === "edit" && editState) {
      setEditState({ ...editState, newImageFile: file, newImagePreview: preview });
    } else {
      setNewItem((prev) => ({ ...prev, newImageFile: file, newImagePreview: preview }));
    }
  };

  // Remove imagem do estado
  const removeImage = async (target: "edit" | "new") => {
    if (target === "edit" && editState) {
      // Marcar para remoção (imageUrl null e sem nova imagem)
      setEditState({
        ...editState,
        imageUrl: null,
        newImageFile: null,
        newImagePreview: null,
      });
    } else {
      setNewItem((prev) => ({
        ...prev,
        newImageFile: null,
        newImagePreview: null,
      }));
    }
  };

  // Renderiza formulário inline de edição/criação
  const renderForm = (
    state: EditingState,
    onChange: (updates: Partial<EditingState>) => void,
    onSave: () => void,
    onCancel: () => void,
    target: "edit" | "new"
  ) => (
    <div className="glass rounded-xl p-4 space-y-3 animate-scale-in">
      <input
        type="text"
        value={state.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Nome do equipamento"
        className="input-field text-sm"
        maxLength={100}
      />
      <input
        type="text"
        value={state.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Descrição breve (opcional)"
        className="input-field text-sm"
        maxLength={200}
      />

      {/* Imagem */}
      <div className="flex items-center gap-3">
        {(state.newImagePreview || state.imageUrl) ? (
          <div className="relative group">
            <img
              src={state.newImagePreview || state.imageUrl!}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover border border-white/10"
            />
            <button
              type="button"
              onClick={() => removeImage(target)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/4 border border-dashed border-white/10 hover:border-[#ef7c2c]/30 text-surface-400 hover:text-surface-200 text-xs cursor-pointer transition-colors">
            <Upload size={14} />
            Foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e, target)}
            />
          </label>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary text-xs py-2 px-3 disabled:opacity-50"
        >
          {saving ? (
            <SpinnerGap size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Salvar
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="btn-ghost text-xs py-2 px-3"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Badge de limite */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-surface-100 flex items-center gap-2">
          <MusicNotes size={16} className="text-[#ef7c2c]" />
          Meus Equipamentos
        </h4>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            equipments.length >= maxEquipments
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20"
          }`}
        >
          {equipments.length}/{maxEquipments}
        </span>
      </div>

      {/* Lista de equipamentos */}
      {equipments.length === 0 && !addingNew && (
        <div className="flex flex-col items-center py-8 text-center text-surface-400 gap-2">
          <MusicNotes size={32} className="opacity-30" />
          <p className="text-xs">Nenhum equipamento cadastrado.</p>
        </div>
      )}

      {equipments.map((item) => (
        <div key={item.id}>
          {editingId === item.id && editState ? (
            renderForm(
              editState,
              (updates) => setEditState({ ...editState, ...updates }),
              saveEdit,
              cancelEdit,
              "edit"
            )
          ) : (
            <div className="glass rounded-xl p-3 flex items-center gap-3 group card-hover">
              {/* Thumbnail */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-surface-700 border border-white/6 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={20} className="text-surface-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-surface-100 truncate">
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-xs text-surface-400 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => startEdit(item)}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-surface-300 hover:text-white transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1 animate-scale-in">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={saving}
                      className="h-8 px-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-surface-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-surface-300 hover:text-red-400 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Formulário de novo equipamento */}
      {addingNew &&
        renderForm(
          newItem,
          (updates) => setNewItem((prev) => ({ ...prev, ...updates })),
          saveNew,
          () => {
            setAddingNew(false);
            setNewItem({
              id: "",
              name: "",
              description: "",
              imageUrl: null,
              newImageFile: null,
              newImagePreview: null,
            });
          },
          "new"
        )}

      {/* Botão adicionar */}
      {!addingNew && canAdd && (
        <button
          onClick={() => {
            setAddingNew(true);
            cancelEdit();
          }}
          className="btn-secondary w-full text-sm"
        >
          <Plus size={16} />
          Adicionar Equipamento
        </button>
      )}

      {!canAdd && !addingNew && (
        <p className="text-[10px] text-surface-500 text-center">
          Limite de equipamentos atingido. Faça upgrade do plano para adicionar
          mais.
        </p>
      )}
    </div>
  );
}
