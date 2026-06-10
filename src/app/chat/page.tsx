"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChatCircleDots,
  PaperPlaneRight,
  Tag,
  User,
  Clock,
  Phone,
  ShieldCheck,
  Circle
} from "@phosphor-icons/react";
import { useAuth } from "../../contexts/AuthContext";
import {
  listenToUserChats,
  listenToChatMessages,
  sendMessage,
  markChatAsRead,
  ChatData,
  MessageData
} from "../../lib/chatService";
import { getUserData } from "../../lib/userService";
import type { UserData } from "../../lib/roles";
import NotificationBell from "../../components/NotificationBell";
import ChatHeaderButton from "../../components/ChatHeaderButton";
import { toast } from "sonner";

function ChatPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatUrlId = searchParams.get("id");

  const [chats, setChats] = useState<ChatData[]>([]);
  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user && !loadingChats) {
      router.push("/");
    }
  }, [user, loadingChats, router]);

  // Listen to user's chats
  useEffect(() => {
    if (!user) return;

    setLoadingChats(true);
    const unsubscribe = listenToUserChats(user.uid, (list) => {
      setChats(list);
      setLoadingChats(false);

      // If there's a chat ID in the URL, set it active
      if (chatUrlId) {
        const found = list.find((c) => c.id === chatUrlId);
        if (found) {
          setActiveChat(found);
          setShowMobileChat(true);
        }
      }
    });

    return () => unsubscribe();
  }, [user, chatUrlId]);

  // Listen to messages for the active chat
  useEffect(() => {
    if (!activeChat || !user) {
      setMessages([]);
      return;
    }

    // Mark chat as read
    markChatAsRead(activeChat.id, user.uid).catch(console.error);

    const unsubscribe = listenToChatMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  // Fetch the other participant's details when active chat changes
  useEffect(() => {
    if (!activeChat || !user) {
      setOtherUser(null);
      return;
    }

    const otherId = activeChat.participants.find((uid) => uid !== user.uid);
    if (otherId) {
      getUserData(otherId)
        .then((data) => {
          setOtherUser(data);
        })
        .catch((err) => {
          console.error("Error fetching other user data:", err);
          setOtherUser(null);
        });
    }
  }, [activeChat, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !user || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      const recipientId = activeChat.participants.find((uid) => uid !== user.uid);
      if (recipientId) {
        await sendMessage(activeChat.id, user.uid, textToSend, recipientId);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const selectChat = (chat: ChatData) => {
    setActiveChat(chat);
    setShowMobileChat(true);
    router.replace(`/chat?id=${chat.id}`);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    router.replace("/chat");
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-surface-400">
          <Circle size={28} className="animate-spin text-[#ef7c2c]" />
          <p className="text-xs">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0908] text-surface-50 font-sans flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#1c1a19]/60 bg-[#0c0a09]/80 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Voltar ao Marketplace</span>
              <span className="sm:hidden">Marketplace</span>
            </Link>
            <div className="h-5 w-px bg-[#2a2827]" />
            <img
              src="/focattolecter.png"
              alt="Logo"
              className="h-7 sm:h-8 w-auto object-contain invert brightness-110 mix-blend-screen"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ChatHeaderButton />
            <NotificationBell />
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "Perfil"} className="h-full w-full object-cover" />
                ) : (
                  (user.displayName || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-[#141211] rounded-2xl border border-[#22201e] overflow-hidden flex shadow-xl relative">
          
          {/* Left Panel: Conversations List */}
          <div
            className={`w-full md:w-[320px] lg:w-[380px] border-r border-[#22201e] flex flex-col bg-[#110f0e] flex-shrink-0 ${
              showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-[#22201e] flex-shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-200 font-heading">
                Mensagens
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1c1a19]/50 scrollbar-thin">
              {loadingChats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-[#1c1a19]" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-3 w-1/3 bg-[#1c1a19] rounded" />
                      <div className="h-3 w-2/3 bg-[#1c1a19] rounded" />
                    </div>
                  </div>
                ))
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-surface-500 gap-2 mt-12">
                  <ChatCircleDots size={32} className="opacity-40" />
                  <p className="text-xs">Nenhuma conversa iniciada.</p>
                  <p className="text-[10px] text-surface-600">
                    Use o botão "Chat Interno" em anúncios para falar com vendedores.
                  </p>
                </div>
              ) : (
                chats.map((chat) => {
                  const otherId = chat.participants.find((uid) => uid !== user.uid) || "";
                  const otherName = chat.participantNames[otherId] || "Anunciante";
                  const otherPhoto = chat.participantPhotos[otherId] || "";
                  const isActive = activeChat?.id === chat.id;
                  const unread = chat.unreadCount?.[user.uid] || 0;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => selectChat(chat)}
                      className={`p-4 flex gap-3 items-center cursor-pointer transition-all hover:bg-[#181615] ${
                        isActive ? "bg-[#181615] border-l-2 border-l-[#ef7c2c]" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden">
                        {otherPhoto ? (
                          <img src={otherPhoto} alt={otherName} className="h-full w-full object-cover" />
                        ) : (
                          otherName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate font-body">
                            {otherName}
                          </h4>
                          <span className="text-[10px] text-surface-500 whitespace-nowrap">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        </div>

                        {chat.productTitle && (
                          <div className="text-[10px] text-[#ef7c2c] truncate mt-0.5 flex items-center gap-1 font-medium">
                            <Tag size={10} />
                            {chat.productTitle}
                          </div>
                        )}

                        <p className={`text-[11px] truncate mt-1 ${unread > 0 ? "text-white font-semibold" : "text-surface-400"}`}>
                          {chat.lastMessage || "Conversa iniciada"}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {unread > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-[#ef7c2c] text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Messages Screen */}
          <div
            className={`flex-1 flex flex-col bg-[#141211] overflow-hidden ${
              !showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {activeChat ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3 border-b border-[#22201e] bg-[#110f0e] flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={handleBackToList}
                      className="md:hidden p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-[#181615] flex-shrink-0 cursor-pointer"
                      title="Voltar para a lista"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden">
                      {activeChat.participantPhotos[activeChat.participants.find((uid) => uid !== user.uid) || ""] ? (
                        <img
                          src={activeChat.participantPhotos[activeChat.participants.find((uid) => uid !== user.uid) || ""]}
                          alt="Outro usuário"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (activeChat.participantNames[activeChat.participants.find((uid) => uid !== user.uid) || ""] || "U").charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1">
                        {activeChat.participantNames[activeChat.participants.find((uid) => uid !== user.uid) || ""] || "Usuário"}
                        {otherUser?.isVerified && (
                          <ShieldCheck size={14} className="text-blue-400" weight="fill" />
                        )}
                      </h3>
                      <p className="text-[10px] text-surface-400">
                        {otherUser?.isVerified ? "Vendedor Verificado" : "Membro do Focatto"}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Direct phone call button) */}
                  <div className="flex items-center gap-2">
                    {otherUser?.phone && (
                      <a
                        href={`tel:${otherUser.phone.replace(/\D/g, "")}`}
                        className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/20 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        title="Ligar para anunciante"
                      >
                        <Phone size={14} weight="fill" />
                        <span className="hidden sm:inline text-[10px]">Ligar</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Associated Product Bar */}
                {activeChat.productId && (
                  <div className="px-4 py-2 border-b border-[#22201e] bg-[#181615]/75 flex items-center justify-between gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#0b0908] border border-[#2a2827] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {activeChat.productPhoto ? (
                          <img
                            src={activeChat.productPhoto}
                            alt={activeChat.productTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Tag size={14} className="text-[#ef7c2c]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">
                          Interesse no Anúncio
                        </p>
                        <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
                          {activeChat.productTitle}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/anuncio/${activeChat.productId}`}
                      className="text-[10px] px-2.5 py-1 rounded bg-[#ef7c2c]/10 text-[#ef7c2c] border border-[#ef7c2c]/20 font-semibold hover:bg-[#ef7c2c]/20 transition-all whitespace-nowrap"
                    >
                      Ver Anúncio
                    </Link>
                  </div>
                )}

                {/* Message stream */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin bg-[#0d0c0b]/40">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-surface-500 text-[11px] flex-col gap-2">
                      <ChatCircleDots size={24} className="opacity-30" />
                      A conversa foi iniciada. Envie uma mensagem!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user.uid;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${
                            isMe ? "self-end items-end" : "self-start items-start"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs font-body shadow-md leading-relaxed whitespace-pre-wrap ${
                              isMe
                                ? "bg-gradient-to-br from-[#ef7c2c] to-[#d4ae12] text-white rounded-tr-none"
                                : "bg-[#1c1a19] border border-[#2c2a29] text-surface-100 rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-surface-500 mt-1 flex items-center gap-1 px-1">
                            <Clock size={8} />
                            {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Footer Input */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-[#22201e] bg-[#110f0e] flex items-center gap-2.5 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    disabled={sending}
                    className="flex-1 bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-2.5 text-xs text-white placeholder-surface-500 outline-none transition-all duration-200 focus:border-[#ef7c2c]"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-9 w-9 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white flex items-center justify-center transition-all duration-200 hover:shadow-[0_2px_8px_rgba(239,124,44,0.3)] hover:scale-[1.03] disabled:opacity-40 disabled:scale-100 disabled:shadow-none cursor-pointer flex-shrink-0"
                  >
                    <PaperPlaneRight size={16} weight="fill" />
                  </button>
                </form>
              </>
            ) : (
              // Empty selection screen
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 bg-[#0c0a09]/10">
                <div className="h-16 w-16 rounded-3xl bg-[#181615] border border-[#2a2827] flex items-center justify-center text-[#ef7c2c]">
                  <ChatCircleDots size={32} weight="fill" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-sm font-bold text-white font-heading">
                    Focatto Chat Interno
                  </h3>
                  <p className="text-[11px] text-surface-400 mt-2 leading-relaxed font-body">
                    Selecione uma conversa ao lado para negociar instrumentos, tirar dúvidas sobre aulas ou acertar reparos com luthiers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0908] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-surface-400">
            <Circle size={28} className="animate-spin text-[#ef7c2c]" />
            <p className="text-xs">Carregando painel de chat...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
