import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { api } from "@/api";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/articles", label: "Articles" },
  { to: "/activegen", label: "ActiveGen" },
  { to: "/diaspora", label: "Diaspora" },
  { to: "/events", label: "Events" },
  { to: "/members", label: "Members" },
] as const;

export function SiteNav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Search" className="hidden sm:inline-flex">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:block ml-1 h-9 w-9 rounded-full bg-gold-gradient ring-2 ring-background shadow-soft"
                  aria-label="Profile"
                />
                <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border/60 px-4 pb-4 pt-2">
            <div className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">Profile</Link>
                  <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">Admin</Link>
                  <button onClick={() => { setOpen(false); signOut(); }} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent">
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}