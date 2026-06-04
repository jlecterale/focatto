"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getChatsByUser,
  listenChats,
  listenMessages,
  sendMessage,
  createChat,
} from "@/lib/db";
import type { Chat, ChatMessage } from "@/types";

export function useChats(uid: string | undefined) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const unsub = listenChats(uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { chats, loading };
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setLoading(false); return; }
    setLoading(true);
    const unsub = listenMessages(chatId, (data) => {
      setMessages(data);
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  const send = useCallback(
    async (text: string, senderId: string, senderName: string) => {
      if (!chatId || !text.trim()) return;
      await sendMessage(chatId, {
        senderId,
        senderName,
        text: text.trim(),
        read: false,
      } as any);
    },
    [chatId]
  );

  return { messages, loading, send };
}

export function useCreateChat() {
  const [creating, setCreating] = useState(false);

  const create = useCallback(
    async (
      participantIds: string[],
      participantNames: Record<string, string>,
      participantPhotos: Record<string, string>,
      productId?: string,
      productTitle?: string,
      productImage?: string
    ): Promise<string | null> => {
      setCreating(true);
      try {
        const unread: Record<string, number> = {};
        participantIds.forEach((id) => (unread[id] = 0));
        const chatId = await createChat({
          participants: participantIds,
          participantNames,
          participantPhotos,
          productId,
          productTitle,
          productImage,
          unreadCount: unread,
        } as any);
        return chatId;
      } catch {
        return null;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  return { create, creating };
}
