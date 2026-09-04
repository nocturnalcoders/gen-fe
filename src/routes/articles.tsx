import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bold, Bookmark, Heart, Image as ImageIcon, Italic, Link2, List, MessageCircle, Quote, Share2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import type { ArticleStatus } from "@/api/types";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
  head: () => ({
    meta: [
      { title: "Articles — Garuda" },
      { name: "description", content: "Publish and read community articles — career, product, immigration, and more." },
      { property: "og:title", content: "Articles — Garuda Empowerment Network" },
      { property: "og:description", content: "Publish and read community articles — career, product, immigration, and more." },
    ],
    links: [{ rel: "canonical", href: "/articles" }],
  }),
});

function ArticlesPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("All");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: () => api.articles.categories(),
  });
  const { data: posts, isLoading } = useQuery({
    queryKey: ["articles", category],
    queryFn: () => api.articles.list({ category: category === "All" ? undefined : category }),
  });
  const { data: drafts } = useQuery({
    queryKey: ["articles", "drafts"],
    queryFn: () => api.articles.listMyDrafts(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["articles"] });

  const save = useMutation({
    mutationFn: (status: ArticleStatus) =>
      api.articles.create({
        title,
        body,
        status,
        category: category === "All" ? "Career" : category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    onSuccess: (_a, status) => {
      setTitle("");
      setBody("");
      setTags("");
      invalidate();
      toast.success(status === "published" ? "Article published" : "Draft saved");
    },
    onError: () => toast.error("Sign in to publish an article"),
  });

  const like = useMutation({
    mutationFn: (id: string) => api.articles.toggleLike(id),
    onSuccess: invalidate,
    onError: () => toast.error("Sign in to like articles"),
  });
  const bookmark = useMutation({
    mutationFn: (id: string) => api.articles.toggleBookmark(id),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.bookmarked ? "Bookmarked" : "Bookmark removed");
    },
    onError: () => toast.error("Sign in to bookmark articles"),
  });

  const tabs = ["All", ...(categories ?? [])];

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
            {tabs.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${c === category ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {isLoading
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)
              : posts?.length
                ? posts.map((p) => (
                    <Card key={p.id} className="glass rounded-2xl border-border/50 p-6 shadow-soft">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{p.category}</Badge>
                        <span className="text-xs text-muted-foreground">{p.readingMinutes} min read</span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-snug hover:text-primary">{p.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gold-gradient" />
                        <span className="text-sm font-medium">{p.authorName}</span>
                        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${p.liked ? "text-primary" : ""}`}
                            aria-label="Like article"
                            onClick={() => like.mutate(p.id)}
                          >
                            <Heart className="size-4" />
                          </Button>
                          <span className="text-xs">{p.likes}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Comments">
                            <MessageCircle className="size-4" />
                          </Button>
                          <span className="text-xs">{p.comments}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${p.bookmarked ? "text-primary" : ""}`}
                            aria-label="Bookmark article"
                            onClick={() => bookmark.mutate(p.id)}
                          >
                            <Bookmark className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Share article">
                            <Share2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                : <p className="text-sm text-muted-foreground">No articles in this category yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="publish">
          <Card className="glass rounded-2xl border-border/50 p-6 shadow-soft">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              aria-label="Article title"
              className="border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            />
            <div className="my-3 flex flex-wrap items-center gap-1 border-y border-border/60 py-2">
              {[Bold, Italic, Quote, List, Link2, ImageIcon].map((I, i) => (
                <Button key={i} variant="ghost" size="icon" className="h-8 w-8" aria-label="Formatting"><I className="size-4" /></Button>
              ))}
              <div className="mx-2 h-5 w-px bg-border" />
              <Badge variant="outline" className="text-[10px]">Draft autosaved</Badge>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your story…"
              aria-label="Article body"
              className="min-h-64 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags (comma separated)"
                aria-label="Tags"
                className="max-w-sm"
              />
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" disabled={!title || save.isPending} onClick={() => save.mutate("draft")}>Save draft</Button>
                <Button disabled={!title || !body || save.isPending} onClick={() => save.mutate("published")}>Publish</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <div className="space-y-3">
            {drafts?.length ? drafts.map((d) => (
              <Card key={d.id} className="glass flex items-center justify-between rounded-2xl border-border/50 p-4 shadow-soft">
                <span className="text-sm">{d.title || "Untitled"}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="ghost">Delete</Button>
                </div>
              </Card>
            )) : <p className="text-sm text-muted-foreground">No drafts yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
