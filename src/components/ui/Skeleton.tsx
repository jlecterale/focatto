import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  as?: "div" | "span";
  lines?: number;
  width?: string;
  height?: string;
}

export function Skeleton({ className, as: Tag = "div", lines, width, height }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="shimmer rounded-md"
            style={{
              width: width || (i === lines - 1 ? "60%" : "100%"),
              height: height || "0.75rem",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <Tag
      className={cn("shimmer rounded-md", className)}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-3">
        <Skeleton height="0.75rem" width="40%" />
        <Skeleton height="1rem" width="85%" />
        <Skeleton height="1.25rem" width="30%" />
        <Skeleton height="0.625rem" width="60%" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
      <div className="aspect-square shimmer rounded-2xl" />
      <div className="space-y-4">
        <Skeleton height="0.75rem" width="30%" />
        <Skeleton height="2rem" width="90%" />
        <Skeleton height="1.5rem" width="25%" />
        <Skeleton lines={4} />
        <div className="flex gap-2">
          <Skeleton height="2.5rem" width="8rem" />
          <Skeleton height="2.5rem" width="8rem" />
        </div>
      </div>
    </div>
  );
}
