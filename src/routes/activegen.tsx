import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, MessageCircle, Users } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const activities = [
  { title: "Sunday Sunrise Hike — Tangkuban Perahu", type: "Hiking", date: "Sun, Jul 14 · 04:30", loc: "Bandung", host: "Kirana W.", joined: 18, cap: 30 },
  { title: "Futsal Friendly — SCBD", type: "Football", date: "Sat, Jul 20 · 19:00", loc: "Jakarta", host: "Farhan A.", joined: 14, cap: 16 },
  { title: "Morning Run 10K", type: "Running", date: "Sun, Jul 21 · 06:00", loc: "GBK, Jakarta", host: "Rina P.", joined: 42, cap: 100 },
  { title: "Coffee & Careers", type: "Coffee Meetup", date: "Thu, Jul 25 · 18:00", loc: "Bandung", host: "Bagas S.", joined: 22, cap: 40 },
  { title: "Badminton Doubles Night", type: "Badminton", date: "Fri, Jul 26 · 20:00", loc: "Jakarta", host: "Sinta L.", joined: 8, cap: 12 },
  { title: "Beach Cleanup — Anyer", type: "Volunteering", date: "Sat, Aug 03 · 07:00", loc: "Banten", host: "Dewi R.", joined: 30, cap: 60 },
];

function ActiveGen() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="ActiveGen"
        title="Move together, meet in person"
        description="Sport, hikes, coffee, and giving back — activities from the community, for the community."
        actions={<Button>Host an activity</Button>}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => (
          <Card key={a.title} className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
            <div className="relative flex h-32 items-center justify-center bg-hero-gradient">
              <Badge className="absolute left-3 top-3 border-white/20 bg-white/15 text-white backdrop-blur">{a.type}</Badge>
              <div className="font-display text-3xl font-bold text-white/90">ActiveGen</div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold leading-snug">{a.title}</h3>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {a.date}</div>
                <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {a.loc}</div>
                <div className="flex items-center gap-1.5"><Users className="size-3.5" /> {a.joined}/{a.cap} joined</div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
                <div className="size-7 rounded-full bg-gold-gradient" />
                <span className="text-xs text-muted-foreground">by {a.host}</span>
                <Button size="sm" className="ml-auto h-8">Join</Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Discussion"><MessageCircle className="size-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}