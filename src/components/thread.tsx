import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/api";
import type { TargetType } from "@/api/types";
import { useSession } from "@/hooks/use-session";

export function Thread({
  targetType,
  targetId,
}: {
  targetType: TargetType;
  targetId: string;
}) {
  const { user } = useSession();
  const qc = useQueryClient();
  const key = ["thread", targetType, targetId];
  const { data: messages = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => api.threads.list({ targetType, targetId }),
  });
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    return api.threads.subscribe({ targetType, targetId }, () => {
      qc.invalidateQueries({ queryKey: ["thread", targetType, targetId] });
    });
  }, [targetType, targetId, qc]);

  async function send() {
    if (!user || !body.trim()) return;
    setSending(true);
    try {
      await api.threads.post({ targetType, targetId, body: body.trim() });
      setBody("");
      qc.invalidateQueries({ queryKey: key });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.threads.remove(id);
      qc.invalidateQueries({ queryKey: key });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete message");
    }
  }

  return (
    <Card className="glass rounded-2xl border-border/50 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Discussion</h2>
        <span className="text-xs text-muted-foreground">{messages.length} messages</span>
      </div>

      <div className="mb-4 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <div className="size-8 shrink-0 rounded-full bg-gold-gradient" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{m.authorName ?? "Member"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                  </span>
                  {user?.id === m.userId && (
                    <button
                      onClick={() => remove(m.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      aria-label="Delete message"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {user ? (
        <div className="flex items-end gap-2 border-t border-border/60 pt-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            rows={2}
            className="resize-none"
          />
          <Button onClick={send} disabled={sending || !body.trim()} size="icon" aria-label="Send">
            <Send className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to join the conversation.
        </div>
      )}
    </Card>
  );
}
