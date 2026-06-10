"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { listenToUnreadChatsCount } from "../lib/chatService";

export default function ChatHeaderButton() {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = listenToUnreadChatsCount(user.uid, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <button
      onClick={() => router.push("/chat")}
      id="btn-chat-header-toggle"
      aria-label="Abrir chat interno"
      className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#181615] border border-[#2a2827] flex items-center justify-center text-surface-300 hover:text-white hover:border-[#ef7c2c]/30 hover:bg-[#201e1d] active:scale-[0.97] transition-all duration-200 cursor-pointer"
      title="Mensagens Chat Interno"
    >
      <ChatCircleDots size={20} className={unreadCount > 0 ? "text-[#ef7c2c]" : ""} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-[#ef7c2c] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,124,44,0.4)] animate-pulse border border-[#0c0a09]">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
