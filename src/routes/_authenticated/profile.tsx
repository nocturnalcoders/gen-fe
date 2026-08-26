import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Briefcase, Calendar, GraduationCap, Loader2, Pencil } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import { api } from "@/api";
import { toast } from "sonner";
import type { Profile as ApiProfile } from "@/api/types";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — Garuda" },
      { name: "description", content: "Your bio, skills, experience, articles, events, mentorship progress, and badges." },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
});

// Local view model keeps the existing snake_case markup working while all
// backend access goes through the adapter-agnostic API layer.
type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  role: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  skills: string[];
  interests: string[];
};

function toViewModel(p: ApiProfile): Profile {
  return {
    display_name: p.displayName,
    avatar_url: p.avatarUrl,
    headline: p.headline,
    role: p.role,
    company: p.company,
    location: p.location,
    bio: p.bio,
    website: p.website,
    linkedin: p.linkedin,
    skills: p.skills,
    interests: p.interests,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfilePage() {
  const { user } = useSession();
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const p = await api.profiles.getMyProfile();
      if (!p) throw new Error("Profile not found");
      return toViewModel(p);
    },
    enabled: !!user,
  });

  const displayName = profile?.display_name || user?.displayName || user?.email?.split("@")[0] || "Member";
  const subheadline = profile?.headline || (profile?.role && profile?.company ? `${profile.role} · ${profile.company}` : profile?.role || profile?.company || "Community member");

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <p className="text-muted-foreground">Could not load your profile.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Card className="glass mb-8 overflow-hidden rounded-3xl border-border/50 p-0 shadow-soft">
        <div className="h-32 bg-hero-gradient sm:h-40" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 grid grid-cols-[auto_1fr] items-end gap-4 sm:flex sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="size-20 shrink-0 rounded-2xl ring-4 ring-background shadow-soft sm:size-24">
                <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-gold-gradient text-gold-foreground text-xl font-semibold rounded-2xl">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{displayName}</h1>
                <div className="text-sm text-muted-foreground">
                  {subheadline}
                  {profile.location && ` · ${profile.location}`}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Share</Button>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Pencil className="mr-2 size-4" />
                    Edit profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <EditProfileForm profile={profile} onSaved={() => { refetch(); setEditOpen(false); }} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm text-foreground/90">
            {profile.bio || "Tell the community who you are by editing your profile."}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(profile.skills || []).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
            ))}
            {(profile.interests || []).map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            ))}
          </div>
          {(profile.website || profile.linkedin) && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                  Website
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="glass mb-6 rounded-full p-1">
          <TabsTrigger value="about" className="rounded-full px-4">About</TabsTrigger>
          <TabsTrigger value="articles" className="rounded-full px-4">Articles</TabsTrigger>
          <TabsTrigger value="events" className="rounded-full px-4">Events</TabsTrigger>
          <TabsTrigger value="mentorship" className="rounded-full px-4">Mentorship</TabsTrigger>
          <TabsTrigger value="badges" className="rounded-full px-4">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="grid gap-6 lg:grid-cols-2">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Briefcase className="size-4 text-primary" /> Experience</div>
            <ul className="space-y-4 text-sm">
              <li><div className="font-medium">Senior Product Designer · Tokopedia</div><div className="text-xs text-muted-foreground">2022 — Present</div></li>
              <li><div className="font-medium">Product Designer · Traveloka</div><div className="text-xs text-muted-foreground">2019 — 2022</div></li>
              <li><div className="font-medium">UX Designer · Bukalapak</div><div className="text-xs text-muted-foreground">2017 — 2019</div></li>
            </ul>
          </Card>
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Award className="size-4 text-primary" /> Highlights</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· 12 articles published</li>
              <li>· 27 events joined</li>
              <li>· 4 active mentees</li>
              <li>· Community streak: 14 days</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-3">
          {["On finding your first mentor", "Design systems for small teams", "What I learned mentoring across time zones"].map((t) => (
            <Card key={t} className="glass rounded-2xl border-border/50 p-5 shadow-soft">
              <div className="font-medium">{t}</div>
              <div className="mt-1 text-xs text-muted-foreground">Published · 84 likes · 12 comments</div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="grid gap-3 sm:grid-cols-2">
          {["Founders Roundtable — Jakarta", "Diaspora Berlin Weekend", "GarudaHacks 2025", "Sunrise Hike — Tangkuban"].map((e) => (
            <Card key={e} className="glass flex items-center gap-3 rounded-2xl border-border/50 p-4 shadow-soft">
              <Calendar className="size-4 text-primary" />
              <span className="text-sm">{e}</span>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentorship">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><GraduationCap className="size-4 text-primary" /> Mentorship progress</div>
            <div className="space-y-4">
              {[ ["Land Tech Lead role", 62], ["Publish 3 articles", 33], ["Complete design system course", 80] ].map(([g, p]) => (
                <div key={g as string}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span>{g}</span><span className="font-medium">{p}%</span></div>
                  <Progress value={p as number} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {["First Article", "10 Connections", "Event Host", "Mentor", "Chapter Lead", "100 Likes", "Bootcamp Grad", "1-Year Member"].map((b) => (
              <Card key={b} className="glass flex flex-col items-center rounded-2xl border-border/50 p-5 text-center shadow-soft">
                <div className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-gold-gradient text-gold-foreground shadow-soft">
                  <Award className="size-6" />
                </div>
                <div className="text-sm font-semibold">{b}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function EditProfileForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    display_name: profile.display_name || "",
    headline: profile.headline || "",
    role: profile.role || "",
    company: profile.company || "",
    location: profile.location || "",
    bio: profile.bio || "",
    website: profile.website || "",
    linkedin: profile.linkedin || "",
    skills: (profile.skills || []).join(", "),
    interests: (profile.interests || []).join(", "),
  });

  useEffect(() => {
    setForm({
      display_name: profile.display_name || "",
      headline: profile.headline || "",
      role: profile.role || "",
      company: profile.company || "",
      location: profile.location || "",
      bio: profile.bio || "",
      website: profile.website || "",
      linkedin: profile.linkedin || "",
      skills: (profile.skills || []).join(", "),
      interests: (profile.interests || []).join(", "),
    });
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);

    const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const interests = form.interests.split(",").map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name.trim(),
      headline: form.headline.trim(),
      role: form.role.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      website: form.website.trim() || null,
      linkedin: form.linkedin.trim() || null,
      skills,
      interests,
    }).eq("id", user.id);

    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
      onSaved();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your public profile so the community can find and connect with you.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" placeholder="e.g. Product Designer at Tokopedia" value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" placeholder="e.g. Product Designer" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="e.g. Tokopedia" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="e.g. Jakarta 🇮🇩" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" placeholder="https://your-site.com" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/you" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell us about yourself…" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input id="skills" placeholder="e.g. Product Design, UX Research, Figma" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interests">Interests (comma separated)</Label>
          <Input id="interests" placeholder="e.g. Hiking, Coffee, Mentoring" value={form.interests} onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}
