import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api";
import { Thread } from "@/components/thread";
import { JoinButton } from "@/components/join-button";

export const Route = createFileRoute("/events/$id")({
  component: EventDetail,
  head: ({ params }) => ({
    meta: [
      { title: "Event — Garuda" },
      { name: "description", content: "Register for this community event and join the discussion." },
    ],
    links: [{ rel: "canonical", href: `/events/${params.id}` }],
  }),
  errorComponent: ({ error }) => (
    <PageShell>
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <p className="text-sm text-muted-foreground">Event not found.</p>
    </PageShell>
  ),
});

async function fetchEvent(id: string) {
  const event = await api.events.get(id);
  if (!event) throw notFound();
  return event;
}

function EventDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const key = ["event", id];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => fetchEvent(id) });

  useEffect(() => {
    return api.events.subscribe(id, () => {
      qc.invalidateQueries({ queryKey: ["event", id] });
    });
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
      <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All events
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
            <div className="relative flex h-40 items-center justify-center bg-hero-gradient">
              <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">
                {data.eventType}
              </Badge>
            </div>
            <div className="p-6">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{data.title}</h1>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2"><Calendar className="size-4" /> {format(new Date(data.eventDate), "EEE, MMM d yyyy · HH:mm")}</div>
                <div className="flex items-center gap-2"><MapPin className="size-4" /> {data.location}</div>
                <div className="flex items-center gap-2"><Users className="size-4" /> {data.joined}/{data.capacity} registered {full && <span className="text-destructive">· full</span>}</div>
              </div>
              {data.description && <p className="mt-5 text-sm leading-relaxed">{data.description}</p>}
            </div>
          </Card>

          <div id="discussion">
            <Thread targetType="event" targetId={id} />
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Registrations</div>
            <div className="mt-2 text-2xl font-bold">{data.joined}<span className="text-base font-normal text-muted-foreground">/{data.capacity}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{full ? "This event is full." : `${data.capacity - data.joined} seats left.`}</p>
            <div className="mt-4">
              <JoinButton targetType="event" targetId={id} full={full} joinLabel="Register" leaveLabel="Cancel registration" />
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}