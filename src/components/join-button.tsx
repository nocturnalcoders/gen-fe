import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function JoinButton({
  targetType,
  targetId,
  full,
  onChange,
  joinLabel = "Join",
  leaveLabel = "Leave",
}: {
  targetType: "activity" | "event";
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
    if (!user) return setJoined(false);
    let cancelled = false;
    supabase
      .from("registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setJoined(!!data);
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
    setBusy(true);
    if (joined) {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (error) toast.error(error.message);
      else {
        setJoined(false);
        toast.success("You left this " + targetType);
      }
    } else {
      if (full) {
        toast.error("This is at capacity.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.from("registrations").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
      });
      if (error) toast.error(error.message);
      else {
        setJoined(true);
        toast.success("You're in! See you there.");
      }
    }
    setBusy(false);
    onChange?.();
    qc.invalidateQueries({ queryKey: [targetType === "activity" ? "activities" : "events"] });
    qc.invalidateQueries({ queryKey: [targetType, targetId] });
  }

  return (
    <Button onClick={toggle} disabled={busy} variant={joined ? "outline" : "default"}>
      {joined ? leaveLabel : joinLabel}
    </Button>
  );
}