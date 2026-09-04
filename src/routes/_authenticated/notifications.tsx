import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, Bell, Calendar, GraduationCap, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import type { NotificationKind } from "@/api/types";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [
      { title: "Notifications — Garuda" },
      { name: "description", content: "Mentions, replies, mentorship updates, and event reminders." },
    ],
    links: [{ rel: "canonical", href: "/notifications" }],
  }),
});

const icons: Record<NotificationKind, typeof Bell> = {
  like: Heart,
  reply: MessageCircle,
  mentorship: GraduationCap,
  mention: AtSign,
  event: Calendar,
  system: Bell,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifs, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(),
  });

  const markAll = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All caught up");
    },
  });

  const markOne = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Notifications"
        title="What you missed"
        description="Stay on top of your community activity."
        actions={
          <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            Mark all as read
          </Button>
        }
      />

      <Card className="glass rounded-2xl border-border/50 shadow-soft">
        {isLoading ? (
          <div className="space-y-4 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : !notifs?.length ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nothing new right now.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {notifs.map((n) => {
              const Icon = icons[n.kind] ?? Bell;
              const unread = !n.read;
              return (
                <li key={n.id} className="flex items-start gap-4 p-5">
                  <div
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{n.text}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)} ago</div>
                  </div>
                  {unread && (
                    <button onClick={() => markOne.mutate(n.id)} aria-label="Mark as read">
                      <Badge className="bg-primary text-primary-foreground">New</Badge>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
