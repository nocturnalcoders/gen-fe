import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Search, Target } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/mentorship")({
  component: MentorshipPage,
  head: () => ({
    meta: [
      { title: "Mentorship — Garuda" },
      { name: "description", content: "Browse mentors, request mentorship, track goals and progress." },
      { property: "og:title", content: "Mentorship — Garuda Empowerment Network" },
      { property: "og:description", content: "Browse mentors, request mentorship, track goals and progress." },
    ],
    links: [{ rel: "canonical", href: "/mentorship" }],
  }),
});

function MentorshipPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["mentors", q],
    queryFn: () => api.mentorship.listMentors({ q: q || undefined }),
  });
  const { data: requests } = useQuery({
    queryKey: ["mentorship", "requests"],
    queryFn: () => api.mentorship.listRequests(),
  });
  const { data: sessions } = useQuery({
    queryKey: ["mentorship", "sessions"],
    queryFn: () => api.mentorship.listSessions(),
  });
  const { data: goals } = useQuery({
    queryKey: ["mentorship", "goals"],
    queryFn: () => api.mentorship.listGoals(),
  });

  const createRequest = useMutation({
    mutationFn: (mentorId: string) =>
      api.mentorship.createRequest({ mentorId, message: "I'd love your guidance." }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorship", "requests"] });
      toast.success("Mentorship request sent");
    },
    onError: () => toast.error("Sign in to request mentorship"),
  });

  const active = requests?.filter((r) => r.status === "accepted" || r.status === "pending") ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Grow with guidance"
        title="Mentorship"
        description="Find mentors who've walked the path, set goals together, and move forward — one session at a time."
        actions={<Button>Become a mentor</Button>}
      />

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="glass rounded-full p-1">
          <TabsTrigger value="browse" className="rounded-full px-4">Browse</TabsTrigger>
          <TabsTrigger value="active" className="rounded-full px-4">Active</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full px-4">History</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-full px-4">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="mb-4 flex items-center gap-3">
            <div className="glass flex flex-1 items-center gap-2 rounded-full px-4 py-2 shadow-soft">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by skill, company, or name…"
                aria-label="Search mentors"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-60 rounded-2xl" />)
              : mentors?.length
                ? mentors.map((m) => (
                    <Card key={m.id} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gold-gradient" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{m.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{m.role}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {m.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{m.sessions} sessions</span>
                        <span>★ {m.rating.toFixed(1)}</span>
                      </div>
                      <div className="mt-4 grid gap-2">
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/mentors/$id" params={{ id: m.id }}>
                            Lihat profil mentor
                          </Link>
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => createRequest.mutate(m.id)}
                          disabled={createRequest.isPending}
                        >
                          Request mentorship
                        </Button>
                      </div>
                    </Card>
                  ))
                : <p className="text-sm text-muted-foreground">No mentors match your search.</p>}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {active.length ? active.map((r) => (
            <Card key={r.id} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gold-gradient" />
                <div>
                  <div className="font-semibold">{r.mentorName}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.nextSessionAt
                      ? `Next session: ${new Date(r.nextSessionAt).toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}`
                      : r.status === "pending" ? "Request pending" : "No session scheduled"}
                  </div>
                </div>
                <Button className="ml-auto" variant="outline">Message</Button>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm"><span>Progress toward goal</span><span className="font-medium">{r.progress}%</span></div>
                <Progress value={r.progress} />
              </div>
            </Card>
          )) : (
            <Card className="glass rounded-2xl border-border/50 p-10 text-center text-sm text-muted-foreground shadow-soft">
              No active mentorship yet — browse mentors and send your first request.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {sessions?.length ? sessions.map((s) => (
              <Card key={s.id} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary" />
                  {new Date(s.heldAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {s.title}
                </div>
                <Button size="sm" variant="ghost">Notes</Button>
              </Card>
            )) : <p className="text-sm text-muted-foreground">No past sessions yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-4 sm:grid-cols-2">
            {goals?.map((x) => (
              <Card key={x.id} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold"><Target className="size-4 text-primary" /> {x.title}</div>
                <Progress value={x.progress} className="mt-4" />
                <div className="mt-2 text-xs text-muted-foreground">{x.progress}% complete</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
