import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Quote, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/mentors/$id")({
  component: MentorProfilePage,
  head: () => ({
    meta: [
      { title: "Profil mentor — Garuda" },
      {
        name: "description",
        content:
          "Lihat riwayat sesi, skor kecocokan, dan testimoni mentor sebelum mengajukan mentorship.",
      },
      { property: "og:title", content: "Profil mentor — Garuda Empowerment Network" },
      {
        property: "og:description",
        content: "Riwayat sesi, skor kecocokan, dan testimoni untuk memilih mentor terbaik.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

function MentorProfilePage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-profile", id],
    queryFn: () => api.mentorship.getMentorProfile(id),
  });

  const addTestimonial = useMutation({
    mutationFn: () => api.mentorship.addTestimonial({ mentorId: id, quote: quote.trim(), rating }),
    onSuccess: () => {
      setQuote("");
      queryClient.invalidateQueries({ queryKey: ["mentor-profile", id] });
      toast.success("Testimoni terkirim. Terima kasih!");
    },
    onError: (e: Error) => toast.error(e.message || "Masuk dulu untuk menulis testimoni."),
  });

  if (isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-40 rounded-2xl" />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <Card className="glass rounded-2xl border-border/50 p-10 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">Mentor tidak ditemukan.</p>
          <Button asChild className="mt-4">
            <Link to="/mentorship">Kembali ke daftar mentor</Link>
          </Button>
        </Card>
      </PageShell>
    );
  }

  const { mentor, score, matchedOn, stats, sessions, testimonials } = data;
  const avgTestimonial = testimonials.length
    ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
    : mentor.rating;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Profil mentor"
        title={mentor.name}
        description={mentor.role}
        actions={
          <Button asChild>
            <Link to="/request-mentorship">Ajukan mentorship</Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 rounded-full bg-gold-gradient" />
            <div className="min-w-0">
              <div className="text-lg font-semibold">{mentor.name}</div>
              <div className="text-sm text-muted-foreground">{mentor.role}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Stars rating={avgTestimonial} />
                <span>{avgTestimonial.toFixed(1)}</span>
                <span aria-hidden>·</span>
                <span>{mentor.sessions} sesi</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {mentor.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total sesi", value: `${stats.totalSessions}` },
              { label: "Durasi rata-rata", value: `${stats.avgDurationMinutes} mnt` },
              { label: "Mentorship aktif", value: `${stats.activeMentorships}` },
              { label: "Progress rata-rata", value: `${stats.avgProgress}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/40 p-3">
                <div className="text-lg font-semibold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" /> Skor kecocokan
          </div>
          <div className="mt-4 text-3xl font-bold">{score}%</div>
          <Progress value={score} className="mt-3" />
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            {matchedOn.length ? (
              matchedOn.map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" /> Cocok dengan minat “{m}”
                </div>
              ))
            ) : (
              <p>Lengkapi minat & keahlian di profil Anda untuk skor yang lebih akurat.</p>
            )}
          </div>
        </Card>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <h2 className="text-sm font-semibold">Riwayat sesi</h2>
          <div className="mt-4 space-y-3">
            {sessions.length ? (
              sessions.map((s) => (
                <div key={s.id} className="rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-medium">
                    <span className="truncate">{s.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(s.heldAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.durationMinutes ?? 60} menit{s.notes ? ` · ${s.notes}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada sesi tercatat.</p>
            )}
          </div>
        </Card>

        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <h2 className="text-sm font-semibold">Testimoni</h2>
          <div className="mt-4 space-y-3">
            {testimonials.length ? (
              testimonials.map((t) => (
                <figure key={t.id} className="rounded-xl bg-muted/40 p-4">
                  <Quote className="size-4 text-primary" />
                  <blockquote className="mt-2 text-sm">{t.quote}</blockquote>
                  <figcaption className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Stars rating={t.rating} />
                    <span className="truncate">
                      {t.authorName}
                      {t.authorRole ? ` · ${t.authorRole}` : ""}
                    </span>
                  </figcaption>
                </figure>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada testimoni untuk mentor ini.</p>
            )}
          </div>

          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (quote.trim().length < 10) {
                toast.error("Tulis testimoni minimal 10 karakter.");
                return;
              }
              addTestimonial.mutate();
            }}
          >
            <label className="text-xs font-medium" htmlFor="testimonial">
              Tulis testimoni Anda
            </label>
            <Textarea
              id="testimonial"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              placeholder="Bagaimana pengalaman Anda dengan mentor ini?"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" role="group" aria-label="Beri rating">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i} bintang`}
                    onClick={() => setRating(i)}
                    className="p-0.5"
                  >
                    <Star
                      className={`size-4 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </div>
              <Button type="submit" size="sm" className="ml-auto" disabled={addTestimonial.isPending}>
                Kirim testimoni
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}
