import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/components/thread";
import { JoinButton } from "@/components/join-button";

export const Route = createFileRoute("/activegen/$id")({
  component: ActivityDetail,
  head: ({ params }) => ({
    meta: [
      { title: "Activity — Garuda ActiveGen" },
      { name: "description", content: "Join this ActiveGen activity and chat with other members." },
    ],
    links: [{ rel: "canonical", href: `/activegen/${params.id}` }],
  }),
  errorComponent: ({ error }) => (
    <PageShell>
      <p className="text-sm text-destructive">{error.message}</p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <p className="text-sm text-muted-foreground">Activity not found.</p>
    </PageShell>
  ),
});

async function fetchActivity(id: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, title, activity_type, activity_date, location, capacity, host_name, description, registrations(count)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return {
    ...data,
    joined: (data as any).registrations?.[0]?.count ?? 0,
  };
}

function ActivityDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const key = ["activity", id];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => fetchActivity(id) });

  useEffect(() => {
    const channel = supabase
      .channel(`activity-${id}-registrations`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations", filter: `target_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: key }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  if (isLoading || !data) {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PageShell>
    );
  }

  const full = data.joined >= data.capacity;

  return (
    <PageShell>
      <Link to="/activegen" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All activities
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
            <div className="relative flex h-40 items-center justify-center bg-hero-gradient">
              <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">
                {data.activity_type}
              </Badge>
            </div>
            <div className="p-6">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{data.title}</h1>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2"><Calendar className="size-4" /> {format(new Date(data.activity_date), "EEE, MMM d yyyy · HH:mm")}</div>
                <div className="flex items-center gap-2"><MapPin className="size-4" /> {data.location}</div>
                <div className="flex items-center gap-2"><Users className="size-4" /> {data.joined}/{data.capacity} joined {full && <span className="text-destructive">· full</span>}</div>
                <div>Hosted by <span className="text-foreground">{data.host_name ?? "Community"}</span></div>
              </div>
              {data.description && <p className="mt-5 text-sm leading-relaxed">{data.description}</p>}
            </div>
          </Card>

          <div id="discussion">
            <Thread targetType="activity" targetId={id} />
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Your spot</div>
            <div className="mt-2 text-2xl font-bold">{data.joined}<span className="text-base font-normal text-muted-foreground">/{data.capacity}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{full ? "This activity is full." : `${data.capacity - data.joined} spots left.`}</p>
            <div className="mt-4">
              <JoinButton targetType="activity" targetId={id} full={full} />
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}