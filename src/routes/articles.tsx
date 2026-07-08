import { createFileRoute } from "@tanstack/react-router";
import { Bold, Bookmark, Heart, Image as ImageIcon, Italic, Link2, List, MessageCircle, Quote, Share2 } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
  head: () => ({
    meta: [
      { title: "Articles — Garuda" },
      { name: "description", content: "Publish and read community articles — career, product, immigration, and more." },
    ],
    links: [{ rel: "canonical", href: "/articles" }],
  }),
});

const categories = ["All", "Career", "Product", "Engineering", "Immigration", "Founder", "Life"];

const posts = [
  { tag: "Career", title: "How I negotiated a 40% raise as an engineer in Singapore", excerpt: "The exact prep, the exact scripts, and the mistakes I made before it worked.", author: "Farhan A.", read: "6 min", likes: 214, comments: 32 },
  { tag: "Immigration", title: "Blue Card in Germany: the honest 2026 guide", excerpt: "Timelines, salary thresholds, and what nobody tells you about the appointment.", author: "Nadia W.", read: "9 min", likes: 402, comments: 74 },
  { tag: "Founder", title: "Bootstrapping a SaaS from a kost in Yogyakarta", excerpt: "Year one revenue, tools I used, and the emotional rollercoaster nobody warns about.", author: "Bagas S.", read: "7 min", likes: 189, comments: 22 },
  { tag: "Engineering", title: "System design interviews for Indonesian engineers going global", excerpt: "A framework I used to land offers at Meta, Grab, and Airbnb.", author: "Yoga P.", read: "12 min", likes: 356, comments: 41 },
];

function ArticlesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Community writing"
        title="Articles"
        description="Long-form stories, lessons, and guides from the community — for the community."
      />

      <Tabs defaultValue="read" className="space-y-6">
        <TabsList className="glass rounded-full p-1">
          <TabsTrigger value="read" className="rounded-full px-4">Read</TabsTrigger>
          <TabsTrigger value="publish" className="rounded-full px-4">Publish</TabsTrigger>
          <TabsTrigger value="drafts" className="rounded-full px-4">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <button key={c} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${i === 0 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((p) => (
              <Card key={p.title} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.tag}</Badge>
                  <span className="text-xs text-muted-foreground">{p.read} read</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-snug hover:text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gold-gradient" />
                  <div className="text-sm font-medium">{p.author}</div>
                  <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> {p.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" /> {p.comments}</span>
                    <button aria-label="Bookmark" className="hover:text-primary"><Bookmark className="size-3.5" /></button>
                    <button aria-label="Share" className="hover:text-primary"><Share2 className="size-3.5" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="publish">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <Input placeholder="Article title" className="border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0" />
            <div className="my-3 flex flex-wrap items-center gap-1 border-y border-border/60 py-2">
              {[Bold, Italic, Quote, List, Link2, ImageIcon].map((I, i) => (
                <Button key={i} variant="ghost" size="icon" className="h-8 w-8"><I className="size-4" /></Button>
              ))}
              <div className="mx-2 h-5 w-px bg-border" />
              <Badge variant="outline" className="text-[10px]">Draft autosaved</Badge>
            </div>
            <Textarea placeholder="Write your story…" className="min-h-64 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <Input placeholder="Add tags (comma separated)" className="max-w-sm" />
              <div className="ml-auto flex gap-2">
                <Button variant="ghost">Save draft</Button>
                <Button>Publish</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <div className="space-y-3">
            {["Untitled — started 2h ago", "Notes from Berlin gathering", "On finding your first mentor"].map((d) => (
              <Card key={d} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
                <span className="text-sm">{d}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="ghost">Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}