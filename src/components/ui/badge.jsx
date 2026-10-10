import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-border/60 bg-secondary text-secondary-foreground",
        primary:
          "border-[#C9D8E4] bg-[#E2EAF1] text-[#38566E] dark:border-[#2A435C] dark:bg-[#1A2C3E] dark:text-[#9DBBD3]",
        success:
          "border-[#C6D9CE] bg-[#E2ECE6] text-[#476E5C] dark:border-[#29463A] dark:bg-[#16271F] dark:text-[#8DB8A1]",
        warning:
          "border-[#E0D5B8] bg-[#F0EBDC] text-[#7A6740] dark:border-[#4A4127] dark:bg-[#2B2718] dark:text-[#C2AE7E]",
        destructive:
          "border-[#D9C6C6] bg-[#EDE3E3] text-[#8A5A5A] dark:border-[#4A3232] dark:bg-[#2B1D1D] dark:text-[#C49A9A]",
        info:
          "border-[#D3CFE2] bg-[#E9E7F0] text-[#5F5B7A] dark:border-[#3D3A57] dark:bg-[#252336] dark:text-[#AFA9CC]",
        outline:
          "border-border/60 bg-transparent text-muted-foreground",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted",
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
