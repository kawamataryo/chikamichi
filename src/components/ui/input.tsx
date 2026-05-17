import type * as React from "react";
import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-control border border-border-control bg-background px-4 py-2 text-input shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:text-muted-foreground/80",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
