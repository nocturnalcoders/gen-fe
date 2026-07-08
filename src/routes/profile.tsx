import { createFileRoute } from "@tanstack/react-router";
import { Award, Briefcase, Calendar, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — Garuda" },
      { name: "description", content: "Your bio, skills, experience, articles, events, mentorship progress, and badges." },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
});

function ProfilePage() {
  return (
    <PageShell>
      <Card className="glass mb-8 overflow-hidden rounded-3xl border-border/50 p-0 shadow-soft">
        <div className="h-32 bg-hero-gradient sm:h-40" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 grid grid-cols-[auto_1fr] items-end gap-4 sm:flex sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="size-20 shrink-0 rounded-2xl bg-gold-gradient ring-4 ring-background shadow-soft sm:size-24" />
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">Rina Prasetya</h1>
                <div className="text-sm text-muted-foreground">Product Designer · Jakarta 🇮🇩</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Share</Button>
              <Button>Edit profile</Button>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm text-foreground/90">
            Designer building tools for Indonesian founders. Ex-Tokopedia. Currently mentoring 4 designers relocating abroad. Coffee snob, part-time hiker.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Product Design", "UX Research", "Design Systems", "Mentoring", "Bahasa Indonesia", "English"].map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="glass mb-6 rounded-full p-1">
          <TabsTrigger value="about" className="rounded-full px-4">About</TabsTrigger>
          <TabsTrigger value="articles" className="rounded-full px-4">Articles</TabsTrigger>
          <TabsTrigger value="events" className="rounded-full px-4">Events</TabsTrigger>
          <TabsTrigger value="mentorship" className="rounded-full px-4">Mentorship</TabsTrigger>
          <TabsTrigger value="badges" className="rounded-full px-4">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="grid gap-6 lg:grid-cols-2">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Briefcase className="size-4 text-primary" /> Experience</div>
            <ul className="space-y-4 text-sm">
              <li><div className="font-medium">Senior Product Designer · Tokopedia</div><div className="text-xs text-muted-foreground">2022 — Present</div></li>
              <li><div className="font-medium">Product Designer · Traveloka</div><div className="text-xs text-muted-foreground">2019 — 2022</div></li>
              <li><div className="font-medium">UX Designer · Bukalapak</div><div className="text-xs text-muted-foreground">2017 — 2019</div></li>
            </ul>
          </Card>
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Award className="size-4 text-primary" /> Highlights</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· 12 articles published</li>
              <li>· 27 events joined</li>
              <li>· 4 active mentees</li>
              <li>· Community streak: 14 days</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-3">
          {["On finding your first mentor", "Design systems for small teams", "What I learned mentoring across time zones"].map((t) => (
            <Card key={t} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
              <div className="font-medium">{t}</div>
              <div className="mt-1 text-xs text-muted-foreground">Published · 84 likes · 12 comments</div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="grid gap-3 sm:grid-cols-2">
          {["Founders Roundtable — Jakarta", "Diaspora Berlin Weekend", "GarudaHacks 2025", "Sunrise Hike — Tangkuban"].map((e) => (
            <Card key={e} className="glass flex items-center gap-3 rounded-2xl border-border/50 p-4 shadow-soft">
              <Calendar className="size-4 text-primary" />
              <span className="text-sm">{e}</span>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentorship">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><GraduationCap className="size-4 text-primary" /> Mentorship progress</div>
            <div className="space-y-4">
              {[["Land Tech Lead role", 62], ["Publish 3 articles", 33], ["Complete design system course", 80]].map(([g, p]) => (
                <div key={g as string}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span>{g}</span><span className="font-medium">{p}%</span></div>
                  <Progress value={p as number} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {["First Article", "10 Connections", "Event Host", "Mentor", "Chapter Lead", "100 Likes", "Bootcamp Grad", "1-Year Member"].map((b) => (
              <Card key={b} className="glass flex flex-col items-center rounded-2xl border-border/50 p-5 text-center shadow-soft">
                <div className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-gold-gradient text-gold-foreground shadow-soft">
                  <Award className="size-6" />
                </div>
                <div className="text-sm font-semibold">{b}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}