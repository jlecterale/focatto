"use client";

import { ChatCircleDots } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { Chat } from "@/types";

interface ChatListProps {
  chats: Chat[];
  userId: string;
  onSelect: (chat: Chat) => void;
  activeChatId?: string;
}

export function ChatList({ chats, userId, onSelect, activeChatId }: ChatListProps) {
  if (!chats.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-surface-400">
        <ChatCircleDots size={40} className="mb-3 opacity-40" />
        <p className="text-sm">Nenhuma conversa ainda</p>
        <p className="text-xs mt-1">Inicie uma conversa a partir de um anúncio</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {chats.map((chat) => {
        const otherId = chat.participants.find((id) => id !== userId)!;
        const otherName = chat.participantNames[otherId] || "Usuário";
        const otherPhoto = chat.participantPhotos[otherId];
        const isActive = chat.id === activeChatId;
        const unread = chat.unreadCount?.[userId] || 0;

        return (
          <button
            key={chat.id}
            onClick={() => onSelect(chat)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${
              isActive ? "bg-white/[0.03] border-l-2 border-accent" : ""
            }`}
          >
            <Avatar src={otherPhoto} name={otherName} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{otherName}</span>
                {chat.lastMessageAt && (
                  <span className="text-[10px] text-surface-400 whitespace-nowrap">
                    {formatRelativeTime(chat.lastMessageAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-surface-400 truncate flex-1">
                  {chat.lastMessage || "Clique para conversar"}
                </p>
                {unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {unread}
                  </span>
                )}
              </div>
              {chat.productTitle && (
                <p className="text-[10px] text-surface-500 mt-0.5 truncate">
                  Sobre: {chat.productTitle}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
