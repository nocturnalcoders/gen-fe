import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Globe2,
  GraduationCap,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoAsset from "@/assets/garuda-logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Garuda Empowerment Network — Rise Together" },
      {
        name: "description",
        content:
          "A global community for Indonesians. Find mentors, join events, share stories, and grow with people who lift each other up.",
      },
      { property: "og:title", content: "Garuda Empowerment Network" },
      {
        property: "og:description",
        content: "Mentorship, articles, and events for Indonesians rising together.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const stats = [
  { label: "Active Members", value: "12,400+" },
  { label: "Certified Mentors", value: "480" },
  { label: "Country Chapters", value: "34" },
  { label: "Events Hosted", value: "1,900" },
];

const testimonials = [
  {
    quote:
      "I met my mentor through Garuda and within a year I moved from junior engineer to tech lead. This community changed my life.",
    name: "Ayu Pratiwi",
    role: "Tech Lead · Gojek",
  },
  {
    quote:
      "The diaspora chapter in Amsterdam felt like home from day one. Real friendships, real opportunities.",
    name: "Rendy Sinaga",
    role: "Product Designer · Booking.com",
  },
  {
    quote:
      "From weekend hiking to career workshops — Garuda is where I show up as my full self.",
    name: "Kirana Wulandari",
    role: "Founder · Rasa Studio",
  },
];

const events = [
  { title: "Jakarta Founders Roundtable", date: "Jul 18", city: "Jakarta", tag: "Meetup" },
  { title: "Frontend Deep Dive — Bootcamp", date: "Jul 24", city: "Online", tag: "Bootcamp" },
  { title: "Diaspora Weekend — Berlin", date: "Aug 03", city: "Berlin", tag: "Gathering" },
  { title: "Coffee & Careers", date: "Aug 09", city: "Bandung", tag: "ActiveGen" },
];

const articles = [
  { tag: "Career", title: "How I negotiated a 40% raise as an engineer in Singapore", author: "Farhan A.", read: "6 min" },
  { tag: "Immigration", title: "Blue Card in Germany: the honest 2026 guide", author: "Nadia W.", read: "9 min" },
  { tag: "Founder", title: "Bootstrapping a SaaS from a kost in Yogyakarta", author: "Bagas S.", read: "7 min" },
];

function Landing() {
  return (
    <PageShell bare>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-32 lg:pt-24">
          <div className="text-white">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur">
              <Sparkles className="mr-1.5 size-3.5" /> A community for Indonesians, anywhere
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Rise together.{" "}
              <span className="bg-gold-gradient bg-clip-text text-transparent">Belong everywhere.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Garuda Empowerment Network is where mentors, founders, students, and diaspora Indonesians meet — to build careers, share stories, and show up for each other.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold-gradient text-gold-foreground hover:opacity-95 shadow-glow">
                <Link to="/dashboard">Join the community <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/mentorship">Find a mentor</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="glass-strong absolute inset-0 rounded-3xl" />
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <img src={logoAsset.url} alt="" className="h-40 w-40 drop-shadow-[0_10px_40px_oklch(0.6_0.22_35/0.55)]" />
              <p className="mt-4 max-w-xs text-sm text-white/85">
                One garuda, one community — lifting each other higher.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: Users, title: "Community first", body: "Real people, real conversations. No spam, no gatekeeping — just Indonesians helping Indonesians grow." },
            { icon: GraduationCap, title: "Mentorship that ships", body: "Match with mentors who've walked the path. Set goals, track progress, and move forward together." },
            { icon: Globe2, title: "Wherever you are", body: "From Bali to Berlin — chapters, events, and friends across 34 countries." },
          ].map((c) => (
            <Card key={c.title} className="glass rounded-3xl border-border/50 p-7 shadow-soft">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Upcoming</div>
                <h2 className="mt-1 text-2xl font-bold">Events this month</h2>
              </div>
              <Link to="/events" className="text-sm font-medium text-primary hover:underline">See all</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((e) => (
                <Card key={e.title} className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
                  <div className="flex h-24 items-center justify-center bg-hero-gradient text-white">
                    <Calendar className="size-8 opacity-90" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{e.tag}</Badge>
                      <span className="text-xs text-muted-foreground">{e.date} · {e.city}</span>
                    </div>
                    <div className="mt-2 font-semibold">{e.title}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Mentor of the month</div>
              <h2 className="mt-1 text-2xl font-bold">Meet Prasetyo</h2>
            </div>
            <Card className="glass rounded-3xl border-border/50 p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-gold-gradient" />
                <div>
                  <div className="font-semibold">Prasetyo H.</div>
                  <div className="text-xs text-muted-foreground">Eng Manager · Airbnb SF</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                "I mentor engineers navigating the jump from IC to leadership — especially those relocating abroad."
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Leadership", "Career", "Relocation"].map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
              <Button asChild className="mt-5 w-full">
                <Link to="/mentorship">Request mentorship</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Latest articles</div>
            <h2 className="mt-1 text-2xl font-bold">Stories from the community</h2>
          </div>
          <Link to="/articles" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <Card key={a.title} className="glass group rounded-2xl border-border/50 p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <Badge variant="secondary" className="mb-3">{a.tag}</Badge>
              <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">{a.title}</h3>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.author}</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="size-3" /> {a.read}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Loved by the community</div>
          <h2 className="mt-1 text-3xl font-bold">Real stories, real growth</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="glass rounded-3xl border-border/50 p-7 shadow-soft">
              <div className="mb-3 flex gap-0.5 text-[oklch(0.79_0.14_82)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="size-9 rounded-full bg-gold-gradient" />
                <div className="text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 shadow-glow sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,200,80,0.25),transparent_60%)]" />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold sm:text-4xl">Your next chapter starts with people who get you.</h2>
              <p className="mt-3 max-w-xl text-white/85">
                Join thousands of Indonesians building careers, companies, and communities together.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" className="bg-gold-gradient text-gold-foreground shadow-soft">
                <Link to="/dashboard">Create free account <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/diaspora"><Compass className="mr-1 size-4" /> Find your chapter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}