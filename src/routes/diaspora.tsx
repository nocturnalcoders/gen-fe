import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Calendar, Plane, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/diaspora")({
  component: Diaspora,
  head: () => ({
    meta: [
      { title: "Diaspora — Garuda" },
      { name: "description", content: "Country chapters, gatherings, career sharing, and immigration tips for Indonesians abroad." },
      { property: "og:title", content: "Diaspora — Garuda Empowerment Network" },
      { property: "og:description", content: "Country chapters, gatherings, career sharing, and immigration tips for Indonesians abroad." },
    ],
    links: [{ rel: "canonical", href: "/diaspora" }],
  }),
});

function Diaspora() {
  const queryClient = useQueryClient();

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["diaspora", "chapters"],
    queryFn: () => api.diaspora.listChapters(),
  });
  const { data: gatherings } = useQuery({
    queryKey: ["diaspora", "gatherings"],
    queryFn: () => api.diaspora.listGatherings(),
  });
  const { data: guides } = useQuery({
    queryKey: ["diaspora", "guides"],
    queryFn: () => api.diaspora.listGuides(),
  });

  const toggleJoin = useMutation({
    mutationFn: (slug: string) => api.diaspora.toggleJoinChapter(slug),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["diaspora", "chapters"] });
      toast.success(res.joined ? "Chapter joined" : "Left chapter");
    },
    onError: () => toast.error("Sign in to join a chapter"),
  });

  const career = guides?.filter((g) => g.kind === "career") ?? [];
  const immigration = guides?.filter((g) => g.kind === "immigration") ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Diaspora"
        title="Home, wherever you are"
        description="A space for Indonesians living abroad — chapters, gatherings, careers, and cultural events."
        actions={<Button>Start a chapter</Button>}
      />

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Country chapters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : chapters?.map((c) => (
                <Card key={c.slug} className="glass group rounded-2xl border-border/50 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{c.flag}</div>
                    <div>
                      <div className="font-semibold">{c.country}</div>
                      <div className="text-xs text-muted-foreground">{c.city} · {c.members} members</div>
                    </div>
                  </div>
                  <Button
                    variant={c.joined ? "secondary" : "ghost"}
                    size="sm"
                    className="mt-4 w-full justify-center"
                    onClick={() => toggleJoin.mutate(c.slug)}
                    disabled={toggleJoin.isPending}
                  >
                    {c.joined ? "Joined" : "Join chapter"}
                  </Button>
                </Card>
              ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Calendar className="size-4 text-primary" /> Upcoming gatherings</div>
          <ul className="space-y-3 text-sm">
            {gatherings?.length ? gatherings.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">{g.title} · {new Date(g.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <Button size="sm" variant="ghost">RSVP</Button>
              </li>
            )) : <li className="text-muted-foreground">No gatherings scheduled yet.</li>}
          </ul>
        </Card>
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Briefcase className="size-4 text-primary" /> Career sharing</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {career.map((g) => (
              <li key={g.id}>"{g.title}"{g.author ? ` — ${g.author}` : ""}</li>
            ))}
          </ul>
          <Badge variant="secondary" className="mt-4">{career.length} stories shared</Badge>
        </Card>
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Plane className="size-4 text-primary" /> Immigration tips</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {immigration.map((g) => <li key={g.id}>{g.title}</li>)}
          </ul>
          <Button variant="link" className="mt-2 h-auto p-0">Browse all guides →</Button>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="glass rounded-3xl border-border/50 p-8 shadow-soft">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-gradient text-gold-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="font-semibold">Cultural Events</div>
              <p className="text-sm text-muted-foreground">Batik nights, Ramadan iftars, Independence day picnics — culture keeps us close.</p>
            </div>
            <Button className="ml-auto">See calendar</Button>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
