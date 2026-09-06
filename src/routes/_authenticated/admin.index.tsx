import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, FileText, Flag, Users } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { api } from "@/api";
import type { AdminMemberStatus, AdminReportRange } from "@/api/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Garuda" },
      {
        name: "description",
        content: "Moderate members and articles, review analytics, and generate community reports.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
});

const statusOptions: AdminMemberStatus[] = ["Active", "Mentor", "Pending", "Suspended"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AdminPage() {
  const qc = useQueryClient();
  const [range, setRange] = useState<AdminReportRange>("30d");

  const statsQuery = useQuery({ queryKey: ["admin", "stats"], queryFn: () => api.admin.stats() });
  const membersQuery = useQuery({ queryKey: ["admin", "members"], queryFn: () => api.admin.listMembers() });
  const eventsQuery = useQuery({ queryKey: ["admin", "events"], queryFn: () => api.admin.listEvents() });
  const moderationQuery = useQuery({
    queryKey: ["admin", "moderation"],
    queryFn: () => api.admin.listModeration(),
  });
  const reportsQuery = useQuery({ queryKey: ["admin", "reports"], queryFn: () => api.admin.listReports() });
  const analyticsQuery = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => api.admin.analytics() });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: AdminMemberStatus }) => api.admin.setMemberStatus(input),
    onSuccess: (row) => {
      toast.success(`${row.name} is now ${row.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moderateMutation = useMutation({
    mutationFn: (input: { id: string; action: "approve" | "reject" }) => api.admin.moderate(input),
    onSuccess: (item) => {
      toast.success(item.status === "approved" ? "Article approved" : "Article removed");
      qc.invalidateQueries({ queryKey: ["admin", "moderation"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reportMutation = useMutation({
    mutationFn: () => api.admin.generateReport({ range }),
    onSuccess: () => toast.success("Report generated"),
    onError: (e: Error) => toast.error(e.message),
  });

  const generated = reportMutation.data;
  const growth = analyticsQuery.data?.memberGrowth ?? [];
  const peak = Math.max(1, ...growth.map((g) => g.members));
  const pending = (moderationQuery.data ?? []).filter((m) => m.status === "pending");

  function downloadCsv() {
    const rows = generated?.rows ?? reportsQuery.data ?? [];
    if (!rows.length) {
      toast.error("Generate a report first");
      return;
    }
    const csv = ["Metric,Value", ...rows.map((r) => `"${r.label}","${r.value}"`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `garuda-report-${generated?.range ?? range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Community operations"
        description="Moderate members and articles, track analytics, and export reports from one place."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading
          ? [0, 1, 2, 3].map((i) => (
              <Card key={i} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-7 w-16" />
              </Card>
            ))
          : (statsQuery.data ?? []).map((s, i) => {
              const Icon = [Users, FileText, BarChart3, Flag][i] ?? Users;
              return (
                <Card key={s.label} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="mt-1 text-2xl font-bold">{s.value}</div>
                    </div>
                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>

      <Tabs defaultValue="members">
        <TabsList className="glass flex-wrap rounded-full p-1">
          <TabsTrigger value="members" className="rounded-full px-4">Members</TabsTrigger>
          <TabsTrigger value="events" className="rounded-full px-4">Events</TabsTrigger>
          <TabsTrigger value="moderation" className="rounded-full px-4">
            Moderation{pending.length > 0 ? ` (${pending.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full px-4">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full px-4">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card className="glass overflow-x-auto rounded-2xl border-border/50 shadow-soft">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Set status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {membersQuery.isLoading && (
                  <tr>
                    <td className="p-4" colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                )}
                {(membersQuery.data ?? []).map((m) => (
                  <tr key={m.id}>
                    <td className="p-4 font-medium">{m.name}</td>
                    <td className="p-4 text-muted-foreground">{m.country}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(m.joined)}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          m.status === "Suspended"
                            ? "destructive"
                            : m.status === "Pending"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        {statusOptions
                          .filter((s) => s !== m.status)
                          .map((s) => (
                            <Button
                              key={s}
                              size="sm"
                              variant={s === "Suspended" ? "destructive" : "ghost"}
                              className="h-7 text-xs"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: m.id, status: s })}
                            >
                              {s}
                            </Button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6 space-y-3">
          {eventsQuery.isLoading && <Skeleton className="h-16 w-full rounded-2xl" />}
          {(eventsQuery.data ?? []).map((e) => (
            <Card
              key={e.id}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border-border/50 p-4 shadow-soft"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(e.date)} · {e.registered}/{e.capacity} registered
                </div>
                <Progress
                  value={Math.round((e.registered / Math.max(1, e.capacity)) * 100)}
                  className="mt-2 w-48"
                />
              </div>
              <Badge variant="secondary">
                {Math.round((e.registered / Math.max(1, e.capacity)) * 100)}% full
              </Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="moderation" className="mt-6 space-y-3">
          {moderationQuery.isLoading && <Skeleton className="h-16 w-full rounded-2xl" />}
          {!moderationQuery.isLoading && (moderationQuery.data ?? []).length === 0 && (
            <Card className="glass rounded-2xl border-border/50 p-6 text-center text-sm text-muted-foreground shadow-soft">
              Nothing in the moderation queue.
            </Card>
          )}
          {(moderationQuery.data ?? []).map((m) => (
            <Card
              key={m.id}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border-border/50 p-4 shadow-soft"
            >
              <div className="flex min-w-0 items-start gap-3 text-sm">
                <Flag className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    by {m.author} · {m.reason}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    m.status === "approved"
                      ? "secondary"
                      : m.status === "rejected"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {m.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={m.status !== "pending" || moderateMutation.isPending}
                  onClick={() => moderateMutation.mutate({ id: m.id, action: "approve" })}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={m.status !== "pending" || moderateMutation.isPending}
                  onClick={() => moderateMutation.mutate({ id: m.id, action: "reject" })}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-4 text-sm font-semibold">Member growth</div>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex h-40 items-end gap-3">
                {growth.map((g) => (
                  <div key={g.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="text-[11px] text-muted-foreground">
                      {g.members.toLocaleString()}
                    </div>
                    <div
                      className="w-full rounded-t-lg bg-primary/80"
                      style={{ height: `${(g.members / peak) * 100}%` }}
                    />
                    <div className="text-xs text-muted-foreground">{g.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-4 text-sm font-semibold">Engagement</div>
            <ul className="space-y-4">
              {(analyticsQuery.data?.engagement ?? []).map((e) => (
                <li key={e.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{e.label}</span>
                    <span className="font-semibold">{e.value}</span>
                  </div>
                  <Progress
                    value={Math.min(100, (e.value / Math.max(1, analyticsQuery.data?.engagement[0]?.value ?? 1)) * 100)}
                    className="mt-2"
                  />
                </li>
              ))}
              {analyticsQuery.isLoading && <Skeleton className="h-24 w-full" />}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-4">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-2 text-sm font-semibold">Generate a report</div>
            <p className="text-sm text-muted-foreground">
              Pick a period, generate the numbers, then export them as CSV.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["7d", "30d", "90d"] as AdminReportRange[]).map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={range === r ? "default" : "outline"}
                  onClick={() => setRange(r)}
                >
                  Last {r.replace("d", " days")}
                </Button>
              ))}
              <Button
                className="ml-auto"
                disabled={reportMutation.isPending}
                onClick={() => reportMutation.mutate()}
              >
                {reportMutation.isPending ? "Generating…" : "Generate"}
              </Button>
              <Button variant="outline" onClick={downloadCsv}>
                Download CSV
              </Button>
            </div>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-4 text-sm font-semibold">
              {generated ? `Report · last ${generated.range.replace("d", " days")}` : "Key metrics"}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(generated?.rows ?? reportsQuery.data ?? []).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 p-4"
                >
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="text-sm font-semibold">{r.value}</span>
                </div>
              ))}
              {reportsQuery.isLoading && <Skeleton className="h-14 w-full" />}
            </div>
            {generated && (
              <div className="mt-4 text-xs text-muted-foreground">
                Generated {new Date(generated.generatedAt).toLocaleString()}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
