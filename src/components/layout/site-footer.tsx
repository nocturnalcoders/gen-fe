import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

const COLS = [
  {
    title: "Community",
    links: [
      ["Dashboard", "/dashboard"],
      ["Members", "/members"],
      ["Diaspora", "/diaspora"],
      ["ActiveGen", "/activegen"],
    ],
  },
  {
    title: "Grow",
    links: [
      ["Mentorship", "/mentorship"],
      ["Articles", "/articles"],
      ["Events", "/events"],
      ["Profile", "/profile"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/"],
      ["Admin", "/admin"],
      ["Notifications", "/notifications"],
      ["Contact", "/"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Empowering Indonesians worldwide through mentorship, community, and shared purpose.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.title}
            </div>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-foreground/80 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} Garuda Empowerment Network. All rights reserved.</span>
          <span>Made with purpose · Jakarta · Amsterdam · Tokyo · San Francisco</span>
        </div>
      </div>
    </footer>
  );
}