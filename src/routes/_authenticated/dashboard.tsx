import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Calendar, GraduationCap, Heart, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Garuda" },
      { name: "description", content: "Your personalized community feed, upcoming events, and mentorship progress." },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function Dashboard() {
  const { user } = useSession();
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const feed = [
    { author: "Nadia W.", time: "2h", body: "Just published a new guide on the German Blue Card. AMA in the comments!", likes: 48, comments: 12 },
    { author: "Farhan A.", time: "5h", body: "Looking for 2 co-founders for a fintech idea targeting Indonesian gig workers. DM me.", likes: 32, comments: 21 },
    { author: "Kirana W.", time: "1d", body: "Bandung ActiveGen hike this Sunday — 12 spots left, sunrise at Tangkuban Perahu ☀️", likes: 91, comments: 8 },
  ];
  return (
    <PageShell>
      <PageHeader
        eyebrow="Welcome back"
        title={`Selamat datang, ${displayName} 👋`}
        description="Here's what's happening in your community today."
        actions={<Button asChild><Link to="/articles">Write an article</Link></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Streak", value: "14 days", icon: Sparkles },
              { label: "Connections", value: "182", icon: TrendingUp },
              { label: "Bookmarks", value: "27", icon: Bookmark },
            ].map((s) => (
              <Card key={s.label} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="mt-1 text-2xl font-bold">{s.value}</div>
                  </div>
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Your feed</h2>
            <div className="space-y-4">
              {feed.map((p) => (
                <Card key={p.author + p.time} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gold-gradient" />
                    <div>
                      <div className="text-sm font-semibold">{p.author}</div>
                      <div className="text-xs text-muted-foreground">{p.time} ago</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/90">{p.body}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="inline-flex items-center gap-1 hover:text-primary"><Heart className="size-4" /> {p.likes}</button>
                    <button className="inline-flex items-center gap-1 hover:text-primary"><MessageCircle className="size-4" /> {p.comments}</button>
                    <button className="ml-auto inline-flex items-center gap-1 hover:text-primary"><Bookmark className="size-4" /> Save</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Calendar className="size-4 text-primary" /> Upcoming events</div>
            <ul className="space-y-3 text-sm">
              {["Founders Roundtable · Jul 18", "Frontend Bootcamp · Jul 24", "Diaspora Berlin · Aug 03"].map((e) => (
                <li key={e} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate">{e}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">RSVP</Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><GraduationCap className="size-4 text-primary" /> Active mentorship</div>
            <div className="text-sm">
              <div className="font-medium">with Prasetyo H.</div>
              <div className="text-xs text-muted-foreground">Goal: Land tech-lead role by Q4</div>
              <Progress value={62} className="mt-3" />
              <div className="mt-2 text-xs text-muted-foreground">62% · Next session Thu 7pm</div>
            </div>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 text-sm font-semibold">Recommended mentors</div>
            <ul className="space-y-3">
              {[["Sinta L.", "PM · Grab"], ["Yoga P.", "Staff Eng · Meta"], ["Dewi R.", "Design Lead · Tokopedia"]].map(([n, r]) => (
                <li key={n} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gold-gradient" />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="truncate font-medium">{n}</div>
                    <div className="truncate text-xs text-muted-foreground">{r}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Connect</Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-2 text-sm font-semibold">Community updates</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>· 3 new mentors joined this week</li>
              <li>· Diaspora Tokyo chapter launched</li>
              <li>· Article guidelines updated</li>
            </ul>
            <Badge variant="secondary" className="mt-3">Weekly digest</Badge>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}