import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, Target } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/mentorship")({
  component: MentorshipPage,
  head: () => ({
    meta: [
      { title: "Mentorship — Garuda" },
      { name: "description", content: "Browse mentors, request mentorship, track goals and progress." },
    ],
    links: [{ rel: "canonical", href: "/mentorship" }],
  }),
});

const mentors = [
  { name: "Prasetyo H.", role: "Eng Manager · Airbnb", tags: ["Leadership", "Relocation"], sessions: 128 },
  { name: "Sinta Larasati", role: "Senior PM · Grab", tags: ["Product", "Career"], sessions: 84 },
  { name: "Yoga Pradana", role: "Staff Eng · Meta", tags: ["System Design"], sessions: 210 },
  { name: "Dewi Ratna", role: "Design Lead · Tokopedia", tags: ["UX", "Portfolio"], sessions: 66 },
  { name: "Bagas Setya", role: "Founder · Rasa", tags: ["Startup", "Fundraising"], sessions: 41 },
  { name: "Nadia Wibowo", role: "Immigration Consultant", tags: ["Visa", "EU"], sessions: 55 },
];

function MentorshipPage() {
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
              <Input placeholder="Search by skill, company, or name…" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
            </div>
            <Button variant="outline">Filters</Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <Card key={m.name} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
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
                  <span>★ 4.9</span>
                </div>
                <Button className="mt-4 w-full">Request mentorship</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gold-gradient" />
              <div>
                <div className="font-semibold">Prasetyo H.</div>
                <div className="text-xs text-muted-foreground">Next session: Thursday 7:00 PM</div>
              </div>
              <Button className="ml-auto" variant="outline">Message</Button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm"><span>Progress toward goal</span><span className="font-medium">62%</span></div>
              <Progress value={62} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {["Jun 24 · Career mapping", "Jun 10 · Interview prep", "May 27 · Kickoff & goal setting"].map((s) => (
              <Card key={s} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary" />
                  {s}
                </div>
                <Button size="sm" variant="ghost">Notes</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { g: "Land Tech Lead role", p: 62 },
              { g: "Publish 3 articles this quarter", p: 33 },
              { g: "Attend 2 diaspora meetups", p: 50 },
              { g: "Complete system design course", p: 80 },
            ].map((x) => (
              <Card key={x.g} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold"><Target className="size-4 text-primary" /> {x.g}</div>
                <Progress value={x.p} className="mt-4" />
                <div className="mt-2 text-xs text-muted-foreground">{x.p}% complete</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}