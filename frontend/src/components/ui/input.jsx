import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-secondary selection:text-secondary-foreground border-input h-12 w-full min-w-0 rounded-[var(--radius)] border border-border/60 bg-white/80 px-5 py-3 text-base shadow-[0_10px_30px_rgba(46,47,70,0.08)] transition-all duration-300 outline-none file:inline-flex file:h-9 file:rounded-[var(--radius)] file:border-0 file:bg-secondary file:px-4 file:text-sm file:font-semibold file:text-secondary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:border-transparent focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:shadow-[0_18px_45px_rgba(109,122,255,0.25)]",
        "aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
