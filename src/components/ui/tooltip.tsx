"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = (props: TooltipPrimitive.TooltipProviderProps) => (
  <TooltipPrimitive.Provider
    data-slot="tooltip-provider"
    {...props}
  />
);
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

const Tooltip = (props: TooltipPrimitive.TooltipProps) => (
  <TooltipProvider>
    <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  </TooltipProvider>
);
Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    data-slot="tooltip-trigger"
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className
    )}
    {...props}
  />
));
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, side = "top", align = "center", children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      side={side}
      align={align}
      className={cn(
        // QA Dashboard Dark Theme
        "glass-card z-[9999] w-fit origin-[var(--radix-tooltip-content-transform-origin)] rounded-2xl px-3 py-2 text-xs font-mono text-slate-100 shadow-2xl shadow-black/50 border-slate-700/50 backdrop-blur-xl",
        
        // Animations
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        
        // Responsive sizing
        "max-w-[calc(100vw-2rem)] sm:max-w-sm md:max-w-md",
        
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="glass-card fill-card z-50 size-3 border border-slate-700/50 shadow-lg" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
