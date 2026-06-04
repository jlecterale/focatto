import type { Condition } from "@/types";

export function cn(...classes: any[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getJsDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
}

export function formatDate(timestamp: any): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(getJsDate(timestamp));
}

export function formatRelativeTime(timestamp: any): string {
  const now = Date.now();
  const date = getJsDate(timestamp);
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return formatDate(timestamp);
}

export function isNewProduct(createdAt: any): boolean {
  if (!createdAt) return false;
  const date = getJsDate(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours <= 48; // Posted within the last 48 hours
}

export function conditionLabel(condition: Condition): string {
  const labels: Record<Condition, string> = {
    novo: "Novo",
    como_novo: "Como Novo",
    excelente: "Excelente",
    bom: "Bom",
    desgastado: "Desgastado",
    restauro: "Para Restauro",
  };
  return labels[condition];
}

export function conditionColor(condition: Condition): string {
  const colors: Record<Condition, string> = {
    novo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    como_novo: "bg-green-500/20 text-green-400 border-green-500/30",
    excelente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bom: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    desgastado: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    restauro: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[condition];
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Image load error"));
    img.src = url;
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
