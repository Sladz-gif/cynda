import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect";
}

export const SkeletonLoader = ({
  className,
  variant = "rect"
}: SkeletonLoaderProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted-foreground/20 rounded",
        variant === "text" && "h-4 w-full",
        variant === "card" && "h-32 w-full rounded-xl",
        variant === "circle" && "h-10 w-10 rounded-full",
        variant === "rect" && "h-8 w-24",
        className
      )}
    />
  );
};
