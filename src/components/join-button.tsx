import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/api";
import type { TargetType } from "@/api/types";
import { useSession } from "@/hooks/use-session";

export function JoinButton({
  targetType,
  targetId,
  full,
  onChange,
  joinLabel = "Join",
  leaveLabel = "Leave",
}: {
  targetType: TargetType;
  targetId: string;
  full?: boolean;
  onChange?: () => void;
  joinLabel?: string;
  leaveLabel?: string;
}) {
  const { user } = useSession();
  const qc = useQueryClient();
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setJoined(false);
      return;
    }
    let cancelled = false;
    api.registrations.isRegistered({ targetType, targetId }).then((value) => {
      if (!cancelled) setJoined(value);
    });
    return () => {
      cancelled = true;
    };
  }, [user, targetType, targetId]);

  if (!user) {
    return (
      <Button asChild>
        <Link to="/auth" search={{ redirect: window.location.pathname }}>
          Sign in to {joinLabel.toLowerCase()}
        </Link>
      </Button>
    );
  }

  async function toggle() {
    if (!user) return;
    if (!joined && full) {
      toast.error("This is at capacity.");
      return;
    }
    setBusy(true);
    try {
      if (joined) {
        await api.registrations.unregister({ targetType, targetId });
        setJoined(false);
        toast.success("You left this " + targetType);
      } else {
        await api.registrations.register({ targetType, targetId });
        setJoined(true);
        toast.success("You're in! See you there.");
      }
      onChange?.();
      qc.invalidateQueries({ queryKey: [targetType === "activity" ? "activities" : "events"] });
      qc.invalidateQueries({ queryKey: [targetType, targetId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={toggle} disabled={busy} variant={joined ? "outline" : "default"}>
      {joined ? leaveLabel : joinLabel}
    </Button>
  );
}
