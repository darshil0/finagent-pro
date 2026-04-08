"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface ToggleGroupContextValue extends VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple";
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  type: "single"
});

type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants> & {
  groupVariant?: "test-suite" | "compliance" | "metrics" | "default";
}

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ 
  className, 
  variant = "default", 
  size = "default",
  groupVariant = "default",
  type = "single",
  children, 
  ...props 
}, ref) => {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-group-variant={groupVariant}
      type={type as any}
      className={cn(
        // QA Dashboard Group Container
        "inline-flex h-fit w-fit p-1 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-sky-500/20 transition-all group/toggle-group",
        
        // Group-specific variants
        "data-[group-variant=test-suite]:ring-2 data-[group-variant=test-suite]:ring-rose-500/20",
        "data-[group-variant=compliance]:ring-2 data-[group-variant=compliance]:ring-emerald-500/20",
        "data-[group-variant=metrics]:bg-gradient-to-r data-[group-variant=metrics]:from-slate-900/70 data-[group-variant=metrics]:to-slate-800/70",
        
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, type: type as any }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>
>(({ 
  className, 
  children, 
  variant: itemVariant, 
  size: itemSize, 
  ...props 
}, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={context.variant || itemVariant}
      data-size={context.size || itemSize}
      className={cn(
        // Inherit toggle styles
        toggleVariants({
          variant: context.variant || itemVariant,
          size: context.size || itemSize,
        }),
        
        // Group item specific styles
        "min-w-0 flex-1 shrink-0 mx-0.5 first:rounded-l-xl last:rounded-r-xl first:ml-0 last:mr-0 shadow-none border-0 bg-transparent/0 hover:bg-white/5 data-[state=on]:shadow-none data-[state=on]:ring-0 data-[state=on]:bg-white/10 backdrop-blur-sm relative z-0 focus-visible:z-10",
        
        // Remove individual toggle shadows in group
        "data-[state=on]:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
        
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
