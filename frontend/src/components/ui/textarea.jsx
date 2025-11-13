import React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-[var(--radius)] border border-border/60 bg-white/80 px-5 py-4 text-base shadow-[0_12px_35px_rgba(46,47,70,0.12)] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/35 focus-visible:ring-offset-0 focus-visible:shadow-[0_22px_55px_rgba(109,122,255,0.22)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
