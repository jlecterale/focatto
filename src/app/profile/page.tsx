"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserData,
  getUserPrivateData,
  setUserPrivateData,
  updateUserProfile,
  uploadProfilePhoto,
  submitVerificationRequest,
  getTeacherProfile,
  updateTeacherProfile,
  getLuthierProfile,
  updateLuthierProfile,
} from "../../lib/userService";
import {
  getReceivedProposals,
  updateProposalStatus,
  getUserProducts,
  getUserFavorites,
  getProductById,
  toggleFavoriteProduct,
  deleteProduct,
} from "../../lib/productService";
import type { UserData, VerificationStatus, ProposalData, ProductData, FavoriteData } from "../../lib/roles";
import NotificationBell from "../../components/NotificationBell";
import ChatHeaderButton from "../../components/ChatHeaderButton";
import EquipmentManager from "@/components/social/EquipmentManager";
import ContactPanel from "@/components/social/ContactPanel";
import { updateContactOptions, updateEquipments } from "@/lib/socialService";
import type { EquipmentItem, SocialContactOptions } from "@/lib/roles";
import {
  formatPhone,
  formatCpfCnpj,
  isValidPhone,
  isValidCPF,
  isValidCNPJ,
  formatCep,
  isValidCep,
} from "../../lib/validation";
import { Smiley, MusicNote, HeartStraight, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Wrench,
  Handshake,
  CurrencyDollar, ArrowsLeftRight,
  Star,
  Trash,
  Plus,
  ArrowLeft,
  Tag,
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
const TEACHER_AUDIENCES_LIST = ["Crianças", "Adultos", "Melhor Idade", "Todas as idades"];

const LUTHIER_SPECIALTIES_LIST = [
  "Regulagem",
  "Construção",
  "Customização",
  "Pintura / Acabamento",
  "Restauro",
  "Trastes (Refret)",
  "Eletrônica",
  "Instalação de Captadores",
  "Outros",
];

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cpfCnpjError, setCpfCnpjError] = useState("");
  const [bio, setBio] = useState("");
  const [cep, setCep] = useState("");
  const [cepError, setCepError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Verification
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string>("");
  const [facePreview, setFacePreview] = useState<string>("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Seller profile states
  const [sellerAbout, setSellerAbout] = useState("");
  const [sellerMusic, setSellerMusic] = useState("");
  const [sellerHobbies, setSellerHobbies] = useState("");
  const [sellerFunFacts, setSellerFunFacts] = useState("");

  // Premium plans states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumBilling, setPremiumBilling] = useState<"monthly" | "yearly">("yearly");
  const [premiumTier, setPremiumTier] = useState<1 | 2>(1); // default to 1 (Pro / Complete)
  const [submittingPremium, setSubmittingPremium] = useState(false);

  // Activity / Role toggles
  const [isProfessional, setIsProfessional] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  // Luthier profile states
  const [luthierBio, setLuthierBio] = useState("");
  const [luthierSpecialties, setLuthierSpecialties] = useState<string[]>([]);
  const [luthierRating, setLuthierRating] = useState(5.0);

  // Teacher profile states
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherSpecialties, setTeacherSpecialties] = useState<string[]>([]);
  const [teacherPricePerHour, setTeacherPricePerHour] = useState("");
  const [teacherLevels, setTeacherLevels] = useState<string[]>([]);
  const [teacherModalities, setTeacherModalities] = useState<string[]>([]);
  const [teacherTargetAudience, setTeacherTargetAudience] = useState<string[]>([]);
  const [teacherOmb, setTeacherOmb] = useState("");

  // Dashboard and Navigation
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"anuncios" | "favoritos" | "atividades" | "propostas" | "social">("anuncios");

  // User's own ads (My Ads)
  const [userProducts, setUserProducts] = useState<ProductData[]>([]);
  const [userProductsLoading, setUserProductsLoading] = useState(true);

  // User's favorites list
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [favoritedProducts, setFavoritedProducts] = useState<ProductData[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  // Load My Ads
  const loadUserProducts = async () => {
    if (!user) return;
    setUserProductsLoading(true);
    try {
      const productsData = await getUserProducts(user.uid);
      setUserProducts(productsData);
    } catch (err) {
      console.error("Error loading user products:", err);
    } finally {
      setUserProductsLoading(false);
    }
  };

  // Load Favorites
  const loadFavorites = async () => {
    if (!user) return;
    setFavoritesLoading(true);
    try {
      const favs = await getUserFavorites(user.uid);
      setFavorites(favs);
      
      // Load details for each favorite product
      const productPromises = favs.map(async (fav) => {
        try {
          const prod = await getProductById(fav.productId);
          return prod;
        } catch {
          return null;
        }
      });
      
      const resolved = await Promise.all(productPromises);
      const validProducts = resolved.filter((p): p is ProductData => p !== null);
      setFavoritedProducts(validProducts);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Unfavorite handler
  const handleRemoveFavorite = async (productId: string, productTitle: string, sellerId: string) => {
    if (!user || !profile) return;
    try {
      const res = await toggleFavoriteProduct(
        productId,
        productTitle,
        user.uid,
        profile.displayName || user.displayName || "Usuário",
        user.email || "",
        sellerId
      );
      if (!res.favorited) {
        toast.success("Anúncio removido dos favoritos!");
        setFavoritedProducts((prev) => prev.filter((p) => p.id !== productId));
        setFavorites((prev) => prev.filter((f) => f.productId !== productId));
      }
    } catch {
      toast.error("Erro ao remover dos favoritos.");
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio permanentemente?")) return;
    try {
      await deleteProduct(productId);
      toast.success("Anúncio excluído com sucesso!");
      setUserProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      toast.error("Erro ao excluir o anúncio.");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError("");
  };

  const handlePhoneBlur = () => {
    if (phone) {
      if (!isValidPhone(phone)) {
        setPhoneError("Telefone inválido. Use o formato (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX.");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
    if (cpfCnpjError) setCpfCnpjError("");
  };

  const handleCpfCnpjBlur = () => {
    if (cpfCnpj) {
      const cleanVal = cpfCnpj.replace(/\D/g, "");
      if (cleanVal.length <= 11) {
        if (!isValidCPF(cleanVal)) {
          setCpfCnpjError("CPF inválido.");
        } else {
          setCpfCnpjError("");
        }
      } else {
        if (!isValidCNPJ(cleanVal)) {
          setCpfCnpjError("CNPJ inválido.");
        } else {
          setCpfCnpjError("");
        }
      }
    } else {
      setCpfCnpjError("");
    }
  };

  const fetchAddressByCep = async (cleanCep: string) => {
    setLoadingCep(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!res.ok) {
        throw new Error("Erro de conexão");
      }
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
      } else {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
        
        // Focus on the number input after auto-filling
        setTimeout(() => {
          numberInputRef.current?.focus();
        }, 100);
      }
    } catch {
      setCepError("Erro ao buscar o CEP. Preencha os campos manualmente.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setCepError("");

    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const handleCepBlur = () => {
    if (cep) {
      if (!isValidCep(cep)) {
        setCepError("CEP inválido. Deve conter 8 dígitos.");
      } else {
        setCepError("");
      }
    } else {
      setCepError("");
    }
  };

  function validateFields(currentPhone: string, currentCpfCnpj: string, currentCep: string): boolean {
    let isValid = true;
    
    if (currentPhone) {
      if (!isValidPhone(currentPhone)) {
        setPhoneError("Telefone inválido. Use o formato (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX.");
        isValid = false;
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }

    if (currentCpfCnpj) {
      const cleanVal = currentCpfCnpj.replace(/\D/g, "");
      if (cleanVal.length <= 11) {
        if (!isValidCPF(cleanVal)) {
          setCpfCnpjError("CPF inválido.");
          isValid = false;
        } else {
          setCpfCnpjError("");
        }
      } else {
        if (!isValidCNPJ(cleanVal)) {
          setCpfCnpjError("CNPJ inválido.");
          isValid = false;
        } else {
          setCpfCnpjError("");
        }
      }
    } else {
      setCpfCnpjError("");
    }

    if (currentCep) {
      if (!isValidCep(currentCep)) {
        setCepError("CEP inválido. Deve conter 8 dígitos.");
        isValid = false;
      } else {
        setCepError("");
      }
    } else {
      setCepError("");
    }

    return isValid;
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getUserData(user.uid);
      if (data) {
        setProfile(data);
        setDisplayName(data.displayName || "");
        setPhone(formatPhone(data.phone || ""));
        setBio(data.bio || "");
        setSellerAbout(data.sellerAbout || "");
        setSellerMusic(data.sellerMusic || "");
        setSellerHobbies(data.sellerHobbies || "");
        setSellerFunFacts(data.sellerFunFacts || "");

        // CPF/CNPJ e endereço completo moram na subcoleção privada;
        // documentos antigos ainda podem tê-los no doc público (fallback).
        const privateData = await getUserPrivateData(user.uid);
        const address = privateData?.address || data.address;
        setCpfCnpj(formatCpfCnpj(privateData?.cpfCnpj || data.cpfCnpj || ""));
        setCep(formatCep(address?.cep || ""));
        setStreet(address?.street || "");
        setNumber(address?.number || "");
        setComplement(address?.complement || "");
        setNeighborhood(address?.neighborhood || data.address?.neighborhood || "");
        setCity(address?.city || data.address?.city || "");
        setState(address?.state || data.address?.state || "");

        setIsProfessional(data.isProfessional || data.luthierStatus === "pending" || false);
        setIsTeacher(data.isTeacher || data.teacherStatus === "pending" || false);

        if (data.isTeacher || data.teacherStatus === "pending") {
          const tData = await getTeacherProfile(user.uid);
          if (tData) {
            setTeacherBio(tData.bio || "");
            setTeacherSpecialties(tData.specialties || []);
            setTeacherPricePerHour(tData.pricePerHour ? String(tData.pricePerHour) : "");
            setTeacherLevels(tData.levels || []);
            setTeacherModalities(tData.modalities || []);
            setTeacherTargetAudience(tData.targetAudience || []);
            setTeacherOmb(tData.omb || "");
          }
        }

        if (data.isProfessional || data.luthierStatus === "pending") {
          const lData = await getLuthierProfile(user.uid);
          if (lData) {
            setLuthierBio(lData.bio || "");
            setLuthierSpecialties(lData.specialties || []);
            setLuthierRating(lData.averageRating || 5.0);
          }
        }

        // Load received proposals
        try {
          const received = await getReceivedProposals(user.uid);
          setProposals(received);
        } catch (err) {
          console.error("Error loading received proposals:", err);
        } finally {
          setProposalsLoading(false);
        }

        // Load user products and favorites
        loadUserProducts();
        loadFavorites();
      }
      setLoading(false);
    })();
  }, [user]);

  async function handleRespondProposal(proposalId: string, status: "accepted" | "rejected") {
    try {
      await updateProposalStatus(proposalId, status);
      toast.success(status === "accepted" ? "Proposta aceita!" : "Proposta recusada.");
      
      // Update local state
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
      );
    } catch {
      toast.error("Erro ao atualizar proposta.");
    }
  }

  async function handleSave() {
    if (!user || !profile) return;
    
    if (!validateFields(phone, cpfCnpj, cep)) {
      toast.error("Por favor, corrija os erros no formulário antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      const nextLuthierStatus = isProfessional
        ? (profile.isProfessional ? "approved" : "pending")
        : "none";
      const nextIsProfessional = nextLuthierStatus === "approved";

      const nextTeacherStatus = isTeacher
        ? (profile.isTeacher ? "approved" : "pending")
        : "none";
      const nextIsTeacher = nextTeacherStatus === "approved";

      // O documento público mantém apenas a localização exibida no site
      // (cidade/estado/bairro); CPF/CNPJ e endereço completo vão para a
      // subcoleção privada (users/{uid}/private), legível só pelo dono e admins.
      const publicAddress = { cep: "", street: "", number: "", complement: "", neighborhood, city, state };

      await setUserPrivateData(user.uid, {
        cpfCnpj,
        address: { cep, street, number, complement, neighborhood, city, state },
      });

      await updateUserProfile(user.uid, {
        displayName,
        phone,
        cpfCnpj: "",
        bio,
        sellerAbout,
        sellerMusic,
        sellerHobbies,
        sellerFunFacts,
        address: publicAddress,
        isProfessional: nextIsProfessional,
        isTeacher: nextIsTeacher,
        luthierStatus: nextLuthierStatus,
        teacherStatus: nextTeacherStatus,
      });

      if (isTeacher) {
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
          targetAudience: teacherTargetAudience,
          omb: teacherOmb,
          status: nextTeacherStatus,
        });
      } else if (profile.isTeacher || profile.teacherStatus === "pending") {
        await updateTeacherProfile(user.uid, {
          status: "none",
        });
      }

      if (isProfessional) {
        await updateLuthierProfile(user.uid, {
          userEmail: user.email || "",
          name: displayName,
          phone,
          bio: luthierBio,
          city,
          state,
          neighborhood,
          photo: profile.photoURL || "",
          specialties: luthierSpecialties,
          averageRating: luthierRating || 5.0,
          status: nextLuthierStatus,
        });
      } else if (profile.isProfessional || profile.luthierStatus === "pending") {
        await updateLuthierProfile(user.uid, {
          status: "none",
        });
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName,
              phone,
              cpfCnpj: "",
              bio,
              sellerAbout,
              sellerMusic,
              sellerHobbies,
              sellerFunFacts,
              address: publicAddress,
              isProfessional: nextIsProfessional,
              isTeacher: nextIsTeacher,
              luthierStatus: nextLuthierStatus,
              teacherStatus: nextTeacherStatus,
              updatedAt: Date.now(),
            }
          : prev,
      );
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      // Sincroniza a foto nos perfis de professor/luthier fora do updater do
      // setState (updaters precisam ser puros) e aguardando o resultado para
      // não falhar silenciosamente.
      if (profile?.isTeacher || profile?.teacherStatus === "pending") {
        await updateTeacherProfile(user.uid, { photoURL: url });
      }
      if (profile?.isProfessional || profile?.luthierStatus === "pending") {
        await updateLuthierProfile(user.uid, { photo: url });
      }
      setProfile((prev) => (prev ? { ...prev, photoURL: url } : prev));
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
      // Revoga o object URL anterior para não vazar memória a cada seleção.
      if (documentPreview) URL.revokeObjectURL(documentPreview);
      setDocumentFile(file);
      setDocumentPreview(URL.createObjectURL(file));
    }
  }

  function handleFaceSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (facePreview) URL.revokeObjectURL(facePreview);
      setFaceFile(file);
      setFacePreview(URL.createObjectURL(file));
    }
  }

  function clearVerificationFiles() {
    if (documentPreview) URL.revokeObjectURL(documentPreview);
    if (facePreview) URL.revokeObjectURL(facePreview);
    setDocumentFile(null);
    setFaceFile(null);
    setDocumentPreview("");
    setFacePreview("");
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
      clearVerificationFiles();
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
      const updatedData: Partial<UserData> = {
        isPremium: true,
        premiumTier: premiumTier === 1 ? "tier1" : "tier2",
        premiumBilling: premiumBilling,
        isVerified: true,
        verificationStatus: "approved" as VerificationStatus,
      };

      await updateUserProfile(user.uid, updatedData);

      setProfile((prev) => (prev ? { ...prev, ...updatedData } : prev));
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
      const updatedData: Partial<UserData> = {
        isPremium: false,
        premiumTier: "",
        premiumBilling: "",
      };

      await updateUserProfile(user.uid, updatedData);

      setProfile((prev) => (prev ? { ...prev, ...updatedData } : prev));

      toast.success("Assinatura cancelada com sucesso!");
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    }
  }

  const handleSaveContactOptions = async (options: SocialContactOptions) => {
    if (!user) return;
    try {
      await updateContactOptions(user.uid, options);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          social: {
            ...prev.social,
            equipments: prev.social?.equipments || [],
            contactOptions: options,
          },
        };
      });
      toast.success("Opções de contacto salvas!");
    } catch {
      toast.error("Erro ao salvar opções de contacto.");
    }
  };

  const handleUpdateEquipments = async (newEquipments: EquipmentItem[]) => {
    if (!user) return;
    try {
      await updateEquipments(user.uid, newEquipments);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          social: {
            ...prev.social,
            contactOptions: prev.social?.contactOptions || {
              internalChatEnabled: true,
              whatsappEnabled: false,
              whatsappNumber: null,
            },
            equipments: newEquipments,
          },
        };
      });
    } catch {
      toast.error("Erro ao atualizar equipamentos.");
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <Spinner size={24} className="animate-spin text-[#ef7c2c]" />
      </div>
    );
  }

  if (!user) {
    return null;
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
            <ChatHeaderButton />
            <NotificationBell />
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
          <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white truncate">{profile?.displayName || "Sem nome"}</h2>
              <p className="text-sm text-surface-400 truncate">{user.email}</p>
              <div className="mt-1.5">{verificationBadge()}</div>
            </div>
            <div className="flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  id="profile-toggle-edit-btn"
                  className="flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 hover:bg-[#ef7c2c]/20 transition-all text-xs font-semibold cursor-pointer"
                >
                  <PencilSimple size={14} />
                  Editar Perfil
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  id="profile-toggle-back-btn"
                  className="flex items-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-[#181615] border border-[#2a2827] text-surface-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Voltar
                </button>
              )}
            </div>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-6 animate-fade-in">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#22201e] gap-1 sm:gap-2 overflow-x-auto scrollbar-none pb-px">
              <button
                onClick={() => setActiveTab("anuncios")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "anuncios"
                    ? "border-[#ef7c2c] text-white"
                    : "border-transparent text-surface-400 hover:text-white"
                }`}
              >
                <Package size={16} />
                Meus Anúncios ({userProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("favoritos")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "favoritos"
                    ? "border-[#ef7c2c] text-white"
                    : "border-transparent text-surface-400 hover:text-white"
                }`}
              >
                <HeartStraight size={16} />
                Favoritos ({favorites.length})
              </button>
              <button
                onClick={() => setActiveTab("atividades")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "atividades"
                    ? "border-[#ef7c2c] text-white"
                    : "border-transparent text-surface-400 hover:text-white"
                }`}
              >
                <Compass size={16} />
                Atividades
              </button>
              <button
                onClick={() => setActiveTab("propostas")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "propostas"
                    ? "border-[#ef7c2c] text-white"
                    : "border-transparent text-surface-400 hover:text-white"
                }`}
              >
                <Handshake size={16} />
                Propostas ({proposals.length})
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "social"
                    ? "border-[#ef7c2c] text-white"
                    : "border-transparent text-surface-400 hover:text-white"
                }`}
              >
                <MusicNote size={16} />
                Perfil Social
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-6">
              {activeTab === "anuncios" && (
                <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Meus Anúncios</h3>
                      <p className="text-[10px] text-surface-500 mt-0.5">Gerencie os itens que você anunciou no Focatto</p>
                    </div>
                    <Link
                      href="/meus-anuncios"
                      className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white transition-all text-xs font-semibold cursor-pointer"
                    >
                      <Plus size={14} />
                      Anunciar Novo
                    </Link>
                  </div>

                  {userProductsLoading ? (
                    <div className="flex items-center justify-center py-12 text-surface-500">
                      <Spinner size={20} className="animate-spin text-[#ef7c2c] mr-2" />
                      <span className="text-xs">Carregando seus anúncios...</span>
                    </div>
                  ) : userProducts.length === 0 ? (
                    <div className="text-center py-12 bg-[#110f0e] rounded-xl border border-[#1c1a19] space-y-3">
                      <Package size={40} className="mx-auto text-surface-500" />
                      <p className="text-xs text-surface-400">Você ainda não tem anúncios criados.</p>
                      <Link
                        href="/meus-anuncios"
                        className="inline-flex items-center gap-1 py-1.5 px-4 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold"
                      >
                        Criar primeiro anúncio
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userProducts.map((product) => (
                        <div key={product.id} className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 flex gap-3">
                              <div className="h-12 w-12 rounded-lg bg-[#181615] border border-[#2a2827] flex-shrink-0 overflow-hidden flex items-center justify-center">
                                {product.photos && product.photos[0] ? (
                                  <img loading="lazy" decoding="async" src={product.photos[0]} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Tag size={20} className="text-[#d4ae12]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                                <p className="text-[10px] text-surface-400 mt-1">
                                  <MapPin size={10} className="inline mr-0.5" />
                                  {product.city}, {product.state}
                                  {product.price ? ` | R$ ${product.price.toLocaleString("pt-BR")}` : ""}
                                  {` | ${product.views || 0} visualizações`}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                product.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                product.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {product.status === "approved" ? "Ativo" : product.status === "rejected" ? "Reprovado" : "Pendente"}
                              </span>
                            </div>
                          </div>

                          {product.adminNotes && product.status === "rejected" && (
                            <p className="text-[11px] text-red-400/90 bg-red-500/5 rounded-lg p-2.5 border border-red-500/10">
                              <strong>Motivo da rejeição:</strong> {product.adminNotes}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1c1a19]/50">
                            <button
                              onClick={() => handleDeleteProduct(product.id!)}
                              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-[11px] font-semibold cursor-pointer"
                            >
                              <Trash size={12} />
                              Excluir
                            </button>
                            <Link
                              href="/meus-anuncios"
                              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#181615] border border-[#2a2827] hover:border-[#ef7c2c]/30 text-surface-300 hover:text-white transition-all text-[11px] font-semibold"
                            >
                              Gerenciar
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favoritos" && (
                <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Favoritos</h3>
                    <p className="text-[10px] text-surface-500 mt-0.5">Anúncios que você marcou como favoritos</p>
                  </div>

                  {favoritesLoading ? (
                    <div className="flex items-center justify-center py-12 text-surface-500">
                      <Spinner size={20} className="animate-spin text-[#ef7c2c] mr-2" />
                      <span className="text-xs">Carregando favoritos...</span>
                    </div>
                  ) : favoritedProducts.length === 0 ? (
                    <div className="text-center py-12 bg-[#110f0e] rounded-xl border border-[#1c1a19] space-y-2">
                      <HeartStraight size={40} className="mx-auto text-surface-500" />
                      <p className="text-xs text-surface-400">Nenhum anúncio favoritado por enquanto.</p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1 py-1.5 px-4 rounded-xl bg-[#181615] border border-[#2a2827] text-surface-300 hover:text-white text-xs font-semibold"
                      >
                        Explorar Anúncios
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {favoritedProducts.map((product) => {
                        const favMeta = favorites.find((f) => f.productId === product.id);
                        return (
                          <div key={product.id} className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1 flex gap-3">
                              <div className="h-12 w-12 rounded-lg bg-[#181615] border border-[#2a2827] flex-shrink-0 overflow-hidden flex items-center justify-center">
                                {product.photos && product.photos[0] ? (
                                  <img loading="lazy" decoding="async" src={product.photos[0]} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Tag size={20} className="text-[#d4ae12]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/anuncio/${product.id}`}
                                  className="text-xs font-bold text-white hover:text-[#ef7c2c] transition-colors truncate block"
                                >
                                  {product.title}
                                </Link>
                                <p className="text-[10px] text-surface-400 mt-1">
                                  <MapPin size={10} className="inline mr-0.5" />
                                  {product.city}, {product.state}
                                  {product.price ? ` | R$ ${product.price.toLocaleString("pt-BR")}` : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleRemoveFavorite(product.id!, product.title, favMeta?.sellerId || "")}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs font-semibold cursor-pointer flex items-center justify-center"
                                title="Remover dos favoritos"
                                aria-label="Remover dos favoritos"
                              >
                                <HeartStraight size={14} weight="fill" />
                              </button>
                              <Link
                                href={`/anuncio/${product.id}`}
                                className="py-1.5 px-3 rounded-lg bg-[#181615] border border-[#2a2827] text-surface-300 hover:text-white hover:border-[#ef7c2c]/30 transition-all text-xs font-semibold"
                              >
                                Ver Anúncio
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "atividades" && (
                <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Minhas Atividades Profissionais</h3>
                    <p className="text-[10px] text-surface-500 mt-0.5">Seus perfis de serviços cadastrados no Focatto</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Luthier Card */}
                    <div className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs text-[#ef7c2c] font-bold">
                            <Wrench size={16} />
                            Luthieria
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            profile?.luthierStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            profile?.luthierStatus === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-surface-800 text-surface-400 border border-surface-700"
                          }`}>
                            {profile?.luthierStatus === "approved" ? "Ativo" :
                             profile?.luthierStatus === "pending" ? "Pendente" :
                             profile?.luthierStatus === "rejected" ? "Reprovado" : "Inativo"}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-400 leading-relaxed">
                          {profile?.isProfessional
                            ? "Seu perfil de luthier profissional está ativo e visível na busca e no mapa."
                            : profile?.luthierStatus === "pending"
                            ? "Seu cadastro de luthier está sob análise da nossa equipe administrativa."
                            : "Ofereça serviços de regulagem, reparo e customização de instrumentos no Focatto."}
                        </p>
                        {profile?.isProfessional && luthierSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {luthierSpecialties.slice(0, 3).map((s) => (
                              <span key={s} className="text-[9px] bg-[#ef7c2c]/10 text-[#ef7c2c] px-2 py-0.5 rounded border border-[#ef7c2c]/15">
                                {s}
                              </span>
                            ))}
                            {luthierSpecialties.length > 3 && (
                              <span className="text-[9px] text-surface-500 px-1 py-0.5">+{luthierSpecialties.length - 3} mais</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {profile?.isProfessional ? (
                        <Link
                          href={`/vendedor/${user.uid}`}
                          className="w-full py-1.5 px-3 rounded-lg bg-[#181615] border border-[#2a2827] text-surface-300 hover:text-white text-xs font-semibold text-center mt-2"
                        >
                          Ver Perfil Público
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setIsProfessional(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-[#ef7c2c]/10 hover:bg-[#ef7c2c]/20 text-[#ef7c2c] border border-[#ef7c2c]/20 text-xs font-semibold text-center mt-2 cursor-pointer"
                        >
                          Configurar Perfil
                        </button>
                      )}
                    </div>

                    {/* Teacher Card */}
                    <div className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold">
                            <GraduationCap size={16} />
                            Aulas de Música
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            profile?.teacherStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            profile?.teacherStatus === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-surface-800 text-surface-400 border border-surface-700"
                          }`}>
                            {profile?.teacherStatus === "approved" ? "Ativo" :
                             profile?.teacherStatus === "pending" ? "Pendente" :
                             profile?.teacherStatus === "rejected" ? "Reprovado" : "Inativo"}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-400 leading-relaxed">
                          {profile?.isTeacher
                            ? "Seu perfil de professor de música está ativo e visível na busca e no mapa."
                            : profile?.teacherStatus === "pending"
                            ? "Seu cadastro de professor está sob análise da nossa equipe administrativa."
                            : "Dê aulas presenciais ou online e ensine os instrumentos que você domina."}
                        </p>
                        {profile?.isTeacher && teacherSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {teacherSpecialties.slice(0, 3).map((s) => (
                              <span key={s} className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/15">
                                {s}
                              </span>
                            ))}
                            {teacherSpecialties.length > 3 && (
                              <span className="text-[9px] text-surface-500 px-1 py-0.5">+{teacherSpecialties.length - 3} mais</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {profile?.isTeacher ? (
                        <Link
                          href={`/vendedor/${user.uid}`}
                          className="w-full py-1.5 px-3 rounded-lg bg-[#181615] border border-[#2a2827] text-surface-300 hover:text-white text-xs font-semibold text-center mt-2"
                        >
                          Ver Perfil Público
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setIsTeacher(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold text-center mt-2 cursor-pointer"
                        >
                          Configurar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "propostas" && (
                <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-4">
                  <div className="flex items-center gap-2">
                    <Handshake size={18} className="text-[#ef7c2c]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Propostas Recebidas</h3>
                  </div>
                  <p className="text-xs text-surface-400">
                    Confira abaixo as propostas enviadas por vendedores dos anúncios que você favoritou.
                  </p>

                  {proposalsLoading ? (
                    <div className="flex items-center justify-center py-6 text-surface-500">
                      <Spinner size={18} className="animate-spin text-[#ef7c2c] mr-2" />
                      <span className="text-xs">Carregando propostas...</span>
                    </div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center py-8 bg-[#110f0e] rounded-xl border border-[#1c1a19]">
                      <CurrencyDollar size={32} className="mx-auto text-surface-500 mb-2" />
                      <p className="text-xs text-surface-400">Nenhuma proposta recebida até o momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proposals.map((prop) => (
                        <div key={prop.id} className="bg-[#110f0e] rounded-xl p-4 border border-[#1c1a19] space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {prop.type === "trade" ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 flex items-center gap-1">
                                    <ArrowsLeftRight size={10} weight="bold" />
                                    Troca
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <CurrencyDollar size={10} weight="bold" />
                                    Valor
                                  </span>
                                )}
                              </div>
                              <Link href={`/anuncio/${prop.productId}`} className="text-xs font-bold text-white hover:text-[#ef7c2c] transition-colors block truncate">
                                {prop.productTitle}
                              </Link>
                              <p className="text-[10px] text-surface-400 mt-0.5">Vendedor: {prop.sellerName}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                              prop.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              prop.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {prop.status === "accepted" ? "Aceita" : prop.status === "rejected" ? "Recusada" : "Pendente"}
                            </span>
                          </div>

                          {prop.type === "trade" && prop.tradeDescription && (
                            <div className="bg-[#141211] p-3 rounded-xl border border-[#22201e] space-y-2">
                              <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Item Oferecido para Troca</p>
                              <p className="text-[11px] text-surface-200">{prop.tradeDescription}</p>
                              {prop.tradeCategory && (
                                <div className="flex gap-3 text-[10px] text-surface-400">
                                  <span>Categoria: <strong className="text-surface-300">{prop.tradeCategory}</strong></span>
                                  {prop.tradeCondition && (
                                    <span>Condição: <strong className="text-surface-300">{prop.tradeCondition}</strong></span>
                                  )}
                                </div>
                              )}
                              {prop.tradePhotos && prop.tradePhotos.length > 0 && (
                                <div className="flex gap-2 mt-1">
                                  {prop.tradePhotos.map((photo, idx) => (
                                    <a key={idx} href={photo} target="_blank" rel="noopener noreferrer">
                                      <img loading="lazy" decoding="async"
                                        src={photo}
                                        alt={`Item de troca ${idx + 1}`}
                                        className="h-14 w-14 rounded-lg object-cover border border-[#2a2827] hover:opacity-80 transition-opacity"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {prop.message && (
                            <p className="text-[11px] text-surface-300 bg-[#141211] p-2 rounded-lg border border-[#22201e] italic">
                              "{prop.message}"
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#1c1a19]/50">
                            <div>
                              <span className="text-[10px] text-surface-500 block uppercase tracking-wider font-semibold">
                                {prop.type === "trade" ? "Valor de Referência" : "Valor Proposto"}
                              </span>
                              <span className="text-sm font-bold text-[#ef7c2c]">
                                {prop.type === "trade" && prop.tradeValue
                                  ? `R$ ${prop.tradeValue.toLocaleString("pt-BR")} + Troca`
                                  : `R$ ${prop.value.toLocaleString("pt-BR")}`}
                              </span>
                            </div>

                            {prop.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRespondProposal(prop.id!, "rejected")}
                                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-semibold cursor-pointer"
                                >
                                  <XCircle size={14} />
                                  Recusar
                                </button>
                                <button
                                  onClick={() => handleRespondProposal(prop.id!, "accepted")}
                                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-semibold cursor-pointer"
                                >
                                  <CheckCircle size={14} />
                                  Aceitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "social" && (
                <div className="bg-[#141211] rounded-2xl p-5 border border-[#22201e] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Rede Social</h3>
                      <p className="text-[10px] text-surface-500 mt-0.5">Gerencie sua presença social e equipamentos no Focatto</p>
                    </div>
                    <Link
                      href={`/social/${user.uid}`}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white text-xs font-semibold hover:shadow-[0_4px_15px_rgba(239,124,44,0.3)] transition-all cursor-pointer"
                    >
                      Ver Perfil Público ↗
                    </Link>
                  </div>

                  <hr className="border-[#22201e]" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Painel de Contacto */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-[#ef7c2c] uppercase tracking-wider">Configurações de Contacto</h4>
                      <ContactPanel
                        userId={user.uid}
                        isOwnProfile={true}
                        contactOptions={profile?.social?.contactOptions}
                        phone={profile?.phone}
                        onSave={handleSaveContactOptions}
                      />
                    </div>

                    {/* Gestão de Equipamentos */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-[#ef7c2c] uppercase tracking-wider">Equipamentos</h4>
                      <EquipmentManager
                        userId={user.uid}
                        equipments={profile?.social?.equipments || []}
                        onUpdate={handleUpdateEquipments}
                        planTier={profile?.premiumTier || "free"}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
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
                    <Phone size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${phoneError ? 'text-red-400' : 'text-surface-400'}`} />
                    <input
                      type="text"
                      id="profile-phone-input"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      placeholder="(11) 99999-9999"
                      className={`${inputBase} pl-10 ${phoneError ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
                    />
                  </div>
                  {phoneError && (
                    <span className="text-[11px] text-red-400 mt-1 block px-1">{phoneError}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-cpf-cnpj-input" className="block text-xs text-surface-400 mb-1.5">CPF / CNPJ</label>
                  <div className="relative">
                    <IdentificationCard size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${cpfCnpjError ? 'text-red-400' : 'text-surface-400'}`} />
                    <input
                      type="text"
                      id="profile-cpf-cnpj-input"
                      value={cpfCnpj}
                      onChange={handleCpfCnpjChange}
                      onBlur={handleCpfCnpjBlur}
                      placeholder="000.000.000-00"
                      className={`${inputBase} pl-10 ${cpfCnpjError ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
                    />
                  </div>
                  {cpfCnpjError && (
                    <span className="text-[11px] text-red-400 mt-1 block px-1">{cpfCnpjError}</span>
                  )}
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
                  <div className="relative">
                    <input
                      type="text"
                      id="profile-cep-input"
                      value={cep}
                      onChange={handleCepChange}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      className={`${inputBase} ${cepError ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''} pr-10`}
                    />
                    {loadingCep && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Spinner size={14} className="animate-spin text-[#ef7c2c]" />
                      </div>
                    )}
                  </div>
                  {cepError ? (
                    <span className="text-[11px] text-red-400 mt-1 block px-1">{cepError}</span>
                  ) : (
                    <span className="text-[10px] text-surface-500 mt-1 block px-1">Endereço preenchido automaticamente ao digitar o CEP.</span>
                  )}
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
                    ref={numberInputRef}
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

            {/* Atividades no Focatto */}
            <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-4">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-[#ef7c2c]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Atividades no Focatto</h3>
              </div>
              <p className="text-xs text-surface-400">
                Habilite as opções abaixo se você deseja oferecer serviços de luthieria ou dar aulas de música na plataforma.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  isProfessional 
                    ? "bg-[#ef7c2c]/5 border-[#ef7c2c]/30 text-white" 
                    : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                }`}>
                  <div className="flex items-center gap-3">
                    <Wrench size={20} className={isProfessional ? "text-[#ef7c2c]" : "text-surface-500"} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Luthier Especializado</p>
                      <p className="text-[10px] text-surface-400">Oferecer serviços de regulagem/reparos</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                  />
                </label>

                <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  isTeacher 
                    ? "bg-indigo-500/5 border-indigo-500/30 text-white" 
                    : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                }`}>
                  <div className="flex items-center gap-3">
                    <GraduationCap size={20} className={isTeacher ? "text-indigo-400" : "text-surface-500"} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Professor de Música</p>
                      <p className="text-[10px] text-surface-400">Oferecer aulas de música</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTeacher}
                    onChange={(e) => setIsTeacher(e.target.checked)}
                    className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                  />
                </label>
              </div>
            </div>

            {/* Luthier Profile Section */}
            {isProfessional && (
              <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
                <div className="flex items-center gap-2">
                  <Wrench size={18} className="text-[#ef7c2c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Perfil de Luthier Especializado</h3>
                </div>

                {profile?.luthierStatus === "pending" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <Clock size={16} weight="fill" className="flex-shrink-0 animate-pulse" />
                    <span>Seu perfil de luthier está sob análise da moderação. Seus dados cadastrados e atualizações estarão visíveis no mapa/pesquisa apenas após aprovação.</span>
                  </div>
                )}
                {profile?.luthierStatus === "rejected" && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <XCircle size={16} weight="fill" className="flex-shrink-0" />
                    <div>
                      <p className="font-bold">Seu perfil de luthier foi rejeitado.</p>
                      {profile.bio && <p className="mt-0.5 opacity-90">Você pode atualizar seus dados e salvar novamente para reenvio à moderação.</p>}
                    </div>
                  </div>
                )}
                {profile?.luthierStatus === "approved" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <CheckCircle size={16} weight="fill" className="flex-shrink-0" />
                    <span>Seu perfil de luthier está aprovado e ativo!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="luthier-bio-textarea" className="block text-xs text-surface-400 mb-1.5">Apresentação e Serviços</label>
                    <textarea
                      id="luthier-bio-textarea"
                      value={luthierBio}
                      onChange={(e) => setLuthierBio(e.target.value)}
                      placeholder="Fale sobre sua experiência como luthier, oficina, serviços realizados, etc..."
                      rows={4}
                      className={`${inputBase} resize-none`}
                    />
                  </div>

                  <div>
                    <span className="block text-xs text-surface-400 mb-2">Especialidades e Serviços</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LUTHIER_SPECIALTIES_LIST.map((spec) => {
                        const isSelected = luthierSpecialties.includes(spec);
                        return (
                          <label key={spec} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                            isSelected 
                              ? "bg-[#ef7c2c]/10 border-[#ef7c2c]/30 text-[#ef7c2c]" 
                              : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                          }`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setLuthierSpecialties([...luthierSpecialties, spec]);
                                } else {
                                  setLuthierSpecialties(luthierSpecialties.filter((s) => s !== spec));
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
                </div>
              </div>
            )}

            {/* Teacher Profile Section */}
            {isTeacher && (
              <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#ef7c2c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Perfil de Professor de Música</h3>
                </div>

                {profile?.teacherStatus === "pending" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <Clock size={16} weight="fill" className="flex-shrink-0 animate-pulse" />
                    <span>Seu perfil de professor está sob análise da moderação. Seus dados cadastrados e atualizações estarão visíveis no mapa/pesquisa apenas após aprovação.</span>
                  </div>
                )}
                {profile?.teacherStatus === "rejected" && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <XCircle size={16} weight="fill" className="flex-shrink-0" />
                    <div>
                      <p className="font-bold">Seu perfil de professor foi rejeitado.</p>
                      {profile.bio && <p className="mt-0.5 opacity-90">Você pode atualizar seus dados e salvar novamente para reenvio à moderação.</p>}
                    </div>
                  </div>
                )}
                {profile?.teacherStatus === "approved" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                    <CheckCircle size={16} weight="fill" className="flex-shrink-0" />
                    <span>Seu perfil de professor está aprovado e ativo!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="teacher-bio-textarea" className="block text-xs text-surface-400 mb-1.5">Metodologia das Aulas</label>
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
                    <div>
                      <label htmlFor="teacher-omb-input" className="block text-xs text-surface-400 mb-1.5">Carteira Ordem dos Músicos do Brasil (OMB) - Opcional</label>
                      <input
                        type="text"
                        id="teacher-omb-input"
                        value={teacherOmb}
                        onChange={(e) => setTeacherOmb(e.target.value)}
                        placeholder="Ex: 12.345-SP"
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

                  <div>
                    <span className="block text-xs text-surface-400 mb-2">Público-Alvo Atendido</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TEACHER_AUDIENCES_LIST.map((audience) => {
                        const isSelected = teacherTargetAudience.includes(audience);
                        return (
                          <label key={audience} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                            isSelected 
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                              : "bg-[#181615] border-[#2a2827] text-surface-400 hover:text-white"
                          }`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTeacherTargetAudience([...teacherTargetAudience, audience]);
                                } else {
                                  setTeacherTargetAudience(teacherTargetAudience.filter((a) => a !== audience));
                                }
                              }}
                              className="rounded border-[#2a2827] bg-[#181615] text-[#ef7c2c] focus:ring-[#ef7c2c]/30"
                            />
                            {audience}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seller Profile Section */}
            <div className="bg-[#141211] rounded-2xl p-6 border border-[#22201e] space-y-5">
              <div className="flex items-center gap-2">
                <Smiley size={18} className="text-[#ef7c2c]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-surface-400">Perfil do Vendedor</h3>
              </div>
              <p className="text-xs text-surface-500 leading-relaxed">
                Essas informações aparecerão no seu perfil público para seus compradores conhecerem você melhor.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="seller-about-textarea" className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                    <Sparkle size={14} className="text-amber-400" />
                    Quem Sou Eu
                  </label>
                  <textarea
                    id="seller-about-textarea"
                    value={sellerAbout}
                    onChange={(e) => setSellerAbout(e.target.value)}
                    placeholder="Conte um pouco sobre sua história com música, o que te motiva, seus valores como vendedor..."
                    rows={3}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="seller-music-input" className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                    <MusicNote size={14} className="text-amber-400" />
                    Gosto Musical
                  </label>
                  <textarea
                    id="seller-music-input"
                    value={sellerMusic}
                    onChange={(e) => setSellerMusic(e.target.value)}
                    placeholder="Que estilos musicais você curte? Bandas favoritas, artistas que te inspiram..."
                    rows={2}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="seller-hobbies-input" className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                    <HeartStraight size={14} className="text-amber-400" />
                    Hobbies
                  </label>
                  <textarea
                    id="seller-hobbies-input"
                    value={sellerHobbies}
                    onChange={(e) => setSellerHobbies(e.target.value)}
                    placeholder="Além da música, o que você gosta de fazer? Colecionar discos, tocar em bandas, lutheria..."
                    rows={2}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="seller-funfacts-input" className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                    <Smiley size={14} className="text-amber-400" />
                    Fatos Divertidos
                  </label>
                  <textarea
                    id="seller-funfacts-input"
                    value={sellerFunFacts}
                    onChange={(e) => setSellerFunFacts(e.target.value)}
                    placeholder="Curiosidades sobre você! Já tocou em alguma banda? Tem algum instrumento raro? Conheceu algum artista famoso?"
                    rows={2}
                    className={`${inputBase} resize-none`}
                  />
                </div>
              </div>
            </div>

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
          </div>
        )}
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
                  clearVerificationFiles();
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
                <h2 className="text-base sm:text-lg font-bold text-white font-display">Upgrade Premium</h2>
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
                <span className="sm:hidden">Ativar</span>
                <span className="hidden sm:inline">Ativar Plano</span> {premiumTier === 1 ? "Pro" : "Plus"} {premiumBilling === "yearly" ? "Anual" : "Mensal"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
