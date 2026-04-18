import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Top bar for the main content column (theme toggle per UX spec).
 */
export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ThemeToggle />
    </header>
  );
}
