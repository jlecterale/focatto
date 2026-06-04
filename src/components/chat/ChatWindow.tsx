"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneRight, X } from "@phosphor-icons/react";
import { useMessages } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface ChatWindowProps {
  chatId: string;
  otherParticipantName: string;
  otherParticipantPhoto?: string;
  onClose: () => void;
}

export function ChatWindow({ chatId, otherParticipantName, otherParticipantPhoto, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, loading, send } = useMessages(chatId);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    await send(text, user.uid, user.displayName || "Usuário");
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <Avatar src={otherParticipantPhoto} name={otherParticipantName} size="sm" />
        <span className="font-medium text-sm flex-1 truncate">{otherParticipantName}</span>
        <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {loading && (
          <div className="text-center text-sm text-surface-400 py-8">Carregando...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center text-sm text-surface-400 py-8">
            Nenhuma mensagem ainda. Envie uma mensagem para iniciar a conversa.
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-gradient-to-r from-accent to-amber-600 text-white rounded-br-md"
                    : "glass text-surface-100 rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-surface-400"}`}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-white/5 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-accent to-gold-500 text-white disabled:opacity-40 transition-opacity"
        >
          <PaperPlaneRight size={18} weight="fill" />
        </button>
      </form>
    </div>
  );
}
