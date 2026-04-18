"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Layers,
  PenSquare,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/edit-post", label: "New Post", icon: PenSquare },
  { href: "/posts", label: "Recent Posts", icon: FileText },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Collapsible primary navigation for the signed-in app shell.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-56 md:w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-2">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="truncate px-2 text-lg font-semibold tracking-tight text-sidebar-foreground"
          >
            Ideacast
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("shrink-0", collapsed && "mx-auto")}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Primary">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-center border-t border-sidebar-border p-3">
        {mounted ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9",
              },
            }}
          />
        ) : (
          <div
            className="size-9 shrink-0 rounded-full bg-muted"
            aria-hidden
          />
        )}
      </div>
    </aside>
  );
}
