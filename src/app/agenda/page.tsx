"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MusicNotes, 
  Users, 
  Clock, 
  Sparkle, 
  BookOpen, 
  WarningCircle, 
  CaretRight,
  DotsThreeVertical,
  CheckCircle,
  XCircle,
  Circle,
  X,
  Play,
  Pause,
  YoutubeLogo,
  SpotifyLogo,
  Gear,
  Trash,
  UserPlus,
  FileText,
  CalendarCheck,
  PencilSimple
} from "@phosphor-icons/react";
import ChatHeaderButton from "../../components/ChatHeaderButton";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../contexts/AuthContext";

// Configurações de tipo de banda
const groupTypeConfig: Record<string, { title: string; subtitle: string; hint: string; icon: string }> = {
  ministerio: {
    title: "Ministério de Louvor",
    subtitle: "Gestão litúrgica, escalas de cultos e repertório congregacional.",
    hint: "Músicos podem ser organizados por naipes e instrumentos e ter escalas fixas semanais.",
    icon: "⛪"
  },
  gig: {
    title: "GIG / Músicos Freelancers",
    subtitle: "Controle de apresentações corporativas, casamentos e repasse de cachês.",
    hint: "Cadastre o valor do cachê geral e controle a divisão proporcional entre os músicos escalados.",
    icon: "💼"
  },
  baile: {
    title: "Banda de Baile / Eventos",
    subtitle: "Shows extensos, blocos de repertório e gestão de equipe técnica.",
    hint: "Crie setlists divididos por blocos (ex: Anos 80, Sertanejo, Pop) para facilitar a condução do show.",
    icon: "🎤"
  },
  agencia: {
    title: "Agência de Músicos",
    subtitle: "Múltiplas bandas e artistas sob uma mesma agenda integrada.",
    hint: "Evite conflitos de agenda garantindo que um mesmo músico não seja escalado em bandas diferentes no mesmo horário.",
    icon: "🏢"
  },
  coral: {
    title: "Coral / Grupo Vocal",
    subtitle: "Divisão de vozes (S.C.T.B), ensaios técnicos de naipes e partituras.",
    hint: "Você pode anexar arquivos de áudio (guias de voz) específicos para sopranos, contraltos, tenores e baixos.",
    icon: "🎶"
  },
  outros: {
    title: "Grupo Musical",
    subtitle: "Planejamento de ensaios, composição autoral e agenda de shows.",
    hint: "Registre datas de reuniões de composição e organize suas gravações demo diretamente no repertório.",
    icon: "🎸"
  }
};

// Escala cromática para transpositor de acordes
const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  youtube?: string;
  spotify?: string;
  deezer?: string;
  cifra: string; // Acordes em colchetes [C]
}

interface Member {
  id: string;
  name: string;
  instrument: string;
  email: string;
}

interface ScaleEvent {
  id: string;
  title: string;
  type: string; // Ensaio, Apresentação, etc.
  date: string;
  location: string;
  songs: string[]; // ids das músicas
  members: Record<string, { memberId: string; role: string; status: "confirmado" | "pendente" | "recusado"; comment?: string }>;
}

interface Indisponibilidade {
  date: string; // YYYY-MM-DD
  reason: string;
}

function AgendaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const typeParam = searchParams.get("type") || "outros";
  const config = groupTypeConfig[typeParam] || groupTypeConfig.outros;

  // Estados principais persistidos no LocalStorage
  const [bandCreated, setBandCreated] = useState(false);
  const [bandName, setBandName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Abas
  const [activeTab, setActiveTab] = useState<"dashboard" | "escalas" | "repertorio" | "integrantes" | "indisponibilidade">("dashboard");
  
  // Dados da Banda
  const [songs, setSongs] = useState<Song[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ScaleEvent[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Indisponibilidade[]>([]);

  // Modais de Criação
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showSongDetailsModal, setShowSongDetailsModal] = useState(false);

  // Estados de Criação de Música
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongKey, setNewSongKey] = useState("C");
  const [newSongBpm, setNewSongBpm] = useState(70);
  const [newSongYoutube, setNewSongYoutube] = useState("");
  const [newSongSpotify, setNewSongSpotify] = useState("");
  const [newSongDeezer, setNewSongDeezer] = useState("");
  const [newSongCifra, setNewSongCifra] = useState("");

  // Estados de Importação Cifra Club
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [collectionSongs, setCollectionSongs] = useState<{ title: string; url: string; checked: boolean }[]>([]);

  // Estados de Edição de Música
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [editSongTitle, setEditSongTitle] = useState("");
  const [editSongArtist, setEditSongArtist] = useState("");
  const [editSongKey, setEditSongKey] = useState("");
  const [editSongBpm, setEditSongBpm] = useState(70);
  const [editSongYoutube, setEditSongYoutube] = useState("");
  const [editSongSpotify, setEditSongSpotify] = useState("");
  const [editSongDeezer, setEditSongDeezer] = useState("");
  const [editSongCifra, setEditSongCifra] = useState("");

  // Estados de Criação de Membro
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberInstrument, setNewMemberInstrument] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Estados de Criação de Evento
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventPageType, setNewEventPageType] = useState("Ensaio");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventSongs, setNewEventSongs] = useState<string[]>([]);
  const [newEventMembers, setNewEventMembers] = useState<Record<string, { memberId: string; role: string; status: "pendente" }>>({});

  // Visualizador de Música Selecionada
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [transposeOffset, setTransposeOffset] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0); // 0, 1, 2, 3
  const [showChords, setShowChords] = useState(true);

  // Estados de Indisponibilidade
  const [indispDate, setIndispDate] = useState("");
  const [indispReason, setIndispReason] = useState("");

  const cifraContainerRef = useRef<HTMLPreElement>(null);

  // Carregar dados iniciais do LocalStorage
  useEffect(() => {
    const savedBand = localStorage.getItem(`focatto_band_${typeParam}`);
    if (savedBand) {
      const data = JSON.parse(savedBand);
      setBandName(data.name || "");
      setBandCreated(true);
    }

    const savedSongs = localStorage.getItem(`focatto_songs_${typeParam}`);
    if (savedSongs) setSongs(JSON.parse(savedSongs));
    else {
      // Mock inicial de músicas
      const initialSongs: Song[] = [
        {
          id: "s1",
          title: "Oceanos",
          artist: "Hillsong Em Português",
          key: "D",
          bpm: 64,
          youtube: "https://www.youtube.com/watch?v=113s8qN6K60",
          cifra: `[Bm]   Tua voz me chama sobre as [A/C#]águas\n[D]   Onde os meus pés podem fa[A]lhar\n[Bm]   E ali te encontro no mis[A/C#]tério\n[D]   Em meio ao mar confia[A]rei\n\nRefrão:\nAo Teu [G]nome chama[D]rei\nE a[A]lém das ondas olha[G]rei\nSe o mar cres[D]cer\nSomente em [A]Ti confia[G]rei\nPois eu sou [D]Teu e Tu és [A]meu`
        },
        {
          id: "s2",
          title: "Porque Ele Vive",
          artist: "Harpa Cristã",
          key: "A",
          bpm: 72,
          cifra: `[A]Deus enviou Seu [D]Filho amado\nPra perdo[A]ar, pra me sal[E]var\nNa cruz mor[A]reu por meus pe[D]cados\nMas o sep[A]ulcro va[E]zio está, porque Ele [A]vive\n\nRefrão:\nPorque Ele [D]vive, posso crer no ama[A]nhã\nPorque Ele [F#m]vive, temor não [B7]há\nMas eu bem [A]sei, eu sei, que a minha [D]vida\nEstá nas [A]mãos do meu Je[E]sus, que vivo es[A]tá`
        }
      ];
      setSongs(initialSongs);
      localStorage.setItem(`focatto_songs_${typeParam}`, JSON.stringify(initialSongs));
    }

    const savedMembers = localStorage.getItem(`focatto_members_${typeParam}`);
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    else {
      // Mock inicial de membros
      const initialMembers: Member[] = [
        { id: "m1", name: "Gabriel Silva", instrument: "Guitarra", email: "gabriel@focatto.com" },
        { id: "m2", name: "Jessica Souza", instrument: "Vocal Principal", email: "jessica@focatto.com" },
        { id: "m3", name: "Marcos Ribeiro", instrument: "Teclado", email: "marcos@focatto.com" },
        { id: "m4", name: "Daniel Costa", instrument: "Bateria", email: "daniel@focatto.com" }
      ];
      setMembers(initialMembers);
      localStorage.setItem(`focatto_members_${typeParam}`, JSON.stringify(initialMembers));
    }

    const savedEvents = localStorage.getItem(`focatto_events_${typeParam}`);
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    else {
      // Mock inicial de eventos
      const initialEvents: ScaleEvent[] = [
        {
          id: "e1",
          title: "Ensaio de Preparação",
          type: "Ensaio",
          date: "2026-07-10T19:30",
          location: "Estúdio Principal Focatto",
          songs: ["s1"],
          members: {
            "m1": { memberId: "m1", role: "Guitarra", status: "confirmado" },
            "m2": { memberId: "m2", role: "Vocal Principal", status: "pendente" },
            "m3": { memberId: "m3", role: "Teclado", status: "confirmado" }
          }
        }
      ];
      setEvents(initialEvents);
      localStorage.setItem(`focatto_events_${typeParam}`, JSON.stringify(initialEvents));
    }

    const savedIndisp = localStorage.getItem(`focatto_indisp_${typeParam}`);
    if (savedIndisp) setIndisponibilidades(JSON.parse(savedIndisp));
  }, [typeParam]);

  // Persistir mudanças
  const saveSongs = (newSongs: Song[]) => {
    setSongs(newSongs);
    localStorage.setItem(`focatto_songs_${typeParam}`, JSON.stringify(newSongs));
  };

  const saveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem(`focatto_members_${typeParam}`, JSON.stringify(newMembers));
  };

  const saveEvents = (newEvents: ScaleEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem(`focatto_events_${typeParam}`, JSON.stringify(newEvents));
  };

  const saveIndisps = (newIndisps: Indisponibilidade[]) => {
    setIndisponibilidades(newIndisps);
    localStorage.setItem(`focatto_indisp_${typeParam}`, JSON.stringify(newIndisps));
  };

  // Criar grupo
  const handleCreateBandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName.trim()) return;
    localStorage.setItem(`focatto_band_${typeParam}`, JSON.stringify({ name: bandName, type: typeParam }));
    setBandCreated(true);
    setShowCreateModal(false);
  };

  // Adicionar Música
  const handleCifraBlur = () => {
    if (newSongCifra.trim()) {
      const converted = convertCifraClubToBrackets(newSongCifra);
      if (converted !== newSongCifra) {
        setNewSongCifra(converted);
      }
    }
  };

  const handleCifraPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText) {
      e.preventDefault();
      const converted = convertCifraClubToBrackets(pastedText);
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newValue = text.substring(0, start) + converted + text.substring(end);
      
      setNewSongCifra(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + converted.length;
      }, 0);
    }
  };

  const handleAddSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle.trim() || !newSongArtist.trim() || !newSongCifra.trim()) return;

    const formattedCifra = convertCifraClubToBrackets(newSongCifra);

    const newSong: Song = {
      id: "s_" + Date.now().toString(),
      title: newSongTitle,
      artist: newSongArtist,
      key: newSongKey,
      bpm: Number(newSongBpm) || 80,
      youtube: newSongYoutube || undefined,
      spotify: newSongSpotify || undefined,
      deezer: newSongDeezer || undefined,
      cifra: formattedCifra
    };

    saveSongs([newSong, ...songs]);
    setNewSongTitle("");
    setNewSongArtist("");
    setNewSongKey("C");
    setNewSongBpm(70);
    setNewSongYoutube("");
    setNewSongSpotify("");
    setNewSongDeezer("");
    setNewSongCifra("");
    setShowAddSongModal(false);
  };

  // Importação Cifra Club via URL
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) return;
    setImportError("");
    setImporting(true);
    setCollectionSongs([]);
    
    try {
      let mode = "single";
      try {
        const urlObj = new URL(importUrl);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        // Se tiver apenas 1 segmento de caminho ou contiver palavra-chave de playlist, é uma lista/coleção
        if (pathParts.length === 1 || urlObj.pathname.includes("/playlist") || urlObj.pathname.includes("/playlists")) {
          mode = "list";
        }
      } catch (e) {}

      const response = await fetch(`/api/cifraclub?url=${encodeURIComponent(importUrl)}&mode=${mode}`);
      if (!response.ok) {
        throw new Error(`Servidor respondeu com código ${response.status}`);
      }

      const data = await response.json();
      if (data.songs && Array.isArray(data.songs)) {
        setCollectionSongs(data.songs.map((s: any) => ({ ...s, checked: true })));
      } else if (data.title) {
        setNewSongTitle(data.title);
        setNewSongArtist(data.artist);
        setNewSongKey(data.key);
        setNewSongBpm(data.bpm);
        setNewSongCifra(data.cifra);
        setImportUrl("");
      } else {
        throw new Error("Formato de resposta inválido.");
      }
    } catch (err: any) {
      setImportError(`Erro ao importar: ${err.message}. Certifique-se de que a URL é do Cifra Club e tente novamente.`);
    } finally {
      setImporting(false);
    }
  };

  const handleImportCollection = async () => {
    const selected = collectionSongs.filter(s => s.checked);
    if (selected.length === 0) {
      setImportError("Selecione pelo menos uma música para importar.");
      return;
    }

    setImporting(true);
    setImportError("");
    let successCount = 0;
    const newSongsList = [...songs];

    for (const song of selected) {
      try {
        const res = await fetch(`/api/cifraclub?url=${encodeURIComponent(song.url)}&mode=single`);
        if (res.ok) {
          const data = await res.json();
          const newSong: Song = {
            id: "s_" + (Date.now() + Math.random()).toString(),
            title: data.title,
            artist: data.artist,
            key: data.key,
            bpm: data.bpm,
            cifra: data.cifra
          };
          newSongsList.unshift(newSong);
          successCount++;
        }
      } catch (e) {
        console.error(`Erro ao importar ${song.title}:`, e);
      }
    }

    if (successCount > 0) {
      saveSongs(newSongsList);
      setCollectionSongs([]);
      setImportUrl("");
      setShowAddSongModal(false);
      alert(`${successCount} música(s) importada(s) com sucesso para o repertório!`);
    } else {
      setImportError("Não foi possível importar nenhuma das músicas da coleção.");
    }
    setImporting(false);
  };

  // Salvar tom transposto permanentemente
  const handleSaveTransposedKey = () => {
    if (!selectedSong || transposeOffset === 0) return;

    const transposedCifra = renderCifraText(selectedSong.cifra, transposeOffset);
    const newKey = transposeChord(selectedSong.key, transposeOffset);

    const updatedSongs = songs.map(s => {
      if (s.id === selectedSong.id) {
        return {
          ...s,
          key: newKey,
          cifra: transposedCifra
        };
      }
      return s;
    });

    saveSongs(updatedSongs);
    setSelectedSong({
      ...selectedSong,
      key: newKey,
      cifra: transposedCifra
    });
    setTransposeOffset(0);
    alert(`Tom de "${selectedSong.title}" alterado permanentemente para ${newKey} e salvo!`);
  };

  // Edição e Correção de Música
  const handleStartEditingSong = () => {
    if (!selectedSong) return;
    setEditSongTitle(selectedSong.title);
    setEditSongArtist(selectedSong.artist);
    setEditSongKey(selectedSong.key);
    setEditSongBpm(selectedSong.bpm);
    setEditSongYoutube(selectedSong.youtube || "");
    setEditSongSpotify(selectedSong.spotify || "");
    setEditSongDeezer(selectedSong.deezer || "");
    setEditSongCifra(selectedSong.cifra);
    setIsEditingSong(true);
  };

  const handleEditCifraBlur = () => {
    if (editSongCifra.trim()) {
      const converted = convertCifraClubToBrackets(editSongCifra);
      if (converted !== editSongCifra) {
        setEditSongCifra(converted);
      }
    }
  };

  const handleEditCifraPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText) {
      e.preventDefault();
      const converted = convertCifraClubToBrackets(pastedText);
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newValue = text.substring(0, start) + converted + text.substring(end);
      
      setEditSongCifra(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + converted.length;
      }, 0);
    }
  };

  const handleEditSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong) return;
    if (!editSongTitle.trim() || !editSongArtist.trim() || !editSongCifra.trim()) return;

    const formattedCifra = convertCifraClubToBrackets(editSongCifra);

    const updatedSong: Song = {
      ...selectedSong,
      title: editSongTitle,
      artist: editSongArtist,
      key: editSongKey,
      bpm: Number(editSongBpm) || 80,
      youtube: editSongYoutube || undefined,
      spotify: editSongSpotify || undefined,
      deezer: editSongDeezer || undefined,
      cifra: formattedCifra
    };

    const updatedSongs = songs.map(s => s.id === selectedSong.id ? updatedSong : s);
    saveSongs(updatedSongs);
    setSelectedSong(updatedSong);
    setIsEditingSong(false);
    alert("Alterações salvas com sucesso!");
  };

  // Adicionar Membro
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberInstrument.trim()) return;

    const newMem: Member = {
      id: "m_" + Date.now().toString(),
      name: newMemberName,
      instrument: newMemberInstrument,
      email: newMemberEmail || "membro@focatto.com"
    };

    saveMembers([...members, newMem]);
    setNewMemberName("");
    setNewMemberInstrument("");
    setNewMemberEmail("");
    setShowAddMemberModal(false);
  };

  // Adicionar Evento
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate || !newEventLocation) return;

    // Constrói a escala final baseado no estado do formulário
    const finalEventMembers: Record<string, { memberId: string; role: string; status: "pendente" }> = {};
    Object.keys(newEventMembers).forEach((key) => {
      const data = newEventMembers[key];
      if (data && data.memberId) {
        finalEventMembers[data.memberId] = {
          memberId: data.memberId,
          role: data.role || "Instrumentista",
          status: "pendente"
        };
      }
    });

    const newEvt: ScaleEvent = {
      id: "e_" + Date.now().toString(),
      title: newEventTitle,
      type: newEventPageType,
      date: newEventDate,
      location: newEventLocation,
      songs: newEventSongs,
      members: finalEventMembers
    };

    saveEvents([newEvt, ...events]);
    setNewEventTitle("");
    setNewEventPageType("Ensaio");
    setNewEventDate("");
    setNewEventLocation("");
    setNewEventSongs([]);
    setNewEventMembers({});
    setShowAddEventModal(false);
  };

  // Excluir música
  const handleDeleteSong = (songId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Deseja realmente remover esta música do repertório?")) {
      saveSongs(songs.filter(s => s.id !== songId));
    }
  };

  // Excluir evento
  const handleDeleteEvent = (evtId: string) => {
    if (confirm("Deseja cancelar e remover este evento?")) {
      saveEvents(events.filter(e => e.id !== evtId));
    }
  };

  // Confirmar/recusar escala pelo integrante logado (simulado)
  const handleConfirmScale = (evtId: string, memberId: string, isConfirm: boolean, reason?: string) => {
    const updated = events.map((evt) => {
      if (evt.id === evtId) {
        const m = evt.members[memberId];
        if (m) {
          return {
            ...evt,
            members: {
              ...evt.members,
              [memberId]: {
                ...m,
                status: isConfirm ? ("confirmado" as const) : ("recusado" as const),
                comment: reason || undefined
              }
            }
          };
        }
      }
      return evt;
    });
    saveEvents(updated);
  };

  // Adicionar Indisponibilidade
  const handleAddIndisponibilidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indispDate || !indispReason.trim()) return;

    if (indisponibilidades.some(i => i.date === indispDate)) {
      alert("Você já cadastrou indisponibilidade para esta data.");
      return;
    }

    const newInd = { date: indispDate, reason: indispReason };
    saveIndisps([...indisponibilidades, newInd]);
    setIndispDate("");
    setIndispReason("");
  };

  const handleRemoveIndisp = (dateStr: string) => {
    saveIndisps(indisponibilidades.filter(i => i.date !== dateStr));
  };

  // Verificar se membro está indisponível na data especificada (YYYY-MM-DD)
  const isMemberIndisponivel = (dateStr: string): { indisponivel: boolean; reason?: string } => {
    if (!dateStr) return { indisponivel: false };
    const dateOnly = dateStr.split("T")[0];
    const ind = indisponibilidades.find(i => i.date === dateOnly);
    if (ind) {
      return { indisponivel: true, reason: ind.reason };
    }
    return { indisponivel: false };
  };

  // Lógica do Transpositor de Acordes
  const transposeChord = (chord: string, offset: number): string => {
    const regex = /^([A-G][#b]?)(.*)$/;
    const match = chord.match(regex);
    if (!match) return chord;
    
    const note = match[1];
    const suffix = match[2];
    
    let index = chromaticScale.indexOf(note);
    if (index === -1) {
      index = flatScale.indexOf(note);
    }
    if (index === -1) return chord;
    
    let newIndex = (index + offset) % 12;
    if (newIndex < 0) newIndex += 12;
    
    const useFlat = note.includes("b") || (offset < 0 && ["Db", "Eb", "Gb", "Ab", "Bb"].includes(flatScale[newIndex]));
    const newNote = useFlat ? flatScale[newIndex] : chromaticScale[newIndex];
    
    return newNote + suffix;
  };

  const isChord = (token: string): boolean => {
    const clean = token.replace(/[()[\]]/g, "").trim();
    if (!clean) return false;
    // Regex para acordes (iniciando com A-G e aceitando sustenidos, bemóis, menores, maiores, números, etc.)
    const regex = /^[A-G](?:#|b)?(?:m|M|maj|min|dim|aug|sus|add|alt|ao|º|\+|-)?(?:\d+)?(?:(?:\+|-|M)\d+)?(?:\/[A-G](?:#|b)?)?$/;
    return regex.test(clean);
  };

  const isChordLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    const tokens = trimmed.split(/\s+/);
    let chordCount = 0;
    let nonChordCount = 0;
    
    for (const token of tokens) {
      const cleanToken = token.replace(/[:()|]/g, "").trim();
      if (!cleanToken) continue;
      
      // Ignora marcas comuns de estrutura de música
      if (["|", "/", "-", "intro", "solo", "riff", "ponte", "bridge", "refrão", "chorus"].includes(cleanToken.toLowerCase())) {
        continue;
      }
      
      if (isChord(cleanToken)) {
        chordCount++;
      } else {
        nonChordCount++;
      }
    }
    
    if (chordCount === 0) return false;
    return chordCount / (chordCount + nonChordCount) >= 0.7;
  };

  const getChordsFromLine = (line: string): { chord: string; index: number }[] => {
    const chords: { chord: string; index: number }[] = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const token = match[0];
      const index = match.index;
      
      const cleanToken = token.replace(/[:()|]/g, "").trim();
      if (isChord(cleanToken)) {
        chords.push({ chord: cleanToken, index: index });
      }
    }
    return chords;
  };

  const mergeChordsAndLyrics = (chords: { chord: string; index: number }[], lyricLine: string): string => {
    const sortedChords = [...chords].sort((a, b) => b.index - a.index);
    let result = lyricLine;
    for (const { chord, index } of sortedChords) {
      if (index >= result.length) {
        result = result + " ".repeat(index - result.length);
      }
      result = result.substring(0, index) + `[${chord}]` + result.substring(index);
    }
    return result;
  };

  const formatChordOnlyLine = (line: string): string => {
    const chords = getChordsFromLine(line);
    const sortedChords = [...chords].sort((a, b) => b.index - a.index);
    let result = line;
    for (const { chord, index } of sortedChords) {
      const left = result.substring(0, index);
      const match = result.substring(index).match(/^\S+/);
      const tokenLength = match ? match[0].length : chord.length;
      const right = result.substring(index + tokenLength);
      result = left + `[${chord}]` + right;
    }
    return result;
  };

  const convertCifraClubToBrackets = (text: string): string => {
    const lines = text.split("\n");
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (isChordLine(line)) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
        if (nextLine && !isChordLine(nextLine) && nextLine.trim() !== "") {
          const chords = getChordsFromLine(line);
          const merged = mergeChordsAndLyrics(chords, nextLine);
          processedLines.push(merged);
          i++; // Pula a linha da letra porque mesclou
        } else {
          processedLines.push(formatChordOnlyLine(line));
        }
      } else {
        processedLines.push(line);
      }
    }
    
    return processedLines.join("\n");
  };

  const renderCifraText = (text: string, offset: number): string => {
    if (offset === 0) return text;
    return text.replace(/\[([^\]]+)\]/g, (match, chord) => {
      if (chord.includes("/")) {
        const parts = chord.split("/");
        return `[${transposeChord(parts[0], offset)}/${transposeChord(parts[1], offset)}]`;
      }
      return `[${transposeChord(chord, offset)}]`;
    });
  };

  const renderBracketsToCifraClubHtml = (text: string): string => {
    const lines = text.split("\n");
    const formattedLines: string[] = [];

    for (let line of lines) {
      if (!line.includes("[")) {
        formattedLines.push(line);
        continue;
      }

      let chordLine = "";
      let chordLineVisualLength = 0;
      let lyricLine = "";
      let lastIndex = 0;
      
      const regex = /\[([^\]]+)\]/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const chordText = match[1];
        const matchIndex = match.index;
        
        // Se não for um acorde estrutural (ex: [Refrão], [Solo]), trata como texto comum na letra
        if (!isChord(chordText)) {
          const textBefore = line.substring(lastIndex, matchIndex);
          lyricLine += textBefore + chordText;
          lastIndex = regex.lastIndex;
          continue;
        }
        
        const textBefore = line.substring(lastIndex, matchIndex);
        lyricLine += textBefore;
        
        const targetVisualPos = lyricLine.length;
        let spacesNeeded = targetVisualPos - chordLineVisualLength;
        if (spacesNeeded <= 0 && chordLineVisualLength > 0) {
          spacesNeeded = 1;
        }
        if (spacesNeeded > 0) {
          chordLine += " ".repeat(spacesNeeded);
          chordLineVisualLength += spacesNeeded;
        }
        
        // Renderiza o acorde no estilo Cifra Club (laranja do Focatto, bold, sem boxes que quebrem palavras)
        chordLine += `<span class="text-[#ef7c2c] font-bold select-none cursor-pointer hover:text-[#f99247] transition-colors">${chordText}</span>`;
        chordLineVisualLength += chordText.length;
        
        lastIndex = regex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        lyricLine += line.substring(lastIndex);
      }
      
      if (lyricLine.trim() === "") {
        formattedLines.push(chordLine);
      } else {
        formattedLines.push(chordLine);
        formattedLines.push(lyricLine);
      }
    }

    return formattedLines.join("\n");
  };

  // Formata o texto da cifra para HTML com tags estéticas
  const formatCifraToHtml = (text: string) => {
    const transposed = renderCifraText(text, transposeOffset);
    if (!showChords) {
      // Remove acordes e deixa apenas a letra
      return transposed.replace(/\[([^\]]+)\]/g, "");
    }
    
    return renderBracketsToCifraClubHtml(transposed);
  };

  // Efeito de Auto-Scroll
  useEffect(() => {
    if (scrollSpeed === 0 || !cifraContainerRef.current) return;
    
    const interval = setInterval(() => {
      if (cifraContainerRef.current) {
        cifraContainerRef.current.scrollTop += scrollSpeed;
      }
    }, 45);
    
    return () => clearInterval(interval);
  }, [scrollSpeed]);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col font-body">
      
      {/* Header Focatto */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-850/60 bg-surface-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-surface-450 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Início</span>
          </Link>
          <span className="text-surface-700">|</span>
          <span className="font-display font-bold text-lg text-white">
            Focatto<span className="text-[#ef7c2c]">.</span>Agenda
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <ChatHeaderButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* Banner Geral */}
        <div className="relative rounded-3xl border border-surface-850 bg-gradient-to-r from-surface-900/60 to-surface-900/30 p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef7c2c]/5 rounded-bl-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#ef7c2c] text-xs font-bold uppercase tracking-widest animate-pulse">
                <Sparkle size={14} weight="fill" />
                <span>Módulo de Escalas e Repertórios</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white mt-1 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{config.icon}</span> 
                {bandCreated ? bandName : config.title}
              </h2>
              <p className="text-sm text-surface-400 max-w-xl">
                {config.subtitle}
              </p>
            </div>
            
            {!bandCreated ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg hover:shadow-[#ef7c2c]/20 transition-all"
              >
                <Plus size={16} weight="bold" />
                <span>Ativar Agenda</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center p-3 rounded-xl border border-surface-800 bg-surface-900/40 text-surface-400 hover:text-white hover:bg-surface-850 transition-colors"
                  title="Configurar Grupo"
                >
                  <Gear size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 mt-6 bg-surface-950/40 border border-surface-850/60 p-3.5 rounded-xl text-xs text-surface-400 max-w-2xl">
            <WarningCircle size={16} className="text-[#ef7c2c] shrink-0 mt-0.5" />
            <span><strong>Dica:</strong> {config.hint}</span>
          </div>
        </div>

        {!bandCreated ? (
          /* Estado Vazio: Nenhuma Banda Criada */
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-surface-800 bg-surface-900/10 text-center gap-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-surface-900 flex items-center justify-center text-surface-500 border border-surface-800">
              <Calendar size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="text-lg font-semibold text-white">Configuração Pendente</h3>
              <p className="text-xs text-surface-400">
                Ative a agenda para criar a sua banda ou ministério, agendar escalas de ensaios, estruturar setlists de repertórios e cadastrar datas de indisponibilidade de músicos.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#ef7c2c] text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-all hover:bg-[#ef7c2c]/90 hover:-translate-y-0.5"
            >
              Dar Nome ao Grupo
            </button>
          </div>
        ) : (
          /* Visualização Geral com Painel Completo */
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Navegação Secundária em Tabs */}
            <div className="flex border-b border-surface-850/60 gap-4 sm:gap-6 overflow-x-auto pb-1">
              {(["dashboard", "escalas", "repertorio", "integrantes", "indisponibilidade"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setScrollSpeed(0);
                  }}
                  className={`text-xs sm:text-sm font-semibold pb-3 transition-colors capitalize whitespace-nowrap relative ${
                    activeTab === tab ? "text-[#ef7c2c]" : "text-surface-400 hover:text-surface-200"
                  }`}
                >
                  {tab === "repertorio" ? "Repertório" : tab === "indisponibilidade" ? "Minha Indisponibilidade" : tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ef7c2c] rounded-full animate-fadeIn" />
                  )}
                </button>
              ))}
            </div>

            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Lado Esquerdo: Próximas Escalas */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-semibold text-white">Eventos Agendados</h3>
                    <button
                      onClick={() => setActiveTab("escalas")}
                      className="text-xs text-[#ef7c2c] hover:underline"
                    >
                      Ver escalas completas
                    </button>
                  </div>

                  {events.length === 0 ? (
                    <div className="bg-surface-900/20 border border-surface-850/80 rounded-2xl p-8 text-center text-xs text-surface-400">
                      Nenhum evento agendado. Clique na aba Escalas para agendar.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {events.map((evt) => {
                        // Verifica se "você" (simulado por Jessica) está escalado para confirmar
                        const isJessicaEscalada = Object.values(evt.members).find(m => m.memberId === "m2");
                        
                        return (
                          <div key={evt.id} className="bg-surface-900/40 border border-surface-850 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  evt.type === "Show" || evt.type === "Apresentação" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {evt.type}
                                </span>
                                <h4 className="text-sm font-semibold text-white">{evt.title}</h4>
                              </div>
                              
                              <div className="flex flex-col gap-1 text-[11px] text-surface-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={12} className="text-[#ef7c2c]" />
                                  <span>{new Date(evt.date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={12} className="text-[#ef7c2c]" />
                                  <span>{evt.location}</span>
                                </div>
                              </div>

                              {evt.songs.length > 0 && (
                                <div className="flex items-center gap-2.5 mt-2">
                                  <span className="text-[10px] text-surface-500">Músicas:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {evt.songs.map((songId) => {
                                      const s = songs.find(s => s.id === songId);
                                      return s ? (
                                        <span 
                                          key={songId}
                                          onClick={() => {
                                            setSelectedSong(s);
                                            setTransposeOffset(0);
                                            setShowSongDetailsModal(true);
                                          }}
                                          className="text-[10px] font-medium text-surface-300 bg-surface-950/60 border border-surface-800 hover:border-[#ef7c2c]/40 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                        >
                                          🎵 {s.title}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Ações Rápidas de Integrante (Jessica Souza - simulada) */}
                            {isJessicaEscalada && (
                              <div className="flex flex-col gap-2 bg-surface-950/45 p-4 rounded-xl border border-surface-800 sm:min-w-[200px]">
                                <span className="text-[10px] font-semibold text-surface-450 uppercase tracking-wider block text-center border-b border-surface-850 pb-1.5">Sua Escala</span>
                                <div className="flex flex-col gap-1 text-center mt-1">
                                  <span className="text-xs text-white font-medium">{isJessicaEscalada.role}</span>
                                  <span className={`text-[10px] font-bold ${
                                    isJessicaEscalada.status === "confirmado" ? "text-emerald-400" :
                                    isJessicaEscalada.status === "recusado" ? "text-red-400" : "text-amber-400"
                                  }`}>
                                    Status: {isJessicaEscalada.status.toUpperCase()}
                                  </span>
                                </div>
                                {isJessicaEscalada.status === "pendente" ? (
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleConfirmScale(evt.id, "m2", true)}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1.5 rounded transition-colors"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => {
                                        const comment = prompt("Digite a justificativa da recusa:");
                                        if (comment !== null) {
                                          handleConfirmScale(evt.id, "m2", false, comment || "Indisponível");
                                        }
                                      }}
                                      className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold py-1.5 rounded transition-colors"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleConfirmScale(evt.id, "m2", false)} // toggle/reset
                                    className="text-[10px] text-surface-500 hover:text-white underline mt-1 text-center"
                                  >
                                    Alterar resposta
                                  </button>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Lado Direito: Estatísticas & Resumos rápidos */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Resumo Repertório */}
                  <div className="bg-surface-900/40 border border-surface-850 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Repertório Rápido</h4>
                      <button onClick={() => setActiveTab("repertorio")} className="text-[10px] text-[#ef7c2c] hover:underline">Ver todas</button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {songs.slice(0, 3).map((song) => (
                        <div 
                          key={song.id}
                          onClick={() => {
                            setSelectedSong(song);
                            setTransposeOffset(0);
                            setShowSongDetailsModal(true);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-950/40 border border-surface-850/40 hover:border-[#ef7c2c]/40 cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-white">{song.title}</span>
                            <span className="text-[9px] text-surface-500">{song.artist}</span>
                          </div>
                          <span className="text-[10px] text-[#ef7c2c] font-semibold bg-[#ef7c2c]/10 px-2 py-0.5 rounded-full">{song.key}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo Integrantes */}
                  <div className="bg-surface-900/40 border border-surface-850 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Equipe ({members.length})</h4>
                      <button onClick={() => setActiveTab("integrantes")} className="text-[10px] text-[#ef7c2c] hover:underline">Gerenciar</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {members.slice(0, 4).map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-950/20 text-xs">
                          <span className="text-white font-medium">{m.name}</span>
                          <span className="text-[10px] text-surface-500 font-medium">{m.instrument}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: REPERTÓRIO */}
            {activeTab === "repertorio" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-display font-semibold text-white">Repertório Musical</h3>
                    <p className="text-xs text-surface-400">Banco de dados central de músicas, letras e cifras cifradas.</p>
                  </div>
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="flex items-center gap-1.5 bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-all hover:-translate-y-0.5"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Adicionar Música</span>
                  </button>
                </div>

                {songs.length === 0 ? (
                  <div className="bg-surface-900/10 border border-surface-800 border-dashed rounded-2xl p-16 text-center text-xs text-surface-400 flex flex-col items-center gap-2">
                    <MusicNotes size={28} />
                    <span>Nenhuma música no repertório. Cadastre uma música para começar.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => {
                          setSelectedSong(song);
                          setTransposeOffset(0);
                          setShowSongDetailsModal(true);
                        }}
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-surface-850 bg-surface-900/30 hover:bg-surface-900/60 hover:border-[#ef7c2c]/40 transition-colors cursor-pointer relative shadow-sm"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <h4 className="text-sm font-semibold text-white group-hover:text-[#ef7c2c] transition-colors">{song.title}</h4>
                              <span className="text-[10px] text-surface-500">{song.artist}</span>
                            </div>
                            
                            <button
                              onClick={(e) => handleDeleteSong(song.id, e)}
                              className="text-surface-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-800"
                              title="Excluir música"
                            >
                              <Trash size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-surface-400">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-surface-500">Tom:</span>
                              <span className="text-[#ef7c2c] font-bold">{song.key}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-surface-500">BPM:</span>
                              <span>{song.bpm}</span>
                            </div>
                            {(song.youtube || song.spotify || song.deezer) && (
                              <div className="flex items-center gap-1.5 ml-auto">
                                {song.youtube && <YoutubeLogo size={14} className="text-red-400" />}
                                {song.spotify && <SpotifyLogo size={14} className="text-emerald-400" />}
                                {song.deezer && (
                                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#a238ff]">
                                    <title>Deezer</title>
                                    <path d="M2 16h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm5 12h3v2H7zm0-4h3v2H7zm0-4h3v2H7zm5 8h3v2h-3zm0-4h3v2h-3zm5 4h3v2h-3zm0-4h3v2h-3zm0-4h3v2h-3z"/>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ESCALAS */}
            {activeTab === "escalas" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-display font-semibold text-white">Escalas e Eventos</h3>
                    <p className="text-xs text-surface-400">Crie escalas de cultos/shows, setlists de repertórios e escalação de músicos.</p>
                  </div>
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="flex items-center gap-1.5 bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-all hover:-translate-y-0.5"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Criar Escala / Evento</span>
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className="bg-surface-900/10 border border-surface-800 border-dashed rounded-2xl p-16 text-center text-xs text-surface-400 flex flex-col items-center gap-2">
                    <Calendar size={28} />
                    <span>Nenhum evento agendado. Clique para criar uma nova escala.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {events.map((evt) => (
                      <div key={evt.id} className="bg-surface-900/40 border border-surface-850 p-6 rounded-2xl flex flex-col gap-4 relative shadow-md">
                        
                        {/* Excluir Evento */}
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="absolute top-4 right-4 text-surface-500 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-surface-850"
                          title="Remover Evento"
                        >
                          <Trash size={16} />
                        </button>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              evt.type === "Show" || evt.type === "Apresentação" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {evt.type}
                            </span>
                            <h4 className="text-base font-semibold text-white">{evt.title}</h4>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-surface-400 mt-1">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-[#ef7c2c]" />
                              <span>{new Date(evt.date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-[#ef7c2c]" />
                              <span>{evt.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Setlist */}
                        {evt.songs.length > 0 && (
                          <div className="border-t border-surface-850/60 pt-3">
                            <span className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block mb-2">Músicas do Evento (Setlist)</span>
                            <div className="flex flex-wrap gap-2">
                              {evt.songs.map((songId) => {
                                const s = songs.find(s => s.id === songId);
                                return s ? (
                                  <div 
                                    key={songId}
                                    onClick={() => {
                                      setSelectedSong(s);
                                      setTransposeOffset(0);
                                      setShowSongDetailsModal(true);
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-white bg-surface-950/70 border border-surface-800 hover:border-[#ef7c2c]/40 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <FileText size={12} className="text-surface-450" />
                                    <span>{s.title}</span>
                                    <span className="text-[10px] text-[#ef7c2c] bg-[#ef7c2c]/10 px-1.5 py-0.25 rounded font-mono font-semibold">{s.key}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Escala de Músicos */}
                        <div className="border-t border-surface-850/60 pt-3">
                          <span className="text-[10px] font-bold text-surface-450 uppercase tracking-wider block mb-2">Escala de Músicos</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Object.values(evt.members).map((scaled) => {
                              const m = members.find(mem => mem.id === scaled.memberId);
                              return m ? (
                                <div key={scaled.memberId} className="flex flex-col justify-between p-3 rounded-xl bg-surface-950/40 border border-surface-850/80">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-white">{m.name}</span>
                                    <span className="text-[9px] text-surface-500 font-semibold uppercase">{scaled.role}</span>
                                  </div>

                                  {/* Status */}
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-850/30">
                                    {scaled.status === "confirmado" && (
                                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
                                        <CheckCircle size={12} weight="fill" /> Confirmado
                                      </span>
                                    )}
                                    {scaled.status === "pendente" && (
                                      <span className="flex items-center gap-1 text-[9px] text-amber-400 font-semibold">
                                        <Circle size={12} /> Pendente
                                      </span>
                                    )}
                                    {scaled.status === "recusado" && (
                                      <div className="flex flex-col gap-0.5">
                                        <span className="flex items-center gap-1 text-[9px] text-red-400 font-semibold">
                                          <XCircle size={12} weight="fill" /> Recusado
                                        </span>
                                        {scaled.comment && (
                                          <span className="text-[9px] text-surface-500 leading-tight italic">"{scaled.comment}"</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB: INTEGRANTES */}
            {activeTab === "integrantes" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-display font-semibold text-white">Integrantes do Grupo</h3>
                    <p className="text-xs text-surface-400">Gerencie quem faz parte do grupo e as funções/instrumentos correspondentes.</p>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-1.5 bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-all hover:-translate-y-0.5"
                  >
                    <UserPlus size={14} weight="bold" />
                    <span>Convidar Integrante</span>
                  </button>
                </div>

                <div className="bg-surface-900/30 border border-surface-850 rounded-2xl overflow-hidden shadow-md">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-900/60 border-b border-surface-850/70 text-surface-400 font-semibold">
                        <th className="p-4">Nome</th>
                        <th className="p-4">Instrumento Principal</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id} className="border-b border-surface-850/45 hover:bg-surface-900/20 transition-colors">
                          <td className="p-4 font-semibold text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-display text-white text-xs font-bold shadow-sm uppercase">
                              {m.name.charAt(0)}
                            </div>
                            <span>{m.name}</span>
                          </td>
                          <td className="p-4 text-surface-300 font-medium">{m.instrument}</td>
                          <td className="p-4 text-surface-400 font-mono">{m.email}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Deseja remover ${m.name} da banda?`)) {
                                  saveMembers(members.filter(mem => mem.id !== m.id));
                                }
                              }}
                              className="text-surface-650 hover:text-red-400 p-1.5 rounded transition-colors"
                              title="Remover integrante"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB: INDISPONIBILIDADE */}
            {activeTab === "indisponibilidade" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Lado Esquerdo: Formulário de Adicionar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-surface-900/40 border border-surface-850 p-6 rounded-2xl flex flex-col gap-4 shadow-md">
                    <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                      <CalendarCheck size={18} className="text-[#ef7c2c]" />
                      <span>Cadastrar Data</span>
                    </h3>
                    <p className="text-xs text-surface-400 leading-relaxed">
                      Marque datas onde você **não estará disponível** para tocar. O líder receberá um alerta se tentar escalar você nessas datas.
                    </p>

                    <form onSubmit={handleAddIndisponibilidade} className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="indisp-date" className="text-xs font-semibold text-surface-300">Data de Indisponibilidade</label>
                        <input
                          type="date"
                          id="indisp-date"
                          value={indispDate}
                          onChange={(e) => setIndispDate(e.target.value)}
                          required
                          className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="indisp-reason" className="text-xs font-semibold text-surface-300">Justificativa / Motivo</label>
                        <textarea
                          id="indisp-reason"
                          value={indispReason}
                          onChange={(e) => setIndispReason(e.target.value)}
                          placeholder="Ex: Viagem, Prova, Compromisso pessoal..."
                          required
                          rows={3}
                          className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow"
                      >
                        Marcar Indisponibilidade
                      </button>
                    </form>
                  </div>
                </div>

                {/* Lado Direito: Histórico */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <h3 className="text-lg font-display font-semibold text-white">Suas Datas Registradas</h3>
                  
                  {indisponibilidades.length === 0 ? (
                    <div className="bg-surface-900/20 border border-surface-850 rounded-2xl p-12 text-center text-xs text-surface-450">
                      Você não tem nenhuma indisponibilidade registrada. Está 100% livre para escalas!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {indisponibilidades.map((ind) => (
                        <div key={ind.date} className="bg-surface-900/40 border border-surface-850 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-white">
                              {new Date(ind.date + "T00:00:00").toLocaleDateString("pt-BR", { dateStyle: "long" })}
                            </span>
                            <span className="text-[10px] text-surface-450 leading-snug font-body">Motivo: {ind.reason}</span>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveIndisp(ind.date)}
                            className="text-surface-600 hover:text-red-400 p-1.5 rounded transition-colors"
                            title="Remover data"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* MODAL: CONFIGURAÇÃO NOME DA BANDA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleCreateBandSubmit}
            className="relative w-full max-w-md bg-surface-900 border border-surface-850 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-scaleUp"
          >
            
            <button 
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-display font-semibold text-white">
                Configurar Grupo Musical
              </h3>
              <p className="text-xs text-surface-455">
                Altere ou defina o nome do seu grupo de {config.title.toLowerCase()}.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="band-name-input" className="text-xs text-surface-300 font-semibold">Nome do Grupo</label>
              <input
                type="text"
                id="band-name-input"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                placeholder="Ex: Banda Sonoridade, Ministério Adoração..."
                required
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-semibold text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-surface-850 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 px-4 py-2.5 rounded-lg shadow-md transition-colors"
              >
                Salvar Grupo
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODAL: ADICIONAR MÚSICA */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleAddSongSubmit}
            className="relative w-full max-w-lg bg-surface-900 border border-surface-850 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
          >
            
            <button 
              type="button"
              onClick={() => setShowAddSongModal(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-display font-semibold text-white">Cadastrar Nova Música</h3>
              <p className="text-xs text-surface-450">Cadastre a música e sua respectiva cifra usando colchetes [C] para os acordes.</p>
            </div>

            {/* IMPORTAÇÃO POR URL DO CIFRA CLUB */}
            <div className="bg-surface-950/40 border border-surface-850 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cifraclub-url" className="text-xs font-semibold text-[#ef7c2c] flex items-center gap-1">
                  <span>Importar do Cifra Club via URL</span>
                  <span className="text-[10px] text-surface-500 font-normal">(Música ou Playlist/Artista)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="cifraclub-url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Cole a URL do Cifra Club aqui..."
                    className="flex-1 bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleImportFromUrl}
                    disabled={importing}
                    className="bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 disabled:bg-surface-800 disabled:text-surface-500 text-xs font-semibold text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    {importing ? "Importando..." : "Importar"}
                  </button>
                </div>
                {importError && (
                  <span className="text-[10px] text-red-400 mt-1">{importError}</span>
                )}
              </div>

              {/* SELEÇÃO DE PLAYLIST / COLEÇÃO */}
              {collectionSongs.length > 0 && (
                <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl flex flex-col gap-3 mt-1">
                  <span className="text-xs font-semibold text-white">Músicas encontradas ({collectionSongs.length}):</span>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                    {collectionSongs.map((song, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-xs text-surface-300 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={song.checked}
                          onChange={() => {
                            setCollectionSongs(prev => prev.map((s, i) => i === idx ? { ...s, checked: !s.checked } : s));
                          }}
                          className="rounded border-surface-750 text-[#ef7c2c] focus:ring-[#ef7c2c] bg-surface-950"
                        />
                        <span>{song.title}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setCollectionSongs([])}
                      className="text-[10px] text-surface-400 hover:text-white font-semibold px-2 py-1 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleImportCollection}
                      disabled={importing}
                      className="bg-[#ef7c2c]/10 border border-[#ef7c2c]/30 text-[#ef7c2c] hover:bg-[#ef7c2c]/20 text-[10px] font-semibold px-3 py-1.5 rounded"
                    >
                      {importing ? "Importando..." : "Importar Selecionadas"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-surface-850/40 my-1" />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="song-title" className="text-xs font-semibold text-surface-300">Título da Música</label>
                <input
                  type="text"
                  id="song-title"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="Ex: Oceanos, Porque Ele Vive..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="song-artist" className="text-xs font-semibold text-surface-300">Artista / Compositor</label>
                <input
                  type="text"
                  id="song-artist"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  placeholder="Ex: Hillsong, Harpa Cristã..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="song-key" className="text-xs font-semibold text-surface-300">Tom Original</label>
                <select
                  id="song-key"
                  value={newSongKey}
                  onChange={(e) => setNewSongKey(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 transition-colors"
                >
                  {chromaticScale.concat(flatScale.slice(1)).map((k, idx) => (
                    <option key={idx} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="song-bpm" className="text-xs font-semibold text-surface-300">BPM (Batidas)</label>
                <input
                  type="number"
                  id="song-bpm"
                  value={newSongBpm}
                  onChange={(e) => setNewSongBpm(Number(e.target.value))}
                  placeholder="Ex: 72, 120"
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="song-youtube" className="text-xs font-semibold text-surface-300">Link do YouTube (Opcional)</label>
                <input
                  type="url"
                  id="song-youtube"
                  value={newSongYoutube}
                  onChange={(e) => setNewSongYoutube(e.target.value)}
                  placeholder="Vídeo de ensaio"
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="song-spotify" className="text-xs font-semibold text-surface-300">Link do Spotify (Opcional)</label>
                <input
                  type="url"
                  id="song-spotify"
                  value={newSongSpotify}
                  onChange={(e) => setNewSongSpotify(e.target.value)}
                  placeholder="Áudio oficial Spotify"
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="song-deezer" className="text-xs font-semibold text-surface-300">Link do Deezer (Opcional)</label>
                <input
                  type="url"
                  id="song-deezer"
                  value={newSongDeezer}
                  onChange={(e) => setNewSongDeezer(e.target.value)}
                  placeholder="Áudio oficial Deezer"
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="song-cifra" className="text-xs font-semibold text-surface-300">Letra e Cifra</label>
                <button
                  type="button"
                  onClick={() => {
                    const searchQuery = newSongTitle || newSongArtist 
                      ? `${newSongTitle} ${newSongArtist} cifra club` 
                      : "cifra club";
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
                  }}
                  className="text-[10px] text-[#ef7c2c] hover:text-[#f99247] font-semibold transition-colors flex items-center gap-1"
                  title="Buscar cifra no Google para copiar"
                >
                  Buscar no Cifra Club ↗
                </button>
              </div>
              <span className="text-[10px] text-surface-500 mb-1 leading-relaxed">Use colchetes na letra (ex: <code>No [C] meu peito...</code>) ou <strong>cole a cifra inteira do Cifra Club</strong> para auto-conversão automática.</span>
              <textarea
                id="song-cifra"
                value={newSongCifra}
                onChange={(e) => setNewSongCifra(e.target.value)}
                onBlur={handleCifraBlur}
                onPaste={handleCifraPaste}
                placeholder="Insira a letra com acordes entre colchetes ou cole do Cifra Club..."
                required
                rows={8}
                className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddSongModal(false)}
                className="text-xs font-semibold text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-surface-850 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 px-4 py-2.5 rounded-lg shadow-md transition-colors"
              >
                Adicionar Música
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODAL: DETALHES DA MÚSICA & VISUALIZADOR DE CIFRAS */}
      {showSongDetailsModal && selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-md animate-fadeIn">
          
          <div className="relative w-full max-w-4xl bg-surface-900 border border-surface-850 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[95vh] animate-scaleUp">
            
            {/* Fechar */}
            <button 
              onClick={() => {
                setShowSongDetailsModal(false);
                setScrollSpeed(0);
                setTransposeOffset(0);
                setIsEditingSong(false);
              }}
              className="absolute top-5 right-5 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1.5 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho de Informações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-surface-850/60 pb-4 pr-10 gap-4">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-display font-semibold text-white">{selectedSong.title}</h3>
                  {isEditingSong ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingSong(false)}
                      className="text-[10px] bg-surface-850 hover:bg-surface-800 text-surface-300 px-2.5 py-1.5 rounded-lg border border-surface-800 font-semibold transition-all"
                    >
                      Voltar ao Visualizador
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditingSong}
                      className="text-[10px] bg-surface-850 hover:bg-[#ef7c2c]/10 text-surface-300 hover:text-[#ef7c2c] px-2.5 py-1.5 rounded-lg border border-surface-800 hover:border-[#ef7c2c]/30 font-semibold transition-all flex items-center gap-1.5"
                      title="Editar cifra ou informações da música"
                    >
                      <PencilSimple size={12} /> Editar Cifra
                    </button>
                  )}
                </div>
                <span className="text-xs text-[#ef7c2c] font-semibold">{selectedSong.artist}</span>
              </div>

              {/* Controles do Visualizador (BPM, Tom Original, Tom Atual, Transposição) */}
              {!isEditingSong && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-surface-950 border border-surface-850 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-surface-500 font-semibold">Tom Original:</span>
                    <span className="font-bold text-white">{selectedSong.key}</span>
                  </div>

                  <div className="bg-surface-950 border border-surface-850 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-surface-500 font-semibold">Tom Transposto:</span>
                    <span className="font-bold text-[#ef7c2c]">{transposeChord(selectedSong.key, transposeOffset)}</span>
                  </div>

                  <div className="bg-surface-950 border border-surface-850 px-2 py-1 rounded-xl flex items-center gap-1">
                    <button
                      onClick={() => setTransposeOffset(prev => prev - 1)}
                      className="w-6 h-6 rounded bg-surface-850 hover:bg-surface-800 flex items-center justify-center font-bold text-white"
                    >
                      -
                    </button>
                    <span className="text-[10px] text-surface-400 font-mono w-10 text-center">Offset: {transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset}</span>
                    <button
                      onClick={() => setTransposeOffset(prev => prev + 1)}
                      className="w-6 h-6 rounded bg-surface-850 hover:bg-surface-800 flex items-center justify-center font-bold text-white"
                    >
                      +
                    </button>
                  </div>

                  {/* Salvar Tom Transposto */}
                  {transposeOffset !== 0 && (
                    <button
                      onClick={handleSaveTransposedKey}
                      className="bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 text-[10px] font-bold text-white px-3 py-2 rounded-xl shadow-md transition-all flex items-center"
                      title="Salvar este tom transposto como o novo tom padrão da música"
                    >
                      Salvar Tom
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Corpo Central Dividido (Esquerda: Cifra / Direita: Mídia de Apoio ou Formulário de Edição) */}
            {isEditingSong ? (
              <form onSubmit={handleEditSongSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2 pb-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-title" className="text-xs font-semibold text-surface-300">Título da Música</label>
                    <input
                      type="text"
                      id="edit-song-title"
                      value={editSongTitle}
                      onChange={(e) => setEditSongTitle(e.target.value)}
                      required
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-artist" className="text-xs font-semibold text-surface-300">Artista / Compositor</label>
                    <input
                      type="text"
                      id="edit-song-artist"
                      value={editSongArtist}
                      onChange={(e) => setEditSongArtist(e.target.value)}
                      required
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-key" className="text-xs font-semibold text-surface-300">Tom Padrão</label>
                    <select
                      id="edit-song-key"
                      value={editSongKey}
                      onChange={(e) => setEditSongKey(e.target.value)}
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 transition-colors"
                    >
                      {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"].map(k => (
                        <option key={k} value={k} className="bg-surface-950">{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-bpm" className="text-xs font-semibold text-surface-300">BPM (Metrônomo)</label>
                    <input
                      type="number"
                      id="edit-song-bpm"
                      value={editSongBpm}
                      onChange={(e) => setEditSongBpm(Number(e.target.value))}
                      min={40}
                      max={250}
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-youtube" className="text-xs font-semibold text-surface-300">Link do YouTube (Opcional)</label>
                    <input
                      type="url"
                      id="edit-song-youtube"
                      value={editSongYoutube}
                      onChange={(e) => setEditSongYoutube(e.target.value)}
                      placeholder="Ex: https://youtube.com/watch?v=..."
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-spotify" className="text-xs font-semibold text-surface-300">Link do Spotify (Opcional)</label>
                    <input
                      type="url"
                      id="edit-song-spotify"
                      value={editSongSpotify}
                      onChange={(e) => setEditSongSpotify(e.target.value)}
                      placeholder="Ex: https://open.spotify.com/track/..."
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-song-deezer" className="text-xs font-semibold text-surface-300">Link do Deezer (Opcional)</label>
                    <input
                      type="url"
                      id="edit-song-deezer"
                      value={editSongDeezer}
                      onChange={(e) => setEditSongDeezer(e.target.value)}
                      placeholder="Ex: https://www.deezer.com/track/..."
                      className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="edit-song-cifra" className="text-xs font-semibold text-surface-300">Letra e Cifra</label>
                    <button
                      type="button"
                      onClick={() => {
                        const searchQuery = editSongTitle || editSongArtist 
                          ? `${editSongTitle} ${editSongArtist} cifra club` 
                          : "cifra club";
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
                      }}
                      className="text-[10px] text-[#ef7c2c] hover:text-[#f99247] font-semibold transition-colors flex items-center gap-1"
                      title="Buscar cifra no Google para copiar"
                    >
                      Buscar no Cifra Club ↗
                    </button>
                  </div>
                  <span className="text-[10px] text-surface-500 mb-1 leading-relaxed">Use colchetes na letra (ex: <code>No [C] meu peito...</code>) ou <strong>cole a cifra inteira do Cifra Club</strong> para auto-conversão automática.</span>
                  <textarea
                    id="edit-song-cifra"
                    value={editSongCifra}
                    onChange={(e) => setEditSongCifra(e.target.value)}
                    onBlur={handleEditCifraBlur}
                    onPaste={handleEditCifraPaste}
                    placeholder="Cole ou edite a cifra aqui..."
                    required
                    rows={12}
                    className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors resize-y"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingSong(false)}
                    className="text-xs font-semibold text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-surface-850 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-white bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 px-4 py-2.5 rounded-lg shadow-md transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                
                {/* Lado Esquerdo: Área de Cifra */}
                <div className="lg:col-span-7 flex flex-col gap-3 overflow-hidden bg-surface-950 border border-surface-850 rounded-2xl p-4">
                  
                  {/* Controles de Cifra (Auto-Scroll, Modo Cifra/Letra) */}
                  <div className="flex items-center justify-between border-b border-surface-850/40 pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-surface-500 font-semibold">Auto-Scroll:</span>
                      <div className="flex items-center bg-surface-900 border border-surface-850 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setScrollSpeed(0)}
                          className={`px-2 py-1 text-[10px] font-semibold ${scrollSpeed === 0 ? "bg-red-500/20 text-red-400 font-bold" : "text-surface-400"}`}
                        >
                          <Pause size={12} className="inline mr-1" />Parar
                        </button>
                        <button
                          onClick={() => setScrollSpeed(1)}
                          className={`px-2.5 py-1 text-[10px] font-semibold border-l border-surface-850/60 ${scrollSpeed === 1 ? "bg-[#ef7c2c]/20 text-[#ef7c2c]" : "text-surface-400"}`}
                        >
                          1x
                        </button>
                        <button
                          onClick={() => setScrollSpeed(2)}
                          className={`px-2.5 py-1 text-[10px] font-semibold border-l border-surface-850/60 ${scrollSpeed === 2 ? "bg-[#ef7c2c]/20 text-[#ef7c2c]" : "text-surface-400"}`}
                        >
                          2x
                        </button>
                        <button
                          onClick={() => setScrollSpeed(3)}
                          className={`px-2.5 py-1 text-[10px] font-semibold border-l border-surface-850/60 ${scrollSpeed === 3 ? "bg-[#ef7c2c]/20 text-[#ef7c2c]" : "text-surface-400"}`}
                        >
                          3x
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowChords(prev => !prev)}
                        className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          showChords 
                            ? "bg-[#ef7c2c]/10 border-[#ef7c2c]/30 text-[#ef7c2c]" 
                            : "bg-surface-900 border-surface-850 text-surface-450"
                        }`}
                      >
                        {showChords ? "Ocultar Acordes" : "Mostrar Acordes"}
                      </button>
                    </div>
                  </div>

                  {/* Pre/Código da Cifra */}
                  <pre 
                    ref={cifraContainerRef}
                    className="flex-1 overflow-auto text-xs sm:text-sm font-mono text-surface-300 leading-relaxed whitespace-pre select-text pr-2 scroll-smooth max-h-[55vh]"
                    dangerouslySetInnerHTML={{ __html: formatCifraToHtml(selectedSong.cifra) }}
                  />
                </div>

                {/* Lado Direito: YouTube Embed & Links de Estudo */}
                <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-1">
                  
                  {/* Metrônomo Informação */}
                  <div className="bg-surface-950 border border-surface-850 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">Metrônomo Recomendado</span>
                      <span className="text-sm font-bold text-white">{selectedSong.bpm} BPM</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#ef7c2c]/10 border border-[#ef7c2c]/20 flex items-center justify-center text-[#ef7c2c] animate-pulse">
                      <Clock size={18} />
                    </div>
                  </div>

                  {/* Youtube Embed se link existir */}
                  {selectedSong.youtube ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <YoutubeLogo size={14} className="text-red-400" />
                        <span>Vídeo de Referência / Ensaio</span>
                      </span>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-850 bg-black/60 shadow-lg">
                        {/* Tenta extrair id do youtube */}
                        {(() => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = selectedSong.youtube?.match(regExp);
                          const videoId = (match && match[2].length === 11) ? match[2] : null;
                          
                          return videoId ? (
                            <iframe 
                              src={`https://www.youtube.com/embed/${videoId}`} 
                              title="YouTube video player" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs text-surface-450">
                              Link do YouTube cadastrado: <br />
                              <a href={selectedSong.youtube} target="_blank" rel="noopener noreferrer" className="text-[#ef7c2c] underline mt-1 break-all">{selectedSong.youtube}</a>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-950 border border-surface-850 border-dashed rounded-xl p-8 text-center text-xs text-surface-500 flex flex-col items-center gap-1">
                      <YoutubeLogo size={20} />
                      <span>Sem vídeo do YouTube vinculado.</span>
                    </div>
                  )}

                  {/* Spotify / Links rápidos */}
                  {selectedSong.spotify && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <SpotifyLogo size={14} className="text-emerald-400" />
                        <span>Áudio Spotify</span>
                      </span>
                      <a
                        href={selectedSong.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-surface-950 hover:bg-surface-850/40 border border-surface-850 p-4 rounded-xl flex items-center justify-between text-xs text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <SpotifyLogo size={18} className="text-emerald-400" />
                          <span className="font-semibold">Ouvir no Spotify</span>
                        </div>
                        <CaretRight size={14} className="text-surface-500" />
                      </a>
                    </div>
                  )}

                  {/* Deezer / Links rápidos */}
                  {selectedSong.deezer && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#a238ff]">
                          <title>Deezer</title>
                          <path d="M2 16h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm5 12h3v2H7zm0-4h3v2H7zm0-4h3v2H7zm5 8h3v2h-3zm0-4h3v2h-3zm5 4h3v2h-3zm0-4h3v2h-3zm0-4h3v2h-3z"/>
                        </svg>
                        <span>Áudio Deezer</span>
                      </span>
                      <a
                        href={selectedSong.deezer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-surface-950 hover:bg-surface-850/40 border border-surface-850 p-4 rounded-xl flex items-center justify-between text-xs text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#a238ff]">
                            <path d="M2 16h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm0-4h3v2H2zm5 12h3v2H7zm0-4h3v2H7zm0-4h3v2H7zm5 8h3v2h-3zm0-4h3v2h-3zm5 4h3v2h-3zm0-4h3v2h-3zm0-4h3v2h-3z"/>
                          </svg>
                          <span className="font-semibold">Ouvir no Deezer</span>
                        </div>
                        <CaretRight size={14} className="text-surface-500" />
                      </a>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL: ADICIONAR INTEGRANTE */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleAddMemberSubmit}
            className="relative w-full max-w-md bg-surface-900 border border-surface-850 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp"
          >
            
            <button 
              type="button"
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-display font-semibold text-white">Convidar Integrante</h3>
              <p className="text-xs text-surface-450">Adicione um novo músico à equipe do seu grupo.</p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="member-name" className="text-xs font-semibold text-surface-300">Nome do Músico</label>
                <input
                  type="text"
                  id="member-name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ex: João Silva, Aline Mendes..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="member-instrument" className="text-xs font-semibold text-surface-300">Instrumento / Voz Principal</label>
                <input
                  type="text"
                  id="member-instrument"
                  value={newMemberInstrument}
                  onChange={(e) => setNewMemberInstrument(e.target.value)}
                  placeholder="Ex: Guitarra, Teclado, Canto Soprano, Som..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="member-email" className="text-xs font-semibold text-surface-300">E-mail (Opcional)</label>
                <input
                  type="email"
                  id="member-email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="membro@exemplo.com"
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-xs font-semibold text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-surface-850 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 px-4 py-2.5 rounded-lg shadow-md transition-colors"
              >
                Adicionar Integrante
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODAL: CRIAR ESCALA / EVENTO */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleAddEventSubmit}
            className="relative w-full max-w-2xl bg-surface-900 border border-surface-850 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
          >
            
            <button 
              type="button"
              onClick={() => setShowAddEventModal(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-display font-semibold text-white">Criar Nova Escala de Evento</h3>
              <p className="text-xs text-surface-450">Agende ensaios ou apresentações, monte a lista de músicas e escale os músicos da banda.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="evt-title" className="text-xs font-semibold text-surface-300">Nome do Evento</label>
                <input
                  type="text"
                  id="evt-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Ex: Ensaio Geral, Show de Sábado..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="evt-type" className="text-xs font-semibold text-surface-300">Tipo de Evento</label>
                <select
                  id="evt-type"
                  value={newEventPageType}
                  onChange={(e) => setNewEventPageType(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 transition-colors"
                >
                  <option value="Ensaio">Ensaio</option>
                  <option value="Apresentação">Apresentação / Show</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Gravação">Gravação</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="evt-date" className="text-xs font-semibold text-surface-300">Data e Hora</label>
                <input
                  type="datetime-local"
                  id="evt-date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="evt-loc" className="text-xs font-semibold text-surface-300">Localização</label>
                <input
                  type="text"
                  id="evt-loc"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="Ex: Sala de ensaio, Auditório..."
                  required
                  className="w-full bg-surface-950 border border-surface-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ef7c2c]/65 placeholder:text-surface-700 transition-colors"
                />
              </div>
            </div>

            {/* Setlist Selection */}
            <div className="flex flex-col gap-2 border-t border-surface-850/60 pt-3">
              <span className="text-xs font-semibold text-surface-300">Selecionar Setlist (Músicas)</span>
              {songs.length === 0 ? (
                <span className="text-[10px] text-surface-500">Nenhuma música cadastrada no repertório. Cadastre primeiro para vincular.</span>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-1 bg-surface-950/45 border border-surface-850 rounded-xl">
                  {songs.map((song) => {
                    const isSelected = newEventSongs.includes(song.id);
                    return (
                      <button
                        type="button"
                        key={song.id}
                        onClick={() => {
                          if (isSelected) setNewEventSongs(newEventSongs.filter(id => id !== song.id));
                          else setNewEventSongs([...newEventSongs, song.id]);
                        }}
                        className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isSelected 
                            ? "bg-[#ef7c2c]/10 border-[#ef7c2c]/40 text-[#ef7c2c]" 
                            : "bg-surface-900 border-surface-800 text-surface-450 hover:border-surface-700"
                        }`}
                      >
                        🎵 {song.title} ({song.key})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Escala de Músicos & Alertas de Indisponibilidade */}
            <div className="flex flex-col gap-2 border-t border-surface-850/60 pt-3">
              <span className="text-xs font-semibold text-surface-300">Escalar Equipe</span>
              <span className="text-[10px] text-surface-500 mb-1 leading-relaxed">Selecione o integrante para cada função. O sistema detectará automaticamente se há indisponibilidade prévia registrada.</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                {members.map((mem) => {
                  const checkIndisp = isMemberIndisponivel(newEventDate);
                  const isChecked = !!newEventMembers[mem.id];
                  
                  return (
                    <div 
                      key={mem.id}
                      className={`flex flex-col gap-2 p-3 rounded-xl border bg-surface-950/45 ${
                        checkIndisp.indisponivel 
                          ? "border-red-500/25 hover:border-red-500/40" 
                          : "border-surface-850 hover:border-surface-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">{mem.name}</span>
                          <span className="text-[9px] text-surface-500">Padrão: {mem.instrument}</span>
                        </div>
                        
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEventMembers({
                                ...newEventMembers,
                                [mem.id]: { memberId: mem.id, role: mem.instrument, status: "pendente" }
                              });
                            } else {
                              const copy = { ...newEventMembers };
                              delete copy[mem.id];
                              setNewEventMembers(copy);
                            }
                          }}
                          className="accent-[#ef7c2c] cursor-pointer"
                        />
                      </div>

                      {/* Input de Função Personalizada se estiver selecionado */}
                      {isChecked && (
                        <div className="flex items-center gap-1.5 mt-1 border-t border-surface-850/30 pt-1.5">
                          <span className="text-[9px] text-surface-500 font-bold uppercase">Função:</span>
                          <input
                            type="text"
                            value={newEventMembers[mem.id]?.role || ""}
                            onChange={(e) => {
                              setNewEventMembers({
                                ...newEventMembers,
                                [mem.id]: { ...newEventMembers[mem.id]!, role: e.target.value }
                              });
                            }}
                            className="bg-surface-900 border border-surface-800 text-[10px] text-white px-2 py-0.5 rounded w-full focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Alerta de Indisponibilidade */}
                      {checkIndisp.indisponivel && (
                        <div className="flex items-start gap-1 text-[9px] text-red-400 bg-red-500/5 p-1.5 rounded border border-red-500/10 mt-1">
                          <WarningCircle size={12} className="shrink-0 mt-0.5" />
                          <span>Membro indisponível nesta data! Motivo: "{checkIndisp.reason}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2 border-t border-surface-850/60 pt-3">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="text-xs font-semibold text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-surface-850 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-[#ef7c2c] hover:bg-[#ef7c2c]/90 px-4 py-2.5 rounded-lg shadow-md transition-colors"
              >
                Salvar Escala / Lançar
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Circle size={40} className="animate-spin text-[#ef7c2c]" />
          <p className="text-sm text-surface-400 font-body">Carregando painel de agenda...</p>
        </div>
      </div>
    }>
      <AgendaContent />
    </Suspense>
  );
}
