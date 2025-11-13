import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-transparent data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:bg-gradient-to-r data-[orientation=horizontal]:from-transparent data-[orientation=horizontal]:via-border/80 data-[orientation=horizontal]:to-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:bg-gradient-to-b data-[orientation=vertical]:from-transparent data-[orientation=vertical]:via-border/80 data-[orientation=vertical]:to-transparent",
        className
      )}
      {...props} />
  );
}

export { Separator }
