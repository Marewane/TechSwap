import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/60 shadow-[0_12px_30px_rgba(46,47,70,0.22)] ring-4 ring-secondary/20", className)}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/40 text-primary-foreground flex size-full items-center justify-center rounded-full font-semibold uppercase tracking-wide",
        className
      )}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
