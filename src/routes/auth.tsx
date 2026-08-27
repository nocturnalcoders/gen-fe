import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/api";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Garuda" },
      { name: "description", content: "Sign in or join the Garuda Empowerment Network." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dest = () => (redirect && redirect.startsWith("/") ? redirect : "/dashboard");
    const unsubscribe = api.auth.onAuthStateChange((session) => {
      if (session) navigate({ to: dest() });
    });
    api.auth.getSession().then((session) => {
      if (session) navigate({ to: dest() });
    });
    return unsubscribe;
  }, [navigate, redirect]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.auth.signInWithPassword({ email, password });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { needsEmailConfirmation } = await api.auth.signUpWithPassword({
        email,
        password,
        fullName: name,
      });
      if (needsEmailConfirmation) toast.success("Check your email to confirm your account.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    try {
      await api.auth.signInWithGoogle();
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-10">
        <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold">Welcome to Garuda</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join activities, register for events, and jump into the conversation.
            </p>
          </div>

          <Button variant="outline" className="w-full" onClick={signInGoogle}>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border/60" /> or <div className="h-px flex-1 bg-border/60" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="glass w-full rounded-full p-1">
              <TabsTrigger value="signin" className="flex-1 rounded-full">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 rounded-full">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5">
              <form onSubmit={signIn} className="space-y-3">
                <div>
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={signUp} className="space-y-3">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageShell>
  );
}