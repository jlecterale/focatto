"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserData, updateUserProfile, uploadProfilePhoto, submitVerificationRequest, getTeacherProfile, updateTeacherProfile } from "../../lib/userService";
import type { UserData, VerificationStatus } from "../../lib/roles";
import Link from "next/link";
import {
  Compass,
  SignOut,
  User,
  Phone,
  IdentificationCard,
  MapPin,
  PencilSimple,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Camera,
  FileImage,
  Spinner,
  Package,
  GraduationCap,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TEACHER_SPECIALTIES_LIST = [
  "Violão", "Guitarra", "Baixo", "Bateria", "Canto / Técnica Vocal",
  "Teclado / Piano", "Violino", "Saxofone", "Flauta", "Teoria Musical",
  "Produção Musical / Home Studio", "Outro"
];

const TEACHER_LEVELS_LIST = ["Iniciante", "Intermediário", "Avançado"];
const TEACHER_MODALITIES_LIST = ["Presencial", "Online"];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [bio, setBio] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Verification
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string>("");
  const [facePreview, setFacePreview] = useState<string>("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Premium plans states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumBilling, setPremiumBilling] = useState<"monthly" | "yearly">("yearly");
  const [premiumTier, setPremiumTier] = useState<1 | 2>(1); // default to 1 (Pro / Complete)
  const [submittingPremium, setSubmittingPremium] = useState(false);

  // Teacher profile states
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherSpecialties, setTeacherSpecialties] = useState<string[]>([]);
  const [teacherPricePerHour, setTeacherPricePerHour] = useState("");
  const [teacherLevels, setTeacherLevels] = useState<string[]>([]);
  const [teacherModalities, setTeacherModalities] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getUserData(user.uid);
      if (data) {
        setProfile(data);
        setDisplayName(data.displayName);
        setPhone(data.phone);
        setCpfCnpj(data.cpfCnpj);
        setBio(data.bio);
        setCep(data.address.cep);
        setStreet(data.address.street);
        setNumber(data.address.number);
        setComplement(data.address.complement);
        setNeighborhood(data.address.neighborhood);
        setCity(data.address.city);
        setState(data.address.state);

        if (data.isTeacher) {
          const tData = await getTeacherProfile(user.uid);
          if (tData) {
            setTeacherBio(tData.bio || "");
            setTeacherSpecialties(tData.specialties || []);
            setTeacherPricePerHour(tData.pricePerHour ? String(tData.pricePerHour) : "");
            setTeacherLevels(tData.levels || []);
            setTeacherModalities(tData.modalities || []);
          }
        }
      }
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        phone,
        cpfCnpj,
        bio,
        address: { cep, street, number, complement, neighborhood, city, state },
      });

      if (profile.isTeacher) {
        await updateTeacherProfile(user.uid, {
          userEmail: user.email || "",
          userName: displayName,
          phone,
          bio: teacherBio,
          city,
          state,
          neighborhood,
          photoURL: profile.photoURL || "",
          specialties: teacherSpecialties,
          pricePerHour: teacherPricePerHour ? Number(teacherPricePerHour) : 0,
          levels: teacherLevels,
          modalities: teacherModalities,
        });
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName,
              phone,
              cpfCnpj,
              bio,
              address: { cep, street, number, complement, neighborhood, city, state },
              updatedAt: Date.now(),
            }
          : prev,
      );
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      setProfile((prev) => {
        if (prev?.isTeacher) {
          updateTeacherProfile(user.uid, { photoURL: url });
        }
        return prev ? { ...prev, photoURL: url } : prev;
      });
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleDocumentSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentPreview(URL.createObjectURL(file));
    }
  }

  function handleFaceSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFaceFile(file);
      setFacePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmitVerification() {
    if (!user || !documentFile || !faceFile) {
      toast.error("Selecione o documento e a foto do rosto.");
      return;
    }
    setSubmittingVerification(true);
    try {
      await submitVerificationRequest(
        user.uid,
        user.email || "",
        profile?.displayName || "",
        documentFile,
        faceFile,
      );
      setProfile((prev) => (prev ? { ...prev, verificationStatus: "pending" } : prev));
      toast.success("Solicitação de verificação enviada!");
      setShowVerificationModal(false);
      setDocumentFile(null);
      setFaceFile(null);
      setDocumentPreview("");
      setFacePreview("");
    } catch {
      toast.error("Erro ao enviar verificação.");
    } finally {
      setSubmittingVerification(false);
    }
  }

  async function handleSubscribePremium() {
    if (!user || !profile) return;
    setSubmittingPremium(true);
    try {
      const isYearly = premiumBilling === "yearly";
      const updatedData = {
        isPremium: true,
        premiumTier: premiumTier === 1 ? "tier1" : "tier2",
        premiumBilling: premiumBilling,
        isVerified: true,
        verificationStatus: "approved" as VerificationStatus,
      };

      await updateUserProfile(user.uid, updatedData as any);

      setProfile((prev) => prev ? { ...prev, ...updatedData } as any : prev);
      toast.success(`Plano Focatto ${premiumTier === 1 ? "Pro" : "Plus"} (${isYearly ? "Anual" : "Mensal"}) ativado!`);
      setShowPremiumModal(false);
    } catch {
      toast.error("Erro ao ativar plano premium.");
    } finally {
      setSubmittingPremium(false);
    }
  }

  async function handleCancelPremium() {
    if (!user || !profile) return;
    try {
      const updatedData = {
        isPremium: false,
        premiumTier: "",
        premiumBilling: "",
      };

      await updateUserProfile(user.uid, updatedData as any);

      setProfile((prev) => {
        if (!prev) return null;
        const newProf = { ...prev };
        delete (newProf as any).premiumTier;
        delete (newProf as any).premiumBilling;
        return { ...newProf, isPremium: false };
      });

      toast.success("Assinatura cancelada com sucesso!");
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <p className="text-surface-400">Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <Spinner size={24} className="animate-spin text-[#ef7c2c]" />
      </div>
    );
  }

  const inputBase =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  const verificationBadge = () => {
    switch (profile?.verificationStatus) {
      case "approved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle size={14} weight="fill" />
            Verificado
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Clock size={14} weight="fill" />
            Pendente
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
            <XCircle size={14} weight="fill" />
            Reprovado
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-surface-400 font-semibold">
            <ShieldCheck size={14} />
            Não verificado
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans">
      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center flex-shrink-0">
              <Compass size={18} weight="bold" className="text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-white">Meu Perfil</h1>
              <p className="text-[10px] text-surface-400 hidden sm:block">Focattolecter</p>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/"
              id="profile-back-btn"
              className="text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827]"
            >
              Voltar
            </Link>
            <Link
              href="/meus-anuncios"
              id="profile-anuncios-btn"
              className="flex items-center gap-1.5 text-xs text-[#ef7c2c] hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#ef7c2c]/30 hover:border-[#ef7c2c]/60"
            >
              <Package size={14} />
              <span className="hidden sm:inline">Meus Anúncios</span>
              <span className="sm:hidden">Anúncios</span>
            </Link>
            <button
              onClick={logout}
              id="profile-logout-btn"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-[#2a2827] hover:border-[#ef7c2c]/30"
            >
              <SignOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Photo + Name Section */}
        <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] flex items-center gap-5">
          <div className="relative group">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              id="profile-photo-upload-trigger-btn"
              aria-label="Alterar foto de perfil"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#ef7c2c] flex items-center justify-center hover:bg-[#d96e1f] transition-colors disabled:opacity-60"
            >
              {uploadingPhoto ? (
                <Spinner size={14} className="animate-spin" />
              ) : (
                <Camera size={14} weight="fill" />
              )}
            </button>
            <input
              ref={photoInputRef}
              id="profile-photo-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              aria-label="Alterar foto de perfil"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{profile?.displayName || "Sem nome"}</h2>
            <p className="text-sm text-surface-400 truncate">{user.email}</p>
            <div className="mt-1.5">{verificationBadge()}</div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Dados Pessoais</h3>
            <PencilSimple size={16} className="text-surface-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="profile-name-input" className="block text-xs text-surface-400 mb-1.5">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  id="profile-name-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-phone-input" className="block text-xs text-surface-400 mb-1.5">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  id="profile-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-cpf-cnpj-input" className="block text-xs text-surface-400 mb-1.5">CPF / CNPJ</label>
              <div className="relative">
                <IdentificationCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  id="profile-cpf-cnpj-input"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  placeholder="000.000.000-00"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-bio-textarea" className="block text-xs text-surface-400 mb-1.5">Bio / Descrição</label>
              <textarea
                id="profile-bio-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
                className={`${inputBase} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#ef7c2c]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Endereço</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="profile-cep-input" className="block text-xs text-surface-400 mb-1.5">CEP</label>
              <input
                type="text"
                id="profile-cep-input"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                className={inputBase}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile-street-input" className="block text-xs text-surface-400 mb-1.5">Rua</label>
              <input
                type="text"
                id="profile-street-input"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-number-input" className="block text-xs text-surface-400 mb-1.5">Número</label>
              <input
                type="text"
                id="profile-number-input"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-complement-input" className="block text-xs text-surface-400 mb-1.5">Complemento</label>
              <input
                type="text"
                id="profile-complement-input"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className={inputBase}
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="profile-neighborhood-input" className="block text-xs text-surface-400 mb-1.5">Bairro</label>
              <input
                type="text"
                id="profile-neighborhood-input"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-city-input" className="block text-xs text-surface-400 mb-1.5">Cidade</label>
              <input
                type="text"
                id="profile-city-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-state-select" className="block text-xs text-surface-400 mb-1.5">Estado</label>
              <select
                id="profile-state-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputBase}
              >
                <option value="">Selecione</option>
                {UF_LIST.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teacher Profile Section */}
        {profile?.isTeacher && (
          <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#ef7c2c]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Perfil de Professor de Música</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="teacher-bio-textarea" className="block text-xs text-surface-400 mb-1.5">Metodologia e Apresentação das Aulas</label>
                <textarea
                  id="teacher-bio-textarea"
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  placeholder="Fale sobre sua experiência didática, método de ensino, etc..."
                  rows={4}
                  className={`${inputBase} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teacher-price-input" className="block text-xs text-surface-400 mb-1.5">Preço por Hora/Aula (R$)</label>
                  <input
                    type="number"
                    id="teacher-price-input"
                    value={teacherPricePerHour}
                    onChange={(e) => setTeacherPricePerHour(e.target.value)}
                    placeholder="Ex: 80"
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs text-surface-400 mb-2">Instrumentos e Especialidades</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEACHER_SPECIALTIES_LIST.map((spec) => {
                    const isSelected = teacherSpecialties.includes(spec);
                    return (
                      <label key={spec} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        isSelected 
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                          : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherSpecialties([...teacherSpecialties, spec]);
                            } else {
                              setTeacherSpecialties(teacherSpecialties.filter((s) => s !== spec));
                            }
                          }}
                          className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                        />
                        {spec}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-surface-400 mb-2">Níveis Atendidos</span>
                  <div className="flex flex-col gap-2">
                    {TEACHER_LEVELS_LIST.map((level) => {
                      const isSelected = teacherLevels.includes(level);
                      return (
                        <label key={level} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          isSelected 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                            : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                        }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeacherLevels([...teacherLevels, level]);
                              } else {
                                setTeacherLevels(teacherLevels.filter((l) => l !== level));
                              }
                            }}
                            className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                          />
                          {level}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-surface-400 mb-2">Modalidade das Aulas</span>
                  <div className="flex flex-col gap-2">
                    {TEACHER_MODALITIES_LIST.map((mod) => {
                      const isSelected = teacherModalities.includes(mod);
                      return (
                        <label key={mod} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          isSelected 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                            : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                        }`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeacherModalities([...teacherModalities, mod]);
                              } else {
                                setTeacherModalities(teacherModalities.filter((m) => m !== mod));
                              }
                            }}
                            className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                          />
                          {mod}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          id="profile-save-btn"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? <Spinner size={16} className="animate-spin" /> : null}
          Salvar Alterações
        </button>

        {/* Assinatura Premium Section */}
        <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-4 relative overflow-hidden">
          {profile?.isPremium && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(239,124,44,0.06),transparent_50%)] pointer-events-none" />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#ef7c2c]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Plano de Assinatura</h3>
            </div>
            
            {profile?.isPremium ? (
              <span className="flex items-center gap-1.5 text-xs text-[#ef7c2c] font-semibold bg-[#ef7c2c]/10 px-2.5 py-1 rounded-full border border-[#ef7c2c]/20">
                ★ Focatto {profile.premiumTier === "tier1" ? "Pro" : "Plus"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-surface-400 font-semibold bg-surface-800 px-2.5 py-1 rounded-full border border-surface-700">
                Plano Gratuito
              </span>
            )}
          </div>

          {profile?.isPremium ? (
            <div className="space-y-3">
              <p className="text-xs text-surface-300 leading-relaxed">
                Você é um membro <strong>{profile.premiumTier === "tier1" ? "Focatto Pro (Completo)" : "Focatto Plus"}</strong>!
                Sua assinatura está ativa via faturamento <strong>{profile.premiumBilling === "yearly" ? "Anual" : "Mensal"}</strong>.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="py-2 px-4 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 text-xs font-semibold hover:bg-[#ef7c2c]/20 transition-colors"
                >
                  Alterar Plano
                </button>
                <button
                  onClick={handleCancelPremium}
                  className="py-2 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                >
                  Cancelar Assinatura
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-surface-400 leading-relaxed">
                Aumente suas vendas e contatos com os planos premium. Tenha até 3x mais exposição, anúncios ilimitados, WhatsApp direto no anúncio e selo verificado automático!
              </p>
              <button
                onClick={() => {
                  setPremiumTier(1);
                  setPremiumBilling("yearly");
                  setShowPremiumModal(true);
                }}
                id="profile-upgrade-premium-btn"
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold hover:shadow-[0_4px_15px_rgba(239,124,44,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Quero ser Premium
              </button>
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#ef7c2c]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Verificação de Conta</h3>
            </div>
            {verificationBadge()}
          </div>

          <p className="text-xs text-surface-400 leading-relaxed">
            Envie uma foto do seu documento (RG, CNH ou CPF) e uma selfie para confirmar sua identidade.
            A verificação é analisada manualmente pela nossa equipe.
          </p>

          {profile?.verificationStatus === "none" || profile?.verificationStatus === "rejected" ? (
            <button
              onClick={() => setShowVerificationModal(true)}
              id="profile-request-verif-btn"
              className="py-2.5 px-5 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 text-xs font-semibold hover:bg-[#ef7c2c]/20 transition-colors"
            >
              {profile?.verificationStatus === "rejected" ? "Reenviar Documentos" : "Solicitar Verificação"}
            </button>
          ) : null}
        </div>
      </main>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-[90vw] sm:max-w-lg bg-[#0c0a09] border border-[#2a2827] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-bold text-white">Enviar Documentos</h2>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setDocumentFile(null);
                  setFaceFile(null);
                  setDocumentPreview("");
                  setFacePreview("");
                }}
                id="profile-close-verif-modal-btn"
                aria-label="Fechar modal de verificação"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-[#181615]"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 pt-4 space-y-5">
              <p className="text-xs text-surface-400">
                Suas fotos serão analisadas e armazenadas com segurança. Apenas a equipe Focattolecter terá acesso.
              </p>

              {/* Document Upload */}
              <div>
                <label htmlFor="document-photo-file-input" className="block text-xs text-surface-400 mb-2 font-medium">
                  Foto do Documento (RG, CNH ou CPF)
                </label>
                <label htmlFor="document-photo-file-input" className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-[#2a2827] bg-[#181615] cursor-pointer hover:border-[#ef7c2c]/50 transition-colors">
                  {documentPreview ? (
                    <img src={documentPreview} alt="Documento" className="h-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-surface-400">
                      <FileImage size={28} />
                      <span className="text-xs">Clique para selecionar</span>
                    </div>
                  )}
                  <input type="file" id="document-photo-file-input" accept="image/*" className="hidden" onChange={handleDocumentSelect} />
                </label>
              </div>

              {/* Face Upload */}
              <div>
                <label htmlFor="face-photo-file-input" className="block text-xs text-surface-400 mb-2 font-medium">
                  Selfie com o Documento (rosto visível)
                </label>
                <label htmlFor="face-photo-file-input" className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-[#2a2827] bg-[#181615] cursor-pointer hover:border-[#ef7c2c]/50 transition-colors">
                  {facePreview ? (
                    <img src={facePreview} alt="Selfie" className="h-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-surface-400">
                      <Camera size={28} />
                      <span className="text-xs">Clique para selecionar</span>
                    </div>
                  )}
                  <input type="file" id="face-photo-file-input" accept="image/*" className="hidden" onChange={handleFaceSelect} />
                </label>
              </div>

              <button
                onClick={handleSubmitVerification}
                disabled={submittingVerification || !documentFile || !faceFile}
                id="profile-submit-verif-btn"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingVerification ? <Spinner size={16} className="animate-spin" /> : null}
                Enviar para Análise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Checkout Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-[90vw] sm:max-w-lg bg-[#0c0a09] border border-[#2a2827] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#ef7c2c]/10 text-[#ef7c2c]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </span>
                <h2 className="text-lg font-bold text-white font-display">Upgrade de Conta - Premium</h2>
              </div>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-[#181615] transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 pb-6 pt-2 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
              
              {/* Billing Toggle (Mensal / Anual) */}
              <div className="bg-[#141211] p-1.5 rounded-xl border border-[#22201e] flex gap-2">
                <button
                  type="button"
                  onClick={() => setPremiumBilling("monthly")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    premiumBilling === "monthly"
                      ? "bg-[#181615] text-[#ef7c2c] border border-[#ef7c2c]/30 shadow-md"
                      : "text-surface-400 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setPremiumBilling("yearly")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative ${
                    premiumBilling === "yearly"
                      ? "bg-[#181615] text-[#ef7c2c] border border-[#ef7c2c]/30 shadow-md"
                      : "text-surface-400 hover:text-white"
                  }`}
                >
                  Anual
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    -R$ 5/mês
                  </span>
                </button>
              </div>

              {/* Package Options */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-surface-400 uppercase tracking-wider">Escolha seu plano:</span>
                
                {/* Tier 1: Pro (Complete Package) -> RECOMMENDED */}
                <div
                  onClick={() => setPremiumTier(1)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    premiumTier === 1
                      ? "bg-[#1d1712] border-[#ef7c2c] shadow-[0_0_15px_rgba(239,124,44,0.15)]"
                      : "bg-[#141211] border-[#22201e] hover:border-[#2a2827]"
                  }`}
                >
                  {/* Recommended Ribbon */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-[#ef7c2c] to-[#d4ae12] text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Melhor Compra
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] mt-0.5 flex-shrink-0">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Plano Pro (Pacote Completo)
                      </h4>
                      <p className="text-[11px] text-surface-400 mt-1">
                        Exposição Máxima (3.0x), anúncios ILIMITADOS, WhatsApp direto nos cards e selo "Pro".
                      </p>
                      
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-[#ef7c2c]">
                          R$ {premiumBilling === "yearly" ? "74,90" : "79,90"}
                        </span>
                        <span className="text-[10px] text-surface-500">/mês</span>
                        {premiumBilling === "yearly" && (
                          <span className="text-[10px] text-emerald-400 font-semibold ml-2">
                            (R$ 898,80 cobrado anualmente)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier 2: Plus */}
                <div
                  onClick={() => setPremiumTier(2)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    premiumTier === 2
                      ? "bg-[#17121d] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "bg-[#141211] border-[#22201e] hover:border-[#2a2827]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mt-0.5 flex-shrink-0">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2H2v10h10V2zm0 10H2v10h10V12zm10-10h-10v10h10V2zm0 10h-10v10h10V12z"/>
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Plano Plus (Intermediário)</h4>
                      <p className="text-[11px] text-surface-400 mt-1">
                        Exposição Média (1.8x), até 15 anúncios simultâneos e selo "Verificado".
                      </p>
                      
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-indigo-400">
                          R$ {premiumBilling === "yearly" ? "24,90" : "29,90"}
                        </span>
                        <span className="text-[10px] text-surface-500">/mês</span>
                        {premiumBilling === "yearly" && (
                          <span className="text-[10px] text-emerald-400 font-semibold ml-2">
                            (R$ 298,80 cobrado anualmente)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation message */}
              {premiumTier === 1 ? (
                <div className="bg-[#ef7c2c]/5 border border-[#ef7c2c]/10 p-4 rounded-2xl text-[11px] text-surface-300 leading-relaxed flex items-start gap-2.5">
                  <span className="text-[#ef7c2c] font-bold text-base select-none mt-[-2px]">🏆</span>
                  <div>
                    <strong>Recomendação Focatto:</strong> O plano <strong>Pro (Pacote Completo)</strong> é a melhor compra! Ele oferece anúncios ilimitados e o triplo de exposição, ideal para expandir seus contatos e impulsionar suas vendas. O faturamento anual economiza <strong>R$ 60,00 por ano</strong> (desconto de R$ 5,00/mês).
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl text-[11px] text-surface-300 leading-relaxed flex items-start gap-2.5">
                  <span className="text-indigo-400 font-bold text-base select-none mt-[-2px]">💡</span>
                  <div>
                    <strong>Aviso:</strong> O plano <strong>Plus</strong> oferece recursos intermediários, mas se você precisa de anúncios ilimitados ou visibilidade máxima, o plano <strong>Pro</strong> é mais vantajoso!
                  </div>
                </div>
              )}

              {/* Simulated billing note */}
              <p className="text-[10px] text-surface-500 text-center">
                * Ambiente de testes. Nenhuma cobrança real será realizada em seu cartão de crédito.
              </p>

              {/* Submit Button */}
              <button
                onClick={handleSubscribePremium}
                disabled={submittingPremium}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-bold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingPremium ? <Spinner size={16} className="animate-spin" /> : null}
                Ativar Plano {premiumTier === 1 ? "Pro" : "Plus"} {premiumBilling === "yearly" ? "Anual" : "Mensal"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
