import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(
  ({ className, ...props }, ref) =>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl bg-muted/30 p-1.5 text-muted-foreground backdrop-blur-sm border border-border/20",
        className
      )}
      {...props} />
);
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(
  ({ className, ...props }, ref) =>
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold tracking-tight ring-offset-background transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props} />
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(
  ({ className, ...props }, ref) =>
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props} />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;
export { Tabs, TabsList, TabsTrigger, TabsContent };