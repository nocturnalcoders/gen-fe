import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  Calendar,
  GraduationCap,
  Heart,
  MessageCircle,
  Settings2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { api } from "@/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Garuda" },
      {
        name: "description",
        content:
          "Your personalized community feed based on your interests, recommended mentors, upcoming events, and mentorship progress.",
      },
      { property: "og:title", content: "Dashboard — Garuda" },
      {
        property: "og:description",
        content: "A feed tuned to your interests, plus mentor matches and community updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 6e4);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const sourceLabels: Record<string, string> = {
  community: "Community",
  mentorship: "Mentorship",
  activity: "ActiveGen",
  event: "Event",
  article: "Article",
};

function Dashboard() {
  const { user } = useSession();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "there";
  const [onlyMatches, setOnlyMatches] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => api.profiles.getMyProfile(),
  });

  const interests = profileQuery.data?.interests ?? [];
  const skills = profileQuery.data?.skills ?? [];
  const personalization = useMemo(() => ({ interests, skills }), [interests.join(","), skills.join(",")]);
  const hasPersonalization = interests.length > 0 || skills.length > 0;

  const feedQuery = useQuery({
    queryKey: ["dashboard", "feed", personalization],
    queryFn: () => api.dashboard.feed(personalization),
    enabled: !profileQuery.isLoading,
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", personalization],
    queryFn: () => api.dashboard.summary(personalization),
    enabled: !profileQuery.isLoading,
  });

  const tokens = useMemo(
    () => [...interests, ...skills].map((t) => t.toLowerCase().trim()).filter(Boolean),
    [personalization],
  );

  const matchesFor = (topics: string[]) =>
    topics.filter((t) =>
      tokens.some((w) => t.toLowerCase().includes(w) || w.includes(t.toLowerCase())),
    );

  const posts = feedQuery.data ?? [];
  const visiblePosts = onlyMatches ? posts.filter((p) => matchesFor(p.topics).length > 0) : posts;
  const summary = summaryQuery.data;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Welcome back"
        title={`Selamat datang, ${displayName} 👋`}
        description={
          hasPersonalization
            ? "Your feed, mentors, and updates are tuned to your interests and skills."
            : "Add interests and skills to your profile to personalize this feed."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/profile">
                <Settings2 className="mr-2 size-4" /> Tune interests
              </Link>
            </Button>
            <Button asChild>
              <Link to="/articles">Write an article</Link>
            </Button>
          </div>
        }
      />

      {hasPersonalization && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Personalized for:</span>
          {[...interests, ...skills].slice(0, 8).map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full">
              {t}
            </Badge>
          ))}
          <Button
            size="sm"
            variant={onlyMatches ? "default" : "ghost"}
            className="ml-auto h-7 rounded-full text-xs"
            onClick={() => setOnlyMatches((v) => !v)}
          >
            {onlyMatches ? "Showing matches only" : "Show matches only"}
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {summaryQuery.isLoading
              ? [0, 1, 2].map((i) => (
                  <Card key={i} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="mt-2 h-7 w-16" />
                  </Card>
                ))
              : (summary?.stats ?? []).slice(0, 3).map((s, i) => {
                  const Icon = [Sparkles, TrendingUp, Bookmark][i] ?? Sparkles;
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

          <div>
            <h2 className="mb-3 text-lg font-semibold">Your feed</h2>
            <div className="space-y-4">
              {feedQuery.isLoading &&
                [0, 1, 2].map((i) => (
                  <Card key={i} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </Card>
                ))}

              {!feedQuery.isLoading && visiblePosts.length === 0 && (
                <Card className="glass rounded-2xl border-border/50 p-6 text-center shadow-soft">
                  <p className="text-sm text-muted-foreground">
                    Nothing matches your interests yet. Try turning off the filter or adding more
                    interests to your profile.
                  </p>
                </Card>
              )}

              {visiblePosts.map((p) => {
                const matched = matchesFor(p.topics);
                return (
                  <Card key={p.id} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gold-gradient" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{p.authorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(p.createdAt)} ago · {sourceLabels[p.source] ?? p.source}
                        </div>
                      </div>
                      {matched.length > 0 && (
                        <Badge className="ml-auto rounded-full" variant="secondary">
                          Matches {matched[0]}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-foreground/90">{p.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="size-4" /> {p.likes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="size-4" /> {p.comments}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="size-4 text-primary" /> Upcoming events
            </div>
            <ul className="space-y-3 text-sm">
              {(summary?.upcomingEvents ?? []).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {e.title} · {formatDate(e.date)}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link to="/events">RSVP</Link>
                  </Button>
                </li>
              ))}
              {summaryQuery.isLoading && <Skeleton className="h-4 w-full" />}
            </ul>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <GraduationCap className="size-4 text-primary" /> Active mentorship
            </div>
            {summary?.activeMentorship ? (
              <div className="text-sm">
                <div className="font-medium">with {summary.activeMentorship.mentorName}</div>
                <div className="text-xs text-muted-foreground">
                  Goal: {summary.activeMentorship.goal}
                </div>
                <Progress value={summary.activeMentorship.progress} className="mt-3" />
                <div className="mt-2 text-xs text-muted-foreground">
                  {summary.activeMentorship.progress}% · Next session{" "}
                  {formatDate(summary.activeMentorship.nextSession)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active mentorship yet — <Link to="/mentorship" className="text-primary">find a mentor</Link>.
              </p>
            )}
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-3 text-sm font-semibold">Recommended mentors</div>
            <ul className="space-y-3">
              {(summary?.recommendedMentors ?? []).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gold-gradient" />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="truncate font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.role}</div>
                    {m.matchedOn.length > 0 && (
                      <div className="truncate text-[11px] text-primary">
                        Match: {m.matchedOn.join(", ")}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                    <Link to="/mentorship">Connect</Link>
                  </Button>
                </li>
              ))}
              {summaryQuery.isLoading && <Skeleton className="h-9 w-full" />}
            </ul>
          </Card>

          <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
            <div className="mb-2 text-sm font-semibold">Community updates</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {(summary?.communityUpdates ?? []).map((u) => (
                <li key={u.id}>
                  · {u.text}
                  {u.topic && tokens.some((t) => u.topic!.toLowerCase().includes(t)) && (
                    <span className="ml-1 text-primary">(for you)</span>
                  )}
                </li>
              ))}
            </ul>
            <Badge variant="secondary" className="mt-3">
              Weekly digest
            </Badge>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
