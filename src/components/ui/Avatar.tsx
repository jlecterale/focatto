import { cn } from "@/lib/utils";
import { User } from "@phosphor-icons/react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-accent to-gold-500 flex items-center justify-center font-semibold text-white",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="h-full w-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <User size={size === "sm" ? 14 : size === "md" ? 18 : size === "lg" ? 24 : 32} />
      )}
    </div>
  );
}
