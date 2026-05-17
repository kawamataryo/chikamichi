import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold tracking-wide whitespace-nowrap",
  {
    defaultVariants: {
      variant: "secondary",
    },
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        outline: "border-border-control/[0.8] bg-transparent text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
      },
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ className, variant }))} {...props} />;
}

export { Badge, badgeVariants };
