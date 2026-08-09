import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileText, Flag, Users } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Garuda" },
      { name: "description", content: "Manage members, events, moderate articles, and view analytics." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
});

function AdminPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Community operations"
        description="Manage the network, keep it safe, and watch it grow."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total members", value: "12,483", icon: Users },
          { label: "Active events", value: "48", icon: FileText },
          { label: "Pending reports", value: "6", icon: Flag },
          { label: "MoM growth", value: "+18%", icon: BarChart3 },
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

      <Tabs defaultValue="members">
        <TabsList className="glass rounded-full p-1">
          <TabsTrigger value="members" className="rounded-full px-4">Members</TabsTrigger>
          <TabsTrigger value="events" className="rounded-full px-4">Events</TabsTrigger>
          <TabsTrigger value="moderation" className="rounded-full px-4">Moderation</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full px-4">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card className="glass overflow-hidden rounded-2xl border-border/50 shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="p-4">Member</th><th className="p-4">Country</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4" /></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  ["Ayu Pratiwi", "🇮🇩 Jakarta", "Jan 2024", "Active"],
                  ["Rendy Sinaga", "🇳🇱 Amsterdam", "Mar 2024", "Active"],
                  ["Yoga Pradana", "🇺🇸 SF", "Sep 2023", "Mentor"],
                  ["New Signup #24193", "🇸🇬 Singapore", "Today", "Pending"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="p-4 font-medium">{r[0]}</td>
                    <td className="p-4 text-muted-foreground">{r[1]}</td>
                    <td className="p-4 text-muted-foreground">{r[2]}</td>
                    <td className="p-4"><Badge variant={r[3] === "Pending" ? "outline" : "secondary"}>{r[3]}</Badge></td>
                    <td className="p-4 text-right"><Button size="sm" variant="ghost">Manage</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6 space-y-3">
          {["Founders Roundtable — Jul 18", "Frontend Bootcamp — Jul 24", "GarudaHacks — Sep 12"].map((e) => (
            <Card key={e} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
              <span className="text-sm">{e}</span>
              <div className="flex gap-2"><Button size="sm" variant="outline">Edit</Button><Button size="sm" variant="ghost">Archive</Button></div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="moderation" className="mt-6 space-y-3">
          {["Article flagged: 'Get rich quick with crypto'", "Comment reported: hate speech", "Duplicate account suspected"].map((m) => (
            <Card key={m} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
              <div className="flex items-center gap-3 text-sm"><Flag className="size-4 text-destructive" /> {m}</div>
              <div className="flex gap-2"><Button size="sm" variant="outline">Review</Button><Button size="sm" variant="destructive">Remove</Button></div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-2 text-sm font-semibold">Monthly report</div>
            <p className="text-sm text-muted-foreground">Signups, engagement, retention, and event attendance — export as CSV.</p>
            <div className="mt-4 flex gap-2"><Button>Download CSV</Button><Button variant="outline">Schedule email</Button></div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}