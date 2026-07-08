import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/events")({
  component: EventsPage,
  head: () => ({
    meta: [
      { title: "Events — Garuda" },
      { name: "description", content: "Workshops, webinars, bootcamps, meetups, and hackathons across the network." },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
});

const events = [
  { type: "Workshop", title: "Portfolio Reviews for Designers", date: "Jul 22 · 19:00", loc: "Online", seats: 40 },
  { type: "Webinar", title: "Fundraising 101 for Indonesian Founders", date: "Jul 27 · 20:00", loc: "Online", seats: 500 },
  { type: "Bootcamp", title: "Full-stack TypeScript — 4-week intensive", date: "Aug 1 - Aug 28", loc: "Hybrid", seats: 30 },
  { type: "Meetup", title: "Product People — Jakarta", date: "Aug 5 · 18:30", loc: "Jakarta", seats: 120 },
  { type: "Hackathon", title: "GarudaHacks — Build for Diaspora", date: "Sep 12 - Sep 14", loc: "Bandung + Online", seats: 200 },
];

function EventsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Community events"
        title="Learn, build, and gather"
        description="Every week, something new — workshops, webinars, bootcamps, meetups, and hackathons."
        actions={<Button>Submit an event</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 sm:grid-cols-2">
          {events.map((e) => (
            <Card key={e.title} className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
              <div className="relative flex h-28 items-center justify-center bg-hero-gradient text-white">
                <Badge className="absolute left-3 top-3 border-white/20 bg-white/15 backdrop-blur">{e.type}</Badge>
                <div className="font-display text-xl font-semibold opacity-90">{e.date.split(" · ")[0]}</div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold leading-snug">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {e.date}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {e.loc}</div>
                  <div className="flex items-center gap-1.5"><Users className="size-3.5" /> {e.seats} seats</div>
                </div>
                <Button className="mt-4 w-full">Register</Button>
              </div>
            </Card>
          ))}
        </div>

        <aside className="space-y-5">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Countdown</div>
            <div className="mt-1 text-lg font-bold">GarudaHacks 2026</div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[["66", "days"], ["04", "hrs"], ["12", "min"], ["30", "sec"]].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-primary/10 p-2">
                  <div className="font-display text-xl font-bold text-primary">{n}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 text-sm font-semibold">Featured speakers</div>
            <ul className="space-y-3">
              {[["Prasetyo H.", "Airbnb"], ["Sinta L.", "Grab"], ["Nadia W.", "SAP"]].map(([n, c]) => (
                <li key={n} className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gold-gradient" />
                  <div className="text-sm"><div className="font-medium">{n}</div><div className="text-xs text-muted-foreground">{c}</div></div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-2 text-sm font-semibold">Agenda</div>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li>18:00 · Doors & networking</li>
              <li>18:30 · Opening keynote</li>
              <li>19:00 · Panel discussion</li>
              <li>20:00 · Community mingle</li>
            </ol>
          </Card>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
        <Card className="glass rounded-2xl border-border/50 p-2 shadow-soft">
          <Accordion type="single" collapsible>
            {[
              ["Are events free?", "Most community events are free. Bootcamps have a subsidized fee."],
              ["Can I attend from abroad?", "Yes — many events are hybrid or online. Filter by 'Online' to browse."],
              ["Do I get a certificate?", "Bootcamps and workshops issue a completion certificate on your profile."],
            ].map(([q, a]) => (
              <AccordionItem key={q} value={q} className="border-border/60">
                <AccordionTrigger className="px-3 text-left text-sm">{q}</AccordionTrigger>
                <AccordionContent className="px-3 text-sm text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>
    </PageShell>
  );
}