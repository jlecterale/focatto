import { cn } from "@/lib/utils";
import type { Condition } from "@/types";
import { conditionColor, conditionLabel } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-white/5 text-surface-200 border-white/5",
  gold: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  warning: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  danger: "bg-red-500/15 text-red-300 border-red-500/20",
  info: "bg-blue-500/15 text-blue-300 border-blue-500/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border",
        conditionColor(condition)
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
}
