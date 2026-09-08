import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api";

export const Route = createFileRoute("/_authenticated/request-mentorship")({
  component: RequestMentorshipPage,
  head: () => ({
    meta: [
      { title: "Ajukan Mentorship — Garuda" },
      {
        name: "description",
        content:
          "Pilih mentor, tuliskan tujuan belajar Anda, dan tentukan jadwal sesi pertama untuk mengajukan mentorship.",
      },
      { property: "og:title", content: "Ajukan Mentorship — Garuda" },
      {
        property: "og:description",
        content: "Pilih mentor, tetapkan goals, dan jadwalkan sesi mentorship pertama Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function RequestMentorshipPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mentorId, setMentorId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [goalDraft, setGoalDraft] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [nextSessionAt, setNextSessionAt] = useState("");

  const mentorsQuery = useQuery({
    queryKey: ["mentors"],
    queryFn: () => api.mentorship.listMentors(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.mentorship.createRequest({
        mentorId,
        message: message.trim(),
        goals,
        nextSessionAt: nextSessionAt ? new Date(nextSessionAt).toISOString() : null,
      }),
    onSuccess: () => {
      toast.success("Pengajuan mentorship terkirim");
      qc.invalidateQueries({ queryKey: ["mentorship"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addGoal() {
    const g = goalDraft.trim();
    if (!g) return;
    setGoals((prev) => (prev.includes(g) ? prev : [...prev, g]));
    setGoalDraft("");
  }

  const canSubmit = !!mentorId && message.trim().length >= 10 && !createMutation.isPending;

  return (
    <PageShell>
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Kembali ke dashboard
      </Link>

      <PageHeader
        eyebrow="Mentorship"
        title="Ajukan mentorship"
        description="Pilih mentor, tuliskan tujuan Anda, lalu usulkan jadwal sesi pertama. Pengajuan langsung tampil di Admin Dashboard."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="glass space-y-6 rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="space-y-3">
            <Label>Pilih mentor</Label>
            {mentorsQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (mentorsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada mentor tersedia.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(mentorsQuery.data ?? []).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMentorId(m.id)}
                    aria-pressed={mentorId === m.id}
                    className={`rounded-xl border p-4 text-left transition ${
                      mentorId === m.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Apa yang ingin Anda capai?</Label>
            <Textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan latar belakang dan bantuan yang Anda butuhkan (min. 10 karakter)."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goals</Label>
            <div className="flex gap-2">
              <Input
                id="goal"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGoal();
                  }
                }}
                placeholder="mis. Lolos wawancara sistem desain"
              />
              <Button type="button" variant="outline" onClick={addGoal}>
                <Plus className="size-4" />
              </Button>
            </div>
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {goals.map((g) => (
                  <Badge key={g} variant="secondary" className="gap-1">
                    {g}
                    <button
                      type="button"
                      aria-label={`Hapus goal ${g}`}
                      onClick={() => setGoals((prev) => prev.filter((x) => x !== g))}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Usulan jadwal sesi pertama</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={nextSessionAt}
              onChange={(e) => setNextSessionAt(e.target.value)}
            />
          </div>

          <Button disabled={!canSubmit} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? "Mengirim…" : "Kirim pengajuan"}
          </Button>
        </Card>

        <Card className="glass h-fit rounded-2xl border-border/50 p-6 text-sm shadow-soft">
          <div className="mb-3 font-semibold">Ringkasan</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              Mentor:{" "}
              <span className="text-foreground">
                {(mentorsQuery.data ?? []).find((m) => m.id === mentorId)?.name ?? "belum dipilih"}
              </span>
            </li>
            <li>
              Goals: <span className="text-foreground">{goals.length || "belum ada"}</span>
            </li>
            <li>
              Jadwal:{" "}
              <span className="text-foreground">
                {nextSessionAt ? new Date(nextSessionAt).toLocaleString() : "belum ditentukan"}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Jika sesi terlewat dari jadwal, Anda otomatis menerima pengingat di notifikasi dan feed
            dashboard.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
