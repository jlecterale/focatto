"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Heart, 
  Handshake, 
  Star, 
  Info, 
  Check, 
  Trash, 
  X,
  Clock
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { 
  listenToUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from "../lib/notificationService";
import type { NotificationData } from "../lib/roles";

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const prevNotificationsRef = useRef<NotificationData[]>([]);

  // Real-time listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      prevNotificationsRef.current = [];
      isInitialLoad.current = true;
      return;
    }

    const unsubscribe = listenToUserNotifications(user.uid, (list) => {
      if (isInitialLoad.current) {
        setNotifications(list);
        prevNotificationsRef.current = list;
        isInitialLoad.current = false;
        return;
      }

      // Detect new unread notifications that were not present in previous snapshot
      const prevIds = new Set(prevNotificationsRef.current.map((n) => n.id));
      list.forEach((item) => {
        if (item.id && !prevIds.has(item.id) && !item.read) {
          // Trigger a beautiful, premium real-time toast
          toast.success(item.title || "Novidade!", {
            description: item.message,
            action: {
              label: "Ver",
              onClick: () => {
                if (item.id) markNotificationAsRead(item.id).catch(() => {});
                router.push("/meus-anuncios");
              }
            },
            duration: 6000,
          });
        }
      });

      setNotifications(list);
      prevNotificationsRef.current = list;
    });

    return () => unsubscribe();
  }, [user, router]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch {
      toast.error("Erro ao marcar notificações.");
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
    } catch {
      toast.error("Erro ao atualizar notificação.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast.success("Notificação excluída.");
    } catch {
      toast.error("Erro ao excluir notificação.");
    }
  };

  const handleNotificationClick = async (item: NotificationData) => {
    if (item.id && !item.read) {
      await markNotificationAsRead(item.id).catch(() => {});
    }
    setIsOpen(false);
    
    // Route user appropriately
    if (item.type === "favorite" || item.type === "proposal") {
      router.push("/meus-anuncios");
    } else if (item.productId) {
      router.push(`/anuncio/${item.productId}`);
    } else {
      router.push("/profile");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "favorite":
        return <Heart size={16} weight="fill" className="text-red-500" />;
      case "proposal":
        return <Handshake size={16} weight="fill" className="text-indigo-400" />;
      case "rating":
        return <Star size={16} weight="fill" className="text-amber-400" />;
      default:
        return <Info size={16} weight="fill" className="text-sky-400" />;
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours} h`;
    return `Há ${days} dias`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="btn-notifications-toggle"
        aria-label="Abrir notificações"
        className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#181615] border border-[#2a2827] flex items-center justify-center text-surface-300 hover:text-white hover:border-[#ef7c2c]/30 hover:bg-[#201e1d] active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-[#ef7c2c] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,124,44,0.4)] animate-pulse border border-[#0c0a09]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[310px] sm:w-[360px] bg-[#0e0c0b]/95 border border-[#2a2827] rounded-2xl shadow-2xl backdrop-blur-md z-[100] animate-slide-down overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#22201e] bg-[#141211]/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-200">Notificações</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#ef7c2c]/10 text-[#ef7c2c] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} novas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                id="btn-notifications-mark-all-read"
                className="text-[10px] text-[#ef7c2c] hover:underline font-bold transition-all cursor-pointer"
              >
                Limpar novas
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#1c1a19]/40 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#181615] border border-[#22201e]/60 flex items-center justify-center text-surface-500">
                  <Bell size={22} className="opacity-40" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-300">Tudo limpo por aqui!</p>
                  <p className="text-[10px] text-surface-500 mt-1 leading-relaxed">Você receberá atualizações quando favoritarem seus anúncios ou enviarem propostas.</p>
                </div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-4 hover:bg-[#181615]/80 cursor-pointer transition-all ${
                    !item.read ? "bg-[#ef7c2c]/5 border-l-2 border-l-[#ef7c2c]" : ""
                  }`}
                >
                  {/* Icon Badge */}
                  <div className="h-8 w-8 rounded-xl bg-[#1c1a19] border border-[#2c2a29] flex-shrink-0 flex items-center justify-center shadow-inner">
                    {getIcon(item.type)}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[11px] font-bold truncate ${!item.read ? "text-white" : "text-surface-300"}`}>
                        {item.title}
                      </p>
                      <span className="text-[9px] text-surface-500 whitespace-nowrap flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className={`text-[10px] leading-relaxed break-words ${!item.read ? "text-surface-100" : "text-surface-400"}`}>
                      {item.message}
                    </p>

                    {/* Action buttons inside item */}
                    <div className="flex items-center gap-3 mt-2 self-start">
                      {!item.read && item.id && (
                        <button
                          onClick={(e) => handleMarkRead(item.id!, e)}
                          title="Marcar como lida"
                          className="flex items-center gap-1 text-[9px] font-bold text-surface-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <Check size={11} />
                          Lida
                        </button>
                      )}
                      {item.id && (
                        <button
                          onClick={(e) => handleDelete(item.id!, e)}
                          title="Excluir notificação"
                          className="flex items-center gap-1 text-[9px] font-bold text-surface-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash size={11} />
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#22201e] bg-[#141211]/30 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/meus-anuncios");
              }}
              className="text-[10px] text-surface-400 hover:text-white font-semibold transition-colors w-full py-1 cursor-pointer"
            >
              Ver todos os anúncios e propostas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
