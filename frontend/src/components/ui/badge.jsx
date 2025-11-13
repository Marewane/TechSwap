import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[calc(var(--radius)/1.8)] border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none gap-1 focus-visible:border-transparent focus-visible:ring-4 focus-visible:ring-ring/30 aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 ease-out shadow-[0_12px_30px_rgba(46,47,70,0.12)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-[#3b3c5c] text-primary-foreground [a&]:hover:from-[#383955] [a&]:hover:to-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/85",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border/70 text-foreground bg-white/80 [a&]:hover:bg-accent/20 [a&]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
