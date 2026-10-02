import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Briefcase, ClipboardList, LogOut, Compass, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume-builder", label: "Build resume", icon: FileText },
  { to: "/jobs", label: "Jobs across India", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: ClipboardList },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("careerfit_demo_auth");
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Compass className="size-5" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              CareerFit <span className="text-primary">India</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === item.to && "bg-secondary text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <Button variant="ghost" size="sm" className="ml-auto md:ml-2" onClick={signOut}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground",
                pathname === item.to && "bg-secondary text-foreground",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
