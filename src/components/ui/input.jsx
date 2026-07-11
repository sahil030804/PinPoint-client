import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[34px] w-full min-w-0 rounded-[var(--radius-sm,0.125rem)] border border-[#DFE1E6] bg-[#FAFBFB] px-2.5 py-1 text-sm text-[#172B4D] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#97A0AF] focus-visible:border-[#4C9AFF] focus-visible:ring-2 focus-visible:ring-[#DEEBFF] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F4F5F7] disabled:text-[#A5ADBA] disabled:opacity-50 aria-invalid:border-[#DE350B] aria-invalid:ring-2 aria-invalid:ring-[#FFEBE6] dark:border-[#344563] dark:bg-[#1A2A4A] dark:text-white dark:placeholder:text-[#6B778C] dark:focus-visible:border-[#2684FF] dark:focus-visible:ring-[#0747A6]/40 dark:disabled:bg-[#253858] dark:disabled:text-[#5E6C84] dark:aria-invalid:border-[#FF5630] dark:aria-invalid:ring-[#DE350B]/40",
        className
      )}
      {...props} />
  );
}

export { Input }
