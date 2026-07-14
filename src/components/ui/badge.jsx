import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground",
        primary:
          "bg-primary/10 text-primary",
        success:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        destructive:
          "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info:
          "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
        outline:
          "border border-border text-muted-foreground",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted",
      },
      size: {
        default: "text-xs",
        sm: "text-[11px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  const Comp = "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
