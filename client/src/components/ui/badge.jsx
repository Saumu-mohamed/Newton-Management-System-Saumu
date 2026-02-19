import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none h-6",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm",
        secondary: "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary shadow-sm",
        destructive: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive hover:text-white shadow-sm",
        outline: "text-foreground border-border/50 hover:bg-accent/50",
        success: "border-transparent bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white shadow-sm",
        warning: "border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white shadow-sm",
        info: "border-transparent bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };