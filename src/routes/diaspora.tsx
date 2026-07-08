import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Calendar, Plane, Sparkles } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/diaspora")({
  component: Diaspora,
  head: () => ({
    meta: [
      { title: "Diaspora — Garuda" },
      { name: "description", content: "Country chapters, gatherings, career sharing, and immigration tips for Indonesians abroad." },
    ],
    links: [{ rel: "canonical", href: "/diaspora" }],
  }),
});

const chapters = [
  { flag: "🇳🇱", country: "Netherlands", city: "Amsterdam", members: 480 },
  { flag: "🇩🇪", country: "Germany", city: "Berlin", members: 320 },
  { flag: "🇯🇵", country: "Japan", city: "Tokyo", members: 610 },
  { flag: "🇺🇸", country: "United States", city: "San Francisco", members: 540 },
  { flag: "🇦🇺", country: "Australia", city: "Melbourne", members: 390 },
  { flag: "🇸🇬", country: "Singapore", city: "Singapore", members: 1120 },
  { flag: "🇬🇧", country: "United Kingdom", city: "London", members: 280 },
  { flag: "🇦🇪", country: "UAE", city: "Dubai", members: 165 },
];

function Diaspora() {
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
          {chapters.map((c) => (
            <Card key={c.country} className="glass group rounded-2xl border-border/50 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{c.flag}</div>
                <div>
                  <div className="font-semibold">{c.country}</div>
                  <div className="text-xs text-muted-foreground">{c.city} · {c.members} members</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-center">Join chapter</Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Calendar className="size-4 text-primary" /> Upcoming gatherings</div>
          <ul className="space-y-3 text-sm">
            {["Berlin Bakso Night · Aug 3", "Tokyo Onsen & Networking · Aug 10", "SF Independence Day Picnic · Aug 17"].map((x) => (
              <li key={x} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate">{x}</span><Button size="sm" variant="ghost">RSVP</Button></li>
            ))}
          </ul>
        </Card>
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Briefcase className="size-4 text-primary" /> Career sharing</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>"How I got a work visa in the Netherlands in 6 weeks" — Rendy</li>
            <li>"From Bandung to Berlin: relocating with family" — Nadia</li>
            <li>"Interviewing at Japanese firms in English" — Yoga</li>
          </ul>
          <Badge variant="secondary" className="mt-4">32 open referrals</Badge>
        </Card>
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Plane className="size-4 text-primary" /> Immigration tips</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Blue Card timeline & salary thresholds (2026)</li>
            <li>Australia 189 vs 190 — which fits you</li>
            <li>Renewing tourist-to-work in Singapore</li>
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