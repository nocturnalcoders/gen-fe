import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, MessageCircle, Users } from "lucide-react";
import { format } from "date-fns";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api";

export const Route = createFileRoute("/activegen")({
  component: ActiveGen,
  head: () => ({
    meta: [
      { title: "ActiveGen — Garuda" },
      { name: "description", content: "Sport, hikes, coffee meetups, and volunteering with your community." },
    ],
    links: [{ rel: "canonical", href: "/activegen" }],
  }),
});

function ActiveGen() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.activities.list(),
    refetchOnWindowFocus: true,
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="ActiveGen"
        title="Move together, meet in person"
        description="Sport, hikes, coffee, and giving back — activities from the community, for the community."
        actions={<Button>Host an activity</Button>}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading activities…</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Card key={a.id} className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
              <Link to="/activegen/$id" params={{ id: a.id }} className="block">
                <div className="relative flex h-32 items-center justify-center bg-hero-gradient">
                  <Badge className="absolute left-3 top-3 border-white/20 bg-white/15 text-white backdrop-blur">
                    {a.activityType}
                  </Badge>
                  <div className="font-display text-3xl font-bold text-white/90">ActiveGen</div>
                </div>
              </Link>
              <div className="p-5">
                <Link to="/activegen/$id" params={{ id: a.id }}>
                  <h3 className="font-semibold leading-snug hover:text-primary">{a.title}</h3>
                </Link>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> {format(new Date(a.activityDate), "EEE, MMM d · HH:mm")}
                  </div>
                  <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {a.location}</div>
                  <div className="flex items-center gap-1.5"><Users className="size-3.5" /> {a.joined}/{a.capacity} joined</div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
                  <div className="size-7 rounded-full bg-gold-gradient" />
                  <span className="text-xs text-muted-foreground">by {a.hostName ?? "Community"}</span>
                  <Button asChild size="sm" className="ml-auto h-8">
                    <Link to="/activegen/$id" params={{ id: a.id }}>Open</Link>
                  </Button>
                  <Button asChild size="icon" variant="ghost" className="h-8 w-8" aria-label="Discussion">
                    <Link to="/activegen/$id" params={{ id: a.id }} hash="discussion"><MessageCircle className="size-4" /></Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}