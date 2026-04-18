"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";

/**
 * Toggles between light and dark theme (default dark per UX spec).
 * Theme-dependent UI is deferred until after mount so SSR matches the first
 * client render (`next-themes` reads `localStorage` only on the client).
 */
export function ThemeToggle() {
  const mounted = useMounted();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") === "dark";

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9"
        disabled
        aria-label="Theme toggle loading"
        tabIndex={-1}
      >
        <Moon className="size-4 opacity-60" aria-hidden />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
