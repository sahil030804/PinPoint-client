"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props} />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-[#5E6C84] group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-[#F4F5F7] rounded-[3px] p-[3px] dark:bg-[#253858]",
        line: "gap-0 bg-transparent border-b border-[#DFE1E6] dark:border-[#344563]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-[3px] border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap text-[#5E6C84] transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-[#172B4D] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:text-[#A5ADBA] dark:hover:text-white",
        "data-active:bg-white data-active:text-[#172B4D] data-active:shadow-sm dark:data-active:bg-[#344563] dark:data-active:text-white",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-[#0052CC] group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:after:transition-opacity group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:bottom-[-1px] group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:h-[3px] group-data-[variant=line]/tabs-list:data-active:after:opacity-100 dark:group-data-[variant=line]/tabs-list:after:bg-[#4C9AFF]",
        className
      )}
      {...props} />
  );
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none pt-3", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
