import { createFileRoute } from "@tanstack/react-router";
import { AtSign, Bell, Calendar, GraduationCap, Heart, MessageCircle } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const notifs = [
  { icon: Heart, text: "Ayu liked your article 'Blue Card in Germany'", time: "2m", unread: true },
  { icon: MessageCircle, text: "Farhan replied to your comment on Founders Roundtable", time: "18m", unread: true },
  { icon: GraduationCap, text: "Prasetyo confirmed your mentorship session on Thursday", time: "1h", unread: true },
  { icon: AtSign, text: "You were mentioned in Diaspora Berlin discussion", time: "3h", unread: false },
  { icon: Calendar, text: "Reminder: Sunrise Hike starts in 12 hours", time: "6h", unread: false },
  { icon: Bell, text: "3 new mentors match your interests", time: "1d", unread: false },
];

function NotificationsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Notifications"
        title="What you missed"
        description="Stay on top of your community activity."
        actions={<Button variant="outline">Mark all as read</Button>}
      />

      <Card className="glass rounded-2xl border-border/50 shadow-soft">
        <ul className="divide-y divide-border/60">
          {notifs.map((n, i) => (
            <li key={i} className="flex items-start gap-4 p-5">
              <div className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${n.unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <n.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm">{n.text}</div>
                <div className="mt-1 text-xs text-muted-foreground">{n.time} ago</div>
              </div>
              {n.unread && <Badge className="bg-primary text-primary-foreground">New</Badge>}
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}