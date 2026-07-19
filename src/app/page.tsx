"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Tag, 
  GraduationCap, 
  Wrench, 
  Calendar, 
  X, 
  MusicNotes, 
  MicrophoneStage, 
  UsersThree, 
  Briefcase, 
  SquaresFour, 
  MusicNote,
  Sparkle
} from "@phosphor-icons/react";

interface BandTypeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bandTypes: BandTypeOption[] = [
    {
      id: "ministerio",
      title: "Ministério de Louvor",
      description: "Ideal para igrejas, ensaios litúrgicos e escalas de cultos semanais.",
      icon: <UsersThree size={24} weight="fill" />,
      color: "from-blue-500/20 to-indigo-500/20 hover:border-blue-500/50 text-blue-400"
    },
    {
      id: "gig",
      title: "GIG / Freelancers",
      description: "Para músicos de aluguel, casamentos e contratações avulsas de cachê.",
      icon: <Briefcase size={24} weight="fill" />,
      color: "from-emerald-500/20 to-teal-500/20 hover:border-emerald-500/50 text-emerald-400"
    },
    {
      id: "baile",
      title: "Banda de Baile / Eventos",
      description: "Para bandas que tocam em casamentos, formaturas e grandes festas.",
      icon: <MicrophoneStage size={24} weight="fill" />,
      color: "from-amber-500/20 to-orange-500/20 hover:border-amber-500/50 text-amber-400"
    },
    {
      id: "agencia",
      title: "Agência de Músicos",
      description: "Gerencie múltiplos projetos, artistas e agendas a nível corporativo.",
      icon: <SquaresFour size={24} weight="fill" />,
      color: "from-purple-500/20 to-pink-500/20 hover:border-purple-500/50 text-purple-400"
    },
    {
      id: "coral",
      title: "Coral / Grupo Vocal",
      description: "Focado em ensaios de naipes (soprano, contralto, tenor, baixo) e escalas de vozes.",
      icon: <MusicNotes size={24} weight="fill" />,
      color: "from-cyan-500/20 to-sky-500/20 hover:border-cyan-500/50 text-cyan-400"
    },
    {
      id: "outros",
      title: "Outros Grupos",
      description: "Bandas de rock, pop, grupos autorais, covers e projetos instrumentais em geral.",
      icon: <MusicNote size={24} weight="fill" />,
      color: "from-rose-500/20 to-red-500/20 hover:border-rose-500/50 text-rose-400"
    }
  ];

  const handleBandTypeSelect = (typeId: string) => {
    setIsModalOpen(false);
    router.push(`/agenda?type=${typeId}`);
  };

  return (
    <main className="relative min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Gradient Mesh Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#ef7c2c]/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none animate-pulse duration-[12000ms]" />

      <div className="w-full max-w-5xl z-10 flex flex-col items-center gap-10 md:gap-14 py-8">
        
        {/* Header/Branding */}
        <div className="text-center flex flex-col items-center gap-3 md:gap-4 max-w-xl animate-fadeSlideUp">
          <div className="flex items-center gap-2 bg-surface-900/60 border border-surface-850 px-4 py-1.5 rounded-full text-xs text-surface-400 font-medium shadow-lg backdrop-blur-md">
            <Sparkle size={14} className="text-[#ef7c2c]" />
            <span>Bem-vindo à nova experiência Focatto</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-semibold tracking-tight text-white mt-1">
            Focatto<span className="text-[#ef7c2c]">.</span>
          </h1>
          
          <p className="text-sm md:text-base text-surface-400 font-body leading-relaxed">
            O ecossistema definitivo para músicos, profissionais e contratantes. Escolha a sua jornada para começar.
          </p>
        </div>

        {/* 4 Cards Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 animate-fadeSlideUp" style={{ animationDelay: "150ms" }}>
          
          {/* Card 1: Marketplace */}
          <div 
            onClick={() => router.push("/explore?tab=produtos")}
            className="group relative cursor-pointer flex flex-col justify-between h-[250px] p-6 rounded-2xl border border-surface-800/65 bg-surface-900/30 hover:bg-surface-900/55 hover:border-[#ef7c2c]/40 transition-all duration-300 shadow-xl backdrop-blur-md hover:-translate-y-1.5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef7c2c]/5 rounded-bl-full blur-2xl group-hover:bg-[#ef7c2c]/10 transition-colors pointer-events-none" />
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef7c2c]/15 text-[#ef7c2c] flex items-center justify-center border border-[#ef7c2c]/20 group-hover:scale-110 transition-transform">
                <Tag size={22} weight="fill" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white group-hover:text-[#ef7c2c] transition-colors">
                Marketplace
              </h2>
              <p className="text-xs text-surface-400 font-body leading-relaxed">
                Compre, venda ou troque instrumentos e acessórios musicais de forma segura e direta.
              </p>
            </div>
            <div className="flex items-center text-xs text-[#ef7c2c] font-medium group-hover:translate-x-1 transition-transform gap-1">
              Acessar mercado &rarr;
            </div>
          </div>

          {/* Card 2: Aulas de Música */}
          <div 
            onClick={() => router.push("/explore?tab=professores")}
            className="group relative cursor-pointer flex flex-col justify-between h-[250px] p-6 rounded-2xl border border-surface-800/65 bg-surface-900/30 hover:bg-surface-900/55 hover:border-[#ef7c2c]/40 transition-all duration-300 shadow-xl backdrop-blur-md hover:-translate-y-1.5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full blur-2xl group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform">
                <GraduationCap size={22} weight="fill" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white group-hover:text-yellow-450 transition-colors">
                Aulas de Música
              </h2>
              <p className="text-xs text-surface-400 font-body leading-relaxed">
                Aprenda a tocar ou aprimore sua técnica com professores especializados e certificados.
              </p>
            </div>
            <div className="flex items-center text-xs text-yellow-400 font-medium group-hover:translate-x-1 transition-transform gap-1">
              Encontrar professor &rarr;
            </div>
          </div>

          {/* Card 3: Luthier */}
          <div 
            onClick={() => router.push("/explore?tab=luthiers")}
            className="group relative cursor-pointer flex flex-col justify-between h-[250px] p-6 rounded-2xl border border-surface-800/65 bg-surface-900/30 hover:bg-surface-900/55 hover:border-[#ef7c2c]/40 transition-all duration-300 shadow-xl backdrop-blur-md hover:-translate-y-1.5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                <Wrench size={22} weight="fill" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white group-hover:text-teal-450 transition-colors">
                Luthiers
              </h2>
              <p className="text-xs text-surface-400 font-body leading-relaxed">
                Regulagem, manutenção e reparos com profissionais experientes na sua região.
              </p>
            </div>
            <div className="flex items-center text-xs text-teal-400 font-medium group-hover:translate-x-1 transition-transform gap-1">
              Solicitar luthier &rarr;
            </div>
          </div>

          {/* Card 4: Agenda / Louve */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="group relative cursor-pointer flex flex-col justify-between h-[250px] p-6 rounded-2xl border border-surface-800/65 bg-surface-900/30 hover:bg-surface-900/55 hover:border-[#ef7c2c]/40 transition-all duration-300 shadow-xl backdrop-blur-md hover:-translate-y-1.5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
            <div className="absolute top-3 right-3 bg-[#ef7c2c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Novo
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Calendar size={22} weight="fill" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white group-hover:text-blue-450 transition-colors">
                Agenda Musical
              </h2>
              <p className="text-xs text-surface-400 font-body leading-relaxed">
                Gerencie escalas, setlists de repertórios, cifras e presenças para a sua banda ou equipe.
              </p>
            </div>
            <div className="flex items-center text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform gap-1">
              Configurar agenda &rarr;
            </div>
          </div>

        </div>

        {/* Subtle Footer branding */}
        <div className="text-center text-xs text-surface-500 font-body animate-fadeSlideUp" style={{ animationDelay: "300ms" }}>
          &copy; {new Date().getFullYear()} Focattolecter. Todos os direitos reservados.
        </div>

      </div>

      {/* Interactive Modal: Selection of Band/Group Type */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-md animate-fadeIn">
          
          <div className="relative w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-scaleUp">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-surface-400 hover:text-white bg-surface-850 hover:bg-surface-800 p-1.5 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="flex flex-col gap-1.5 max-w-md">
              <h3 className="text-2xl font-display font-semibold text-white">
                Qual o tipo do seu grupo musical?
              </h3>
              <p className="text-xs text-surface-400 font-body">
                Isso nos ajudará a personalizar a sua agenda de escalas e repertórios para o formato ideal do seu projeto.
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {bandTypes.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleBandTypeSelect(option.id)}
                  className={`group/item flex items-start gap-4 p-4 rounded-xl border border-surface-800 bg-surface-950/40 hover:bg-surface-950/90 transition-all duration-300 cursor-pointer ${option.color}`}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-surface-900 border border-surface-800 group-hover/item:scale-105 transition-transform text-surface-300">
                    {option.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-semibold text-white group-hover/item:text-white transition-colors">
                      {option.title}
                    </h4>
                    <p className="text-[11px] text-surface-400 leading-normal font-body">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint message */}
            <div className="text-[11px] text-surface-500 font-body text-center mt-2 border-t border-surface-800/40 pt-4">
              Você poderá cadastrar múltiplos grupos e gerenciar suas respectivas escalas futuramente.
            </div>

          </div>

        </div>
      )}
    </main>
  );
}
