import { createFileRoute } from "@tanstack/react-router";
import { Building2, Linkedin, MapPin, Mail, Search } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/members")({
  component: MembersPage,
  head: () => ({
    meta: [
      { title: "Members — Garuda" },
      { name: "description", content: "Search and connect with members by skill, company, interest, and country." },
    ],
    links: [{ rel: "canonical", href: "/members" }],
  }),
});

const members = [
  { name: "Ayu Pratiwi", role: "Tech Lead", company: "Gojek", country: "🇮🇩 Jakarta", skills: ["Backend", "Go", "K8s"], interests: ["Hiking"] },
  { name: "Rendy Sinaga", role: "Product Designer", company: "Booking.com", country: "🇳🇱 Amsterdam", skills: ["UX", "Figma"], interests: ["Coffee", "Photography"] },
  { name: "Yoga Pradana", role: "Staff Engineer", company: "Meta", country: "🇺🇸 SF", skills: ["System Design"], interests: ["Running"] },
  { name: "Kirana W.", role: "Founder", company: "Rasa Studio", country: "🇮🇩 Bandung", skills: ["Brand", "Content"], interests: ["Hiking", "Coffee"] },
  { name: "Farhan Aditya", role: "Senior Engineer", company: "Grab", country: "🇸🇬 Singapore", skills: ["Frontend", "React"], interests: ["Football"] },
  { name: "Nadia Wibowo", role: "Immigration Consultant", company: "Independent", country: "🇩🇪 Berlin", skills: ["EU Visa"], interests: ["Cooking"] },
];

function MembersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Member directory"
        title="Meet the community"
        description="Search by skill, company, interest, or country. Reach out and grow your network."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 shadow-soft">
          <Search className="size-4 text-muted-foreground" />
          <Input placeholder="Search members…" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
        </div>
        <Button variant="outline">Filters</Button>
        <Button variant="outline">Country</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Card key={m.name} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gold-gradient" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{m.name}</div>
                <div className="truncate text-xs text-muted-foreground">{m.role} · {m.company}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {m.country}</span>
              <span className="inline-flex items-center gap-1"><Building2 className="size-3" /> {m.company}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.skills.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
              {m.interests.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
            </div>
            <div className="mt-5 flex gap-2">
              <Button size="sm" className="flex-1">Connect</Button>
              <Button size="icon" variant="outline" aria-label="LinkedIn"><Linkedin className="size-4" /></Button>
              <Button size="icon" variant="outline" aria-label="Email"><Mail className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}