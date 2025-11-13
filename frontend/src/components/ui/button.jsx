import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-base font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-transparent focus-visible:ring-ring/70 focus-visible:ring-[4px] focus-visible:shadow-[0_12px_30px_rgba(109,122,255,0.25)] aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-[2px] hover:shadow-[0_18px_40px_rgba(46,47,70,0.18)]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-[#3b3c5c] text-primary-foreground shadow-[0_20px_60px_rgba(46,47,70,0.25)] hover:from-[#383955] hover:to-primary",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border/80 bg-white/80 backdrop-blur-lg text-foreground shadow-[0_10px_30px_rgba(46,47,70,0.15)] hover:bg-accent/20 hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_18px_50px_rgba(109,122,255,0.35)] hover:bg-secondary/85",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/20 hover:text-foreground dark:hover:bg-accent/40",
        link: "text-primary underline-offset-4 hover:underline hover:text-secondary",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5",
        sm: "h-9 rounded-[var(--radius)] gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-14 rounded-[var(--radius)] px-8 has-[>svg]:px-6 text-lg",
        icon: "size-12",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
