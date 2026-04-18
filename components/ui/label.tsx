import * as React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.ComponentProps<"label">;

/**
 * Accessible label for form controls.
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
