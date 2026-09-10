import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Target } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api";
import type { MentorshipRequestStatus } from "@/api/types";

export const Route = createFileRoute("/_authenticated/mentorship-tracking")({
  component: TrackingPage,
  head: () => ({
    meta: [
      { title: "Pelacakan mentorship — Garuda" },
      {
        name: "description",
        content:
          "Lacak pengajuan mentorship Anda, statusnya, riwayat sesi, dan progres setiap goal.",
      },
      { property: "og:title", content: "Pelacakan mentorship — Garuda" },
      {
        property: "og:description",
        content: "Status pengajuan mentorship, riwayat sesi, dan progres goal Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/mentorship-tracking" }],
  }),
});

const STATUS_LABEL: Record<MentorshipRequestStatus, string> = {
  pending: "Menunggu konfirmasi",
  accepted: "Diterima",
  declined: "Ditolak",
  postponed: "Ditunda",
  completed: "Selesai",
};

function statusVariant(status: MentorshipRequestStatus) {
  if (status === "accepted" || status === "completed") return "secondary" as const;
  if (status === "declined") return "destructive" as const;
  return "outline" as const;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackingPage() {
  const requestsQuery = useQuery({
    queryKey: ["mentorship", "requests"],
    queryFn: () => api.mentorship.listRequests(),
  });
  const sessionsQuery = useQuery({
    queryKey: ["mentorship", "sessions"],
    queryFn: () => api.mentorship.listSessions(),
  });
  const goalsQuery = useQuery({
    queryKey: ["mentorship", "goals"],
    queryFn: () => api.mentorship.listGoals(),
  });

  const requests = requestsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Mentorship"
        title="Pelacakan mentorship saya"
        description="Semua pengajuan Anda, statusnya, riwayat sesi, dan progres goal dalam satu halaman."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/request-mentorship">Ajukan mentorship baru</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/mentorship">Cari mentor</Link>
        </Button>
      </div>

      {requestsQuery.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}

      {!requestsQuery.isLoading && requests.length === 0 && (
        <Card className="glass rounded-2xl border-border/50 p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            Anda belum mengajukan mentorship. Mulai dengan memilih mentor yang cocok.
          </p>
          <Button asChild className="mt-4">
            <Link to="/request-mentorship">Ajukan mentorship</Link>
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        {requests.map((r) => {
          const own = sessions
            .filter((s) => s.requestId === r.id)
            .sort((a, b) => +new Date(b.heldAt) - +new Date(a.heldAt));
          const ownGoals = goals.filter((g) => g.requestId === r.id);
          const overdue =
            r.nextSessionAt &&
            +new Date(r.nextSessionAt) < Date.now() &&
            !own.some((s) => +new Date(s.heldAt) >= +new Date(r.nextSessionAt!)) &&
            ["pending", "accepted"].includes(r.status);

          return (
            <Card key={r.id} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{r.mentorName}</h2>
                  <div className="text-xs text-muted-foreground">
                    Diajukan {formatDateTime(r.createdAt)}
                  </div>
                </div>
                <Badge variant={statusVariant(r.status)}>{STATUS_LABEL[r.status]}</Badge>
              </div>

              {r.message && (
                <p className="mt-3 text-sm text-muted-foreground">“{r.message}”</p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress mentorship</span>
                  <span className="font-semibold text-foreground">{r.progress}%</span>
                </div>
                <Progress value={r.progress} className="mt-2" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <CalendarClock className="size-4 text-primary" />
                <span className="text-muted-foreground">
                  Sesi berikutnya:{" "}
                  {r.nextSessionAt ? formatDateTime(r.nextSessionAt) : "belum dijadwalkan"}
                </span>
                {overdue && <Badge variant="destructive">Terlambat</Badge>}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold">Riwayat sesi ({own.length})</div>
                  {own.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada sesi tercatat.</p>
                  ) : (
                    <ul className="space-y-2">
                      {own.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-xl border border-border/50 p-3 text-sm"
                        >
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(s.heldAt)} · {s.durationMinutes ?? 60} menit
                          </div>
                          {s.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Target className="size-4 text-primary" /> Goals ({ownGoals.length})
                  </div>
                  {ownGoals.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada goal.</p>
                  ) : (
                    <ul className="space-y-3">
                      {ownGoals.map((g) => (
                        <li key={g.id}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{g.title}</span>
                            <span className="font-semibold">{g.progress}%</span>
                          </div>
                          <Progress value={g.progress} className="mt-1.5" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
