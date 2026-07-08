import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function PageShell({
  children,
  showFooter = true,
  bare = false,
}: {
  children: ReactNode;
  showFooter?: boolean;
  bare?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-40 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
      </div>
      <SiteNav />
      <main className={bare ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12"}>
        {children}
      </main>
      {showFooter && <SiteFooter />}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 grid gap-4 sm:mb-10 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}