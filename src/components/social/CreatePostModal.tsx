"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Camera,
  YoutubeLogo,
  SoundcloudLogo,
  Upload,
  X,
  MapPin,
  SpinnerGap,
  PaperPlaneTilt,
  Warning,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createPost,
  canUploadPhotos,
  extractYoutubeId,
  getYoutubeEmbedUrl,
  getSoundcloudEmbedUrl,
} from "../../lib/socialService";
import type { TaggedUser } from "../../lib/roles";
import UserSearchSelect from "./UserSearchSelect";

type PostType = "photo" | "youtube" | "soundcloud";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  userId: string;
  userName: string;
  userPhoto: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 2000;

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  userId,
  userName,
  userPhoto,
}: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>("photo");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);

  // Foto
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [photoQuota, setPhotoQuota] = useState<{
    current: number;
    limit: number;
  } | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubePreviewId, setYoutubePreviewId] = useState<string | null>(null);

  // SoundCloud
  const [soundcloudUrl, setSoundcloudUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega quota de fotos ao abrir
  useEffect(() => {
    if (isOpen && userId) {
      canUploadPhotos(userId, 0).then((result) => {
        setPhotoQuota({ current: result.current, limit: result.limit });
      });
    }
  }, [isOpen, userId]);

  // Verifica quota ao mudar imagens
  useEffect(() => {
    if (photoQuota && postType === "photo") {
      const wouldBeTotal = photoQuota.current + imageFiles.length;
      setQuotaExceeded(wouldBeTotal > photoQuota.limit);
    } else {
      setQuotaExceeded(false);
    }
  }, [imageFiles, photoQuota, postType]);

  // Preview do YouTube
  useEffect(() => {
    if (youtubeUrl) {
      const id = extractYoutubeId(youtubeUrl);
      setYoutubePreviewId(id);
    } else {
      setYoutubePreviewId(null);
    }
  }, [youtubeUrl]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setText("");
      setLocation("");
      setTaggedUsers([]);
      setImageFiles([]);
      setImagePreviews([]);
      setYoutubeUrl("");
      setSoundcloudUrl("");
      setPostType("photo");
      setQuotaExceeded(false);
    }
  }, [isOpen]);

  // Adiciona ficheiros de imagem com validação
  const addImages = useCallback(
    (files: FileList | File[]) => {
      const validFiles: File[] = [];
      const previews: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" não é uma imagem válida.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            `"${file.name}" excede o limite de 5MB.`
          );
          continue;
        }
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }

      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...previews]);
    },
    []
  );

  // Remove imagem
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  // Submit
  const handleSubmit = useCallback(async () => {
    // Validações
    if (postType === "photo" && imageFiles.length === 0 && !text.trim()) {
      toast.error("Adicione pelo menos uma foto ou escreva algo.");
      return;
    }
    if (postType === "youtube" && !youtubeUrl.trim()) {
      toast.error("Cole o link do YouTube.");
      return;
    }
    if (postType === "soundcloud" && !soundcloudUrl.trim()) {
      toast.error("Cole o link do SoundCloud.");
      return;
    }
    if (quotaExceeded) {
      toast.error("Limite de fotos do plano excedido.");
      return;
    }

    setSubmitting(true);
    try {
      // Verificação de quota no servidor
      if (postType === "photo" && imageFiles.length > 0) {
        const check = await canUploadPhotos(userId, imageFiles.length);
        if (!check.allowed) {
          toast.error(
            `Limite de fotos excedido. Você tem ${check.current}/${check.limit} fotos.`
          );
          setSubmitting(false);
          return;
        }
      }

      await createPost(
        userId,
        userName,
        userPhoto,
        postType,
        text.trim(),
        postType === "photo" ? imageFiles : [],
        postType === "youtube" ? youtubeUrl.trim() : null,
        postType === "soundcloud" ? soundcloudUrl.trim() : null,
        location.trim() || null,
        taggedUsers
      );

      toast.success("Publicação criada com sucesso!");
      onPostCreated();
      onClose();
    } catch (err) {
      console.error("Erro ao criar publicação:", err);
      toast.error("Erro ao publicar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }, [
    postType,
    imageFiles,
    text,
    youtubeUrl,
    soundcloudUrl,
    quotaExceeded,
    userId,
    userName,
    userPhoto,
    location,
    taggedUsers,
    onPostCreated,
    onClose,
  ]);

  if (!isOpen) return null;

  const tabs: { type: PostType; icon: React.ReactNode; label: string }[] = [
    { type: "photo", icon: <Camera size={16} weight="fill" />, label: "Foto" },
    {
      type: "youtube",
      icon: <YoutubeLogo size={16} weight="fill" />,
      label: "YouTube",
    },
    {
      type: "soundcloud",
      icon: <SoundcloudLogo size={16} weight="fill" />,
      label: "SoundCloud",
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 sm:mx-auto bg-[#0e0c0b]/98 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-surface-50 font-[family-name:var(--font-heading)]">
            Nova Publicação
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-surface-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
          {/* Tabs de tipo */}
          <div className="flex rounded-xl bg-white/4 border border-white/6 p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setPostType(tab.type)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
                  transition-all duration-200 cursor-pointer
                  ${
                    postType === tab.type
                      ? "bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white shadow-md"
                      : "text-surface-400 hover:text-surface-200 hover:bg-white/3"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== CONTEÚDO POR TIPO ===== */}

          {/* Upload de fotos */}
          {postType === "photo" && (
            <div className="space-y-3">
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  flex flex-col items-center justify-center gap-2 py-8 rounded-xl
                  border-2 border-dashed transition-all duration-200 cursor-pointer
                  ${
                    dragging
                      ? "border-[#ef7c2c] bg-[#ef7c2c]/5"
                      : "border-white/10 hover:border-white/20 bg-white/2"
                  }
                `}
              >
                <Upload
                  size={28}
                  className={`${
                    dragging ? "text-[#ef7c2c]" : "text-surface-400"
                  }`}
                />
                <p className="text-xs text-surface-400">
                  Arraste fotos ou clique para selecionar
                </p>
                <p className="text-[10px] text-surface-500">
                  Máx. 5MB por foto
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addImages(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Preview grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-white/10"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Badge de quota */}
              {photoQuota && (
                <div
                  className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg ${
                    quotaExceeded
                      ? "bg-red-500/10 border border-red-500/20 text-red-400"
                      : "bg-white/3 border border-white/6 text-surface-400"
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>
                    {photoQuota.current + imageFiles.length}/
                    {photoQuota.limit} fotos utilizadas
                  </span>
                  {quotaExceeded && (
                    <Warning size={14} className="text-red-400 ml-auto" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* YouTube URL */}
          {postType === "youtube" && (
            <div className="space-y-3">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="input-field text-sm"
              />

              {/* Preview */}
              {youtubePreviewId && (
                <div
                  className="relative w-full overflow-hidden rounded-xl border border-white/6"
                  style={{ paddingTop: "56.25%" }}
                >
                  <iframe
                    src={getYoutubeEmbedUrl(youtubePreviewId)}
                    title="Preview YouTube"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* SoundCloud URL */}
          {postType === "soundcloud" && (
            <div className="space-y-3">
              <input
                type="url"
                value={soundcloudUrl}
                onChange={(e) => setSoundcloudUrl(e.target.value)}
                placeholder="https://soundcloud.com/artista/faixa"
                className="input-field text-sm"
              />

              {/* Preview */}
              {soundcloudUrl.includes("soundcloud.com") && (
                <div
                  className="relative w-full overflow-hidden rounded-xl border border-white/6"
                  style={{ height: "166px" }}
                >
                  <iframe
                    src={getSoundcloudEmbedUrl(soundcloudUrl)}
                    title="Preview SoundCloud"
                    allow="autoplay"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* ===== CAMPOS COMUNS ===== */}

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= MAX_TEXT_LENGTH)
                  setText(e.target.value);
              }}
              placeholder="Escreva algo..."
              rows={3}
              className="input-field text-sm resize-none"
            />
            <span
              className={`absolute bottom-2 right-3 text-[10px] ${
                text.length > MAX_TEXT_LENGTH * 0.9
                  ? "text-red-400"
                  : "text-surface-500"
              }`}
            >
              {text.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>

          {/* Localização */}
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Onde está a tocar?"
              className="input-field pl-9 text-sm"
              maxLength={100}
            />
          </div>

          {/* Marcar pessoas */}
          <UserSearchSelect
            selectedUsers={taggedUsers}
            onChange={setTaggedUsers}
            excludeUserId={userId}
          />
        </div>

        {/* Footer com botões */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06] bg-[#0c0a09]/50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="btn-ghost text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || quotaExceeded}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="fill" />
            )}
            {submitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
