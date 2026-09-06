import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CalendarClock, Target } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api";

export const Route = createFileRoute("/_authenticated/admin/members/$id")({
  component: AdminMemberPage,
  head: () => ({
    meta: [
      { title: "Member detail — Garuda Admin" },
      {
        name: "description",
        content: "Review a member's mentorship history, session progress, goals, and overdue sessions.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AdminMemberPage() {
  const { id } = Route.useParams();
  const detailQuery = useQuery({
    queryKey: ["admin", "member", id],
    queryFn: () => api.admin.memberDetail(id),
  });
  const detail = detailQuery.data;

  return (
    <PageShell>
      <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
        <Link to="/admin">
          <ArrowLeft className="size-4" /> Back to admin
        </Link>
      </Button>

      <PageHeader
        title={detail?.member.name ?? "Member detail"}
        description={
          detail?.headline ??
          "Mentorship history, session progress, goals, and overdue sessions for this member."
        }
      />

      {detailQuery.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}

      {detailQuery.isError && (
        <Card className="glass rounded-2xl border-border/50 p-6 text-sm text-muted-foreground shadow-soft">
          This member could not be found.
        </Card>
      )}

      {detail && (
        <div className="space-y-6">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={detail.member.status === "Suspended" ? "destructive" : "secondary"}>
                {detail.member.status}
              </Badge>
              <span>{detail.member.country}</span>
              <span>· Joined {formatDate(detail.member.joined)}</span>
            </div>
            {(detail.skills.length > 0 || detail.interests.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-1">
                {[...detail.skills, ...detail.interests].map((t) => (
                  <Badge key={t} variant="outline" className="text-[11px]">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Mentorships", value: `${detail.totals.mentorships}` },
                { label: "Sessions held", value: `${detail.totals.sessions}` },
                { label: "Avg progress", value: `${detail.totals.avgProgress}%` },
                { label: "Overdue sessions", value: `${detail.totals.overdueSessions}` },
                {
                  label: "Goals done",
                  value: `${detail.totals.goalsCompleted}/${detail.totals.goalsTotal}`,
                },
                { label: "Status", value: detail.member.status },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/50 p-3">
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {detail.totals.overdueSessions > 0 && (
            <Card className="rounded-2xl border-destructive/40 bg-destructive/5 p-4 text-sm shadow-soft">
              <div className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="size-4" />
                {detail.totals.overdueSessions} overdue session
                {detail.totals.overdueSessions > 1 ? "s" : ""} need follow-up
              </div>
            </Card>
          )}

          {detail.mentorships.length === 0 && (
            <Card className="glass rounded-2xl border-border/50 p-6 text-sm text-muted-foreground shadow-soft">
              This member has no mentorship history yet.
            </Card>
          )}

          {detail.mentorships.map((m) => (
            <Card key={m.id} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">with {m.mentorName}</div>
                  <div className="text-xs text-muted-foreground">
                    Started {formatDate(m.startedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === "completed" ? "secondary" : "outline"}>
                    {m.status}
                  </Badge>
                  {m.overdueDays !== null && (
                    <Badge variant="destructive">Overdue {m.overdueDays}d</Badge>
                  )}
                </div>
              </div>

              <Progress
                value={m.progress}
                className="mt-3 h-2"
                aria-label={`Progress ${m.progress} percent`}
              />
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{m.progress}% progress</span>
                {m.nextSessionAt && (
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    {m.overdueDays !== null ? "Missed" : "Next"} session{" "}
                    {formatDate(m.nextSessionAt)}
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Session history
                  </div>
                  {m.sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sessions held yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {m.sessions.map((s) => (
                        <li key={s.id} className="rounded-xl border border-border/50 p-3 text-sm">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(s.heldAt)}</div>
                          {s.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
                    <Target className="size-3" /> Goals
                  </div>
                  {m.goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No goals set yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {m.goals.map((g) => (
                        <li key={g.id}>
                          <div className="flex items-center justify-between text-sm">
                            <span>{g.title}</span>
                            <span className="text-xs text-muted-foreground">{g.progress}%</span>
                          </div>
                          <Progress value={g.progress} className="mt-1 h-1.5" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
