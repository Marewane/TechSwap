import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gradient-to-r from-primary/12 via-secondary/12 to-accent/18 animate-pulse rounded-[calc(var(--radius)/1.6)]", className)}
      {...props} />
  );
}

export { Skeleton }
