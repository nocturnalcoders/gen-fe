import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <img
        src="/garuda-logo.png"
        alt="Garuda Empowerment Network"
        className="h-9 w-9 object-contain drop-shadow-[0_4px_12px_oklch(0.6_0.2_35/0.4)] transition-transform group-hover:scale-105"
      />
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-[15px] font-bold tracking-tight text-foreground">
            Garuda
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Empowerment Network
          </div>
        </div>
      )}
    </Link>
  );
}