// Temporary in-memory adapter for modules that do not have a backend yet.
// The shapes match src/api/types.ts exactly, so swapping in the cloud or rest
// implementation later requires no UI changes.

import type {
  AdminAnalytics,
  AdminApi,
  AdminEventRow,
  AdminMemberRow,
  AdminReport,
  AdminStats,
  AppNotification,
  Article,
  ArticleComment,
  ArticlesApi,
  Chapter,
  DashboardApi,
  DashboardSummary,
  DiasporaApi,
  FeedPost,
  Gathering,
  Goal,
  Guide,
  Member,
  MembersApi,
  Mentor,
  MentorshipRequestStatus,
  AdminMemberDetail,
  AdminMentorshipRecord,
  MentorMatchSignal,
  RecommendedMentor,
  MentorshipApi,
  MentorshipRequest,
  MentorshipSession,
  ModerationItem,
  NotificationsApi,
} from "../../types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const members: Member[] = [
  { id: "m1", name: "Ayu Pratiwi", role: "Tech Lead", company: "Gojek", country: "🇮🇩 Jakarta", avatarUrl: null, linkedin: null, skills: ["Backend", "Go", "K8s"], interests: ["Hiking"] },
  { id: "m2", name: "Rendy Sinaga", role: "Product Designer", company: "Booking.com", country: "🇳🇱 Amsterdam", avatarUrl: null, linkedin: null, skills: ["UX", "Figma"], interests: ["Coffee", "Photography"] },
  { id: "m3", name: "Yoga Pradana", role: "Staff Engineer", company: "Meta", country: "🇺🇸 SF", avatarUrl: null, linkedin: null, skills: ["System Design"], interests: ["Running"] },
  { id: "m4", name: "Kirana W.", role: "Founder", company: "Rasa Studio", country: "🇮🇩 Bandung", avatarUrl: null, linkedin: null, skills: ["Brand", "Content"], interests: ["Hiking", "Coffee"] },
  { id: "m5", name: "Farhan Aditya", role: "Senior Engineer", company: "Grab", country: "🇸🇬 Singapore", avatarUrl: null, linkedin: null, skills: ["Frontend", "React"], interests: ["Football"] },
  { id: "m6", name: "Nadia Wibowo", role: "Immigration Consultant", company: "Independent", country: "🇩🇪 Berlin", avatarUrl: null, linkedin: null, skills: ["EU Visa"], interests: ["Cooking"] },
];

const mentors: Mentor[] = [
  { id: "mt1", name: "Prasetyo H.", role: "Eng Manager · Airbnb", tags: ["Leadership", "Relocation"], sessions: 128, rating: 4.9, avatarUrl: null },
  { id: "mt2", name: "Sinta Larasati", role: "Senior PM · Grab", tags: ["Product", "Career"], sessions: 84, rating: 4.8, avatarUrl: null },
  { id: "mt3", name: "Yoga Pradana", role: "Staff Eng · Meta", tags: ["System Design"], sessions: 210, rating: 5.0, avatarUrl: null },
  { id: "mt4", name: "Dewi Ratna", role: "Design Lead · Tokopedia", tags: ["UX", "Portfolio"], sessions: 66, rating: 4.7, avatarUrl: null },
  { id: "mt5", name: "Bagas Setya", role: "Founder · Rasa", tags: ["Startup", "Fundraising"], sessions: 41, rating: 4.8, avatarUrl: null },
  { id: "mt6", name: "Nadia Wibowo", role: "Immigration Consultant", tags: ["Visa", "EU"], sessions: 55, rating: 4.9, avatarUrl: null },
];

const requests: MentorshipRequest[] = [
  {
    id: "mr1",
    mentorId: "mt1",
    mentorName: "Prasetyo H.",
    menteeId: "me",
    status: "accepted",
    message: "Looking for guidance on moving into engineering management.",
    nextSessionAt: new Date(Date.now() + 3 * 864e5).toISOString(),
    progress: 60,
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
  },
];

const sessions: MentorshipSession[] = [
  { id: "ms1", requestId: "mr1", title: "Goal setting & 90-day plan", heldAt: new Date(Date.now() - 21 * 864e5).toISOString(), notes: "Defined three focus areas." },
  { id: "ms2", requestId: "mr1", title: "Leading without authority", heldAt: new Date(Date.now() - 7 * 864e5).toISOString(), notes: "Practiced stakeholder scenarios." },
];

const goals: Goal[] = [
  { id: "g1", title: "Land a senior role abroad", progress: 65 },
  { id: "g2", title: "Publish 3 community articles", progress: 33 },
  { id: "g3", title: "Grow network to 200 members", progress: 48 },
];

const articleSeeds = [
  { category: "Career", title: "How I negotiated a 40% raise as an engineer in Singapore", excerpt: "The exact prep, the exact scripts, and the mistakes I made before it worked.", authorName: "Farhan A.", readingMinutes: 6, likes: 214, comments: 32 },
  { category: "Immigration", title: "Blue Card in Germany: the honest 2026 guide", excerpt: "Timelines, salary thresholds, and what nobody tells you about the appointment.", authorName: "Nadia W.", readingMinutes: 9, likes: 402, comments: 74 },
  { category: "Founder", title: "Bootstrapping a SaaS from a kost in Yogyakarta", excerpt: "Year one revenue, tools I used, and the emotional rollercoaster nobody warns about.", authorName: "Bagas S.", readingMinutes: 7, likes: 189, comments: 22 },
  { category: "Engineering", title: "System design interviews for Indonesian engineers going global", excerpt: "A framework I used to land offers at Meta, Grab, and Airbnb.", authorName: "Yoga P.", readingMinutes: 12, likes: 356, comments: 41 },
];

const articles: Article[] = articleSeeds.map((a, i) => ({
  id: `a${i + 1}`,
  slug: slugify(a.title),
  title: a.title,
  excerpt: a.excerpt,
  body: `${a.excerpt}\n\nFull article coming from the API.`,
  category: a.category,
  tags: [a.category.toLowerCase()],
  authorId: null,
  authorName: a.authorName,
  readingMinutes: a.readingMinutes,
  likes: a.likes,
  comments: a.comments,
  status: "published",
  liked: false,
  bookmarked: false,
  createdAt: new Date(Date.now() - (i + 1) * 3 * 864e5).toISOString(),
}));

const comments: ArticleComment[] = [];

const chapters: Chapter[] = [
  { slug: "netherlands", flag: "🇳🇱", country: "Netherlands", city: "Amsterdam", members: 480, joined: false },
  { slug: "germany", flag: "🇩🇪", country: "Germany", city: "Berlin", members: 320, joined: false },
  { slug: "japan", flag: "🇯🇵", country: "Japan", city: "Tokyo", members: 610, joined: false },
  { slug: "united-states", flag: "🇺🇸", country: "United States", city: "San Francisco", members: 540, joined: false },
  { slug: "australia", flag: "🇦🇺", country: "Australia", city: "Melbourne", members: 390, joined: false },
  { slug: "singapore", flag: "🇸🇬", country: "Singapore", city: "Singapore", members: 1120, joined: false },
  { slug: "united-kingdom", flag: "🇬🇧", country: "United Kingdom", city: "London", members: 280, joined: false },
  { slug: "uae", flag: "🇦🇪", country: "UAE", city: "Dubai", members: 165, joined: false },
];

const gatherings: Gathering[] = [
  { id: "gt1", chapterSlug: "germany", title: "Berlin Nasi Goreng Night", date: new Date(Date.now() + 6 * 864e5).toISOString() },
  { id: "gt2", chapterSlug: "japan", title: "Tokyo Career Sharing Circle", date: new Date(Date.now() + 12 * 864e5).toISOString() },
  { id: "gt3", chapterSlug: "singapore", title: "Singapore Weekend Badminton", date: new Date(Date.now() + 4 * 864e5).toISOString() },
];

const guides: Guide[] = [
  { id: "gd1", kind: "career", title: "Getting your first tech role in the EU", author: "Rendy S." },
  { id: "gd2", kind: "career", title: "Salary benchmarks for Indonesians abroad", author: "Ayu P." },
  { id: "gd3", kind: "immigration", title: "Visa checklist: Netherlands highly skilled migrant", author: "Nadia W." },
  { id: "gd4", kind: "immigration", title: "Bringing family along: what to prepare", author: "Nadia W." },
];

const notifications: AppNotification[] = [
  { id: "n1", kind: "like", text: "Ayu liked your article 'Blue Card in Germany'", createdAt: new Date(Date.now() - 2 * 6e4).toISOString(), read: false },
  { id: "n2", kind: "reply", text: "Farhan replied to your comment on Founders Roundtable", createdAt: new Date(Date.now() - 18 * 6e4).toISOString(), read: false },
  { id: "n3", kind: "mentorship", text: "Prasetyo confirmed your mentorship session on Thursday", createdAt: new Date(Date.now() - 36e5).toISOString(), read: false },
  { id: "n4", kind: "mention", text: "You were mentioned in Diaspora Berlin discussion", createdAt: new Date(Date.now() - 3 * 36e5).toISOString(), read: true },
  { id: "n5", kind: "event", text: "Reminder: Sunrise Hike starts in 12 hours", createdAt: new Date(Date.now() - 6 * 36e5).toISOString(), read: true },
];

const feed: FeedPost[] = [
  { id: "f1", authorName: "Ayu Pratiwi", authorAvatarUrl: null, createdAt: new Date(Date.now() - 45 * 6e4).toISOString(), body: "Just wrapped a mentorship session on system design — sharing my notes in the articles section soon!", likes: 42, comments: 8, topics: ["System Design", "Mentorship", "Engineering"], source: "mentorship" },
  { id: "f2", authorName: "Rendy Sinaga", authorAvatarUrl: null, createdAt: new Date(Date.now() - 5 * 36e5).toISOString(), body: "Amsterdam chapter coffee meetup was packed. Next one in two weeks — bring a friend.", likes: 67, comments: 12, topics: ["Coffee", "Netherlands", "Diaspora"], source: "community" },
  { id: "f3", authorName: "Farhan Aditya", authorAvatarUrl: null, createdAt: new Date(Date.now() - 26 * 36e5).toISOString(), body: "Looking for a running buddy in Singapore for weekend 10Ks. Anyone in?", likes: 23, comments: 15, topics: ["Running", "Singapore", "ActiveGen"], source: "activity" },
  { id: "f4", authorName: "Nadia Wibowo", authorAvatarUrl: null, createdAt: new Date(Date.now() - 9 * 36e5).toISOString(), body: "Updated the Blue Card guide with the 2026 salary thresholds. Questions welcome.", likes: 128, comments: 34, topics: ["Immigration", "EU Visa", "Germany"], source: "article" },
  { id: "f5", authorName: "Kirana W.", authorAvatarUrl: null, createdAt: new Date(Date.now() - 34 * 36e5).toISOString(), body: "Sunrise hike at Tangkuban Perahu this Sunday — 12 spots left.", likes: 91, comments: 8, topics: ["Hiking", "ActiveGen", "Bandung"], source: "activity" },
  { id: "f6", authorName: "Bagas Setya", authorAvatarUrl: null, createdAt: new Date(Date.now() - 50 * 36e5).toISOString(), body: "Founders roundtable next Friday: pricing, fundraising, and hiring your first PM.", likes: 74, comments: 19, topics: ["Startup", "Fundraising", "Founder"], source: "event" },
  { id: "f7", authorName: "Sinta Larasati", authorAvatarUrl: null, createdAt: new Date(Date.now() - 70 * 36e5).toISOString(), body: "Product interview prep group is open again — 6 seats, 4 weeks, free for members.", likes: 58, comments: 11, topics: ["Product", "Career", "Mentorship"], source: "community" },
];


export const mockMembers: MembersApi = {
  list: async (query) => {
    const q = query?.q?.toLowerCase().trim();
    return members.filter((m) => {
      if (q && ![m.name, m.role, m.company, m.country].join(" ").toLowerCase().includes(q)) return false;
      if (query?.skill && !m.skills.includes(query.skill)) return false;
      if (query?.interest && !m.interests.includes(query.interest)) return false;
      if (query?.company && m.company !== query.company) return false;
      if (query?.country && m.country !== query.country) return false;
      return true;
    });
  },
  get: async (id) => members.find((m) => m.id === id) ?? null,
};

export const mockMentorship: MentorshipApi = {
  listMentors: async (query) => {
    const q = query?.q?.toLowerCase().trim();
    if (!q) return mentors;
    return mentors.filter((m) => [m.name, m.role, ...m.tags].join(" ").toLowerCase().includes(q));
  },
  getMentor: async (id) => mentors.find((m) => m.id === id) ?? null,
  listRequests: async () => requests,
  createRequest: async ({ mentorId, message }) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    const created: MentorshipRequest = {
      id: `mr${requests.length + 1}`,
      mentorId,
      mentorName: mentor?.name ?? "Mentor",
      menteeId: "me",
      status: "pending",
      message,
      nextSessionAt: null,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    requests.unshift(created);
    return created;
  },
  listSessions: async () => sessions,
  listGoals: async () => goals,
};

export const mockArticles: ArticlesApi = {
  list: async (query) => {
    const q = query?.q?.toLowerCase().trim();
    return articles.filter((a) => {
      if (a.status !== "published") return false;
      if (query?.category && query.category !== "All" && a.category !== query.category) return false;
      if (q && ![a.title, a.excerpt, a.authorName].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  },
  get: async (slug) => articles.find((a) => a.slug === slug) ?? null,
  listMyDrafts: async () => articles.filter((a) => a.status === "draft"),
  create: async (input) => {
    const created: Article = {
      id: `a${articles.length + 1}`,
      slug: slugify(input.title),
      title: input.title,
      excerpt: input.excerpt ?? input.body.slice(0, 140),
      body: input.body,
      category: input.category ?? "Life",
      tags: input.tags ?? [],
      authorId: null,
      authorName: "You",
      readingMinutes: Math.max(1, Math.round(input.body.split(/\s+/).length / 200)),
      likes: 0,
      comments: 0,
      status: input.status,
      liked: false,
      bookmarked: false,
      createdAt: new Date().toISOString(),
    };
    articles.unshift(created);
    return created;
  },
  toggleLike: async (id) => {
    const a = articles.find((x) => x.id === id);
    if (!a) return { liked: false, likes: 0 };
    a.liked = !a.liked;
    a.likes += a.liked ? 1 : -1;
    return { liked: a.liked, likes: a.likes };
  },
  toggleBookmark: async (id) => {
    const a = articles.find((x) => x.id === id);
    if (!a) return { bookmarked: false };
    a.bookmarked = !a.bookmarked;
    return { bookmarked: a.bookmarked };
  },
  listComments: async (id) => comments.filter((c) => c.articleId === id),
  addComment: async ({ id, body }) => {
    const created: ArticleComment = {
      id: `c${comments.length + 1}`,
      articleId: id,
      authorName: "You",
      body,
      createdAt: new Date().toISOString(),
    };
    comments.push(created);
    const a = articles.find((x) => x.id === id);
    if (a) a.comments += 1;
    return created;
  },
  categories: async () => ["All", "Career", "Product", "Engineering", "Immigration", "Founder", "Life"],
};

export const mockDiaspora: DiasporaApi = {
  listChapters: async () => chapters,
  toggleJoinChapter: async (slug) => {
    const c = chapters.find((x) => x.slug === slug);
    if (!c) return { joined: false };
    c.joined = !c.joined;
    c.members += c.joined ? 1 : -1;
    return { joined: c.joined };
  },
  listGatherings: async (slug) => (slug ? gatherings.filter((g) => g.chapterSlug === slug) : gatherings),
  listGuides: async () => guides,
};

export const mockNotifications: NotificationsApi = {
  list: async () => notifications,
  unreadCount: async () => notifications.filter((n) => !n.read).length,
  markRead: async (id) => {
    const n = notifications.find((x) => x.id === id);
    if (n) n.read = true;
  },
  markAllRead: async () => {
    notifications.forEach((n) => (n.read = true));
  },
};

const summary: DashboardSummary = {
  stats: [
    { label: "Events joined", value: "12" },
    { label: "Articles published", value: "4" },
    { label: "Mentorship sessions", value: "9" },
    { label: "Connections", value: "148" },
  ],
  upcomingEvents: [
    { id: "e1", title: "Product Management Bootcamp", date: new Date(Date.now() + 5 * 864e5).toISOString() },
    { id: "e2", title: "Diaspora Founders Roundtable", date: new Date(Date.now() + 9 * 864e5).toISOString() },
  ],
  activeMentorship: {
    mentorName: "Prasetyo H.",
    goal: "Move into engineering management",
    progress: 60,
    nextSession: new Date(Date.now() + 3 * 864e5).toISOString(),
  },
  recommendedMentors: [],
  communityUpdates: [
    { id: "cu1", text: "Singapore chapter passed 1,100 members", topic: "Singapore" },
    { id: "cu2", text: "New immigration guide published for the Netherlands", topic: "Immigration" },
    { id: "cu3", text: "ActiveGen added 6 new activities this week", topic: "ActiveGen" },
    { id: "cu4", text: "3 new product mentors joined this week", topic: "Product" },
    { id: "cu5", text: "Hiking group opened a monthly sunrise series", topic: "Hiking" },
    { id: "cu6", text: "System design study circle restarts on Monday", topic: "System Design" },
  ],
};

function normalize(values: (string | null | undefined)[]) {
  return values
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => v.toLowerCase().trim());
}

function overlap(topics: string[], interests: string[]) {
  const wanted = normalize(interests);
  return topics.filter((t) =>
    wanted.some((w) => t.toLowerCase().includes(w) || w.includes(t.toLowerCase())),
  );
}

function matchTokens(haystack: string[], wanted: string[]) {
  const w = normalize(wanted);
  return haystack.filter((t) =>
    w.some((x) => t.toLowerCase().includes(x) || x.includes(t.toLowerCase())),
  );
}

/**
 * Compatibility score built from real signals:
 * interests/skills overlap, mentorship history (mentors already engaged and the
 * topics of past requests), session activity, active goals, and mentor quality.
 */
function scoreMentor(mentor: Mentor, interests: string[], skills: string[]): RecommendedMentor {
  const signals: MentorMatchSignal[] = [];
  const surface = [...mentor.tags, mentor.role];

  const interestHits = matchTokens(surface, interests);
  if (interestHits.length) {
    signals.push({
      kind: "interest",
      label: `Shares your interests: ${interestHits.slice(0, 2).join(", ")}`,
      points: Math.min(30, interestHits.length * 15),
    });
  }

  const skillHits = matchTokens(surface, skills);
  if (skillHits.length) {
    signals.push({
      kind: "skill",
      label: `Works on your skills: ${skillHits.slice(0, 2).join(", ")}`,
      points: Math.min(25, skillHits.length * 13),
    });
  }

  // Mentorship history: topics of mentors you already worked with.
  const myRequests = requests.filter((r) => r.menteeId === "me");
  const pastMentorIds = myRequests.map((r) => r.mentorId);
  const historyTopics = pastMentorIds.flatMap(
    (id) => mentors.find((m) => m.id === id)?.tags ?? [],
  );
  if (pastMentorIds.includes(mentor.id)) {
    const active = myRequests.find((r) => r.mentorId === mentor.id);
    signals.push({
      kind: "history",
      label:
        active?.status === "accepted"
          ? "Your current mentor — continue the journey"
          : "You have worked together before",
      points: active?.status === "accepted" ? 20 : 12,
    });
  } else {
    const adjacency = matchTokens(mentor.tags, historyTopics);
    if (adjacency.length) {
      signals.push({
        kind: "history",
        label: `Similar to your past mentorship on ${adjacency.slice(0, 2).join(", ")}`,
        points: Math.min(18, adjacency.length * 9),
      });
    }
  }

  // Session activity: how engaged you are plus how experienced the mentor is.
  const mySessionCount = sessions.filter((s) =>
    myRequests.some((r) => r.id === s.requestId),
  ).length;
  if (mySessionCount >= 2 && mentor.sessions >= 80) {
    signals.push({
      kind: "session",
      label: `Handles regular cadence (${mentor.sessions} sessions mentored)`,
      points: 10,
    });
  }

  // Goals you are tracking.
  const goalHits = matchTokens(
    surface,
    goals.filter((g) => g.progress < 100).map((g) => g.title),
  );
  if (goalHits.length) {
    signals.push({
      kind: "goal",
      label: `Can help with your open goals (${goalHits.slice(0, 2).join(", ")})`,
      points: Math.min(15, goalHits.length * 8),
    });
  }

  signals.push({
    kind: "quality",
    label: `${mentor.rating.toFixed(1)}★ rating · ${mentor.sessions} sessions`,
    points: Math.round((mentor.rating / 5) * 12),
  });

  const score = Math.max(
    5,
    Math.min(100, signals.reduce((sum, s) => sum + s.points, 0)),
  );

  const matchedOn = Array.from(new Set([...interestHits, ...skillHits, ...goalHits]));

  return {
    id: mentor.id,
    name: mentor.name,
    role: mentor.role,
    matchedOn: (matchedOn.length ? matchedOn : mentor.tags).slice(0, 2),
    score,
    signals: signals.sort((a, b) => b.points - a.points).slice(0, 3),
  };
}

export const mockDashboard: DashboardApi = {
  feed: async (query) => {
    const wanted = [...(query?.interests ?? []), ...(query?.skills ?? [])];
    if (!normalize(wanted).length) return feed;
    const scored = feed.map((p) => ({ post: p, score: overlap(p.topics, wanted).length }));
    return scored
      .sort((a, b) => b.score - a.score || +new Date(b.post.createdAt) - +new Date(a.post.createdAt))
      .map((s) => s.post);
  },
  summary: async (query) => {
    const interests = query?.interests ?? [];
    const skills = query?.skills ?? [];
    const wanted = [...interests, ...skills];

    const recommendedMentors = mentors
      .map((m) => scoreMentor(m, interests, skills))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const communityUpdates = normalize(wanted).length
      ? [...summary.communityUpdates].sort(
          (a, b) =>
            overlap([b.topic ?? ""], wanted).length - overlap([a.topic ?? ""], wanted).length,
        )
      : summary.communityUpdates;

    return { ...summary, recommendedMentors, communityUpdates };
  },
};

const adminStats: AdminStats = [
  { label: "Total members", value: "5,420" },
  { label: "Active mentors", value: "182" },
  { label: "Events this month", value: "24" },
  { label: "Articles pending review", value: "6" },
];

const adminMembers: AdminMemberRow[] = [
  { id: "m1", name: "Ayu Pratiwi", country: "Indonesia", joined: "2025-04-12", status: "Mentor" },
  { id: "m2", name: "Rendy Sinaga", country: "Netherlands", joined: "2025-06-02", status: "Active" },
  { id: "m3", name: "Yoga Pradana", country: "United States", joined: "2025-08-19", status: "Mentor" },
  { id: "m6", name: "Nadia Wibowo", country: "Germany", joined: "2026-01-08", status: "Pending" },
  { id: "m7", name: "Dimas Prayoga", country: "Singapore", joined: "2026-02-14", status: "Active" },
  { id: "m8", name: "Anonymous Promo Bot", country: "Unknown", joined: "2026-08-01", status: "Suspended" },
];

const adminEvents: AdminEventRow[] = [
  { id: "e1", title: "Product Management Bootcamp", date: new Date(Date.now() + 5 * 864e5).toISOString(), registered: 68, capacity: 80 },
  { id: "e2", title: "Diaspora Founders Roundtable", date: new Date(Date.now() + 9 * 864e5).toISOString(), registered: 42, capacity: 60 },
];

const moderation: ModerationItem[] = [
  { id: "mo1", title: "Blue Card in Germany: the honest 2026 guide", author: "Nadia W.", reason: "Contains external links", status: "pending" },
  { id: "mo2", title: "Bootstrapping a SaaS from a kost in Yogyakarta", author: "Bagas S.", reason: "Flagged as promotional", status: "pending" },
  { id: "mo3", title: "Get rich quick with crypto signals", author: "Unknown", reason: "Reported as spam", status: "pending" },
];

const reports: AdminReport[] = [
  { id: "r1", label: "Monthly active members", value: "3,180" },
  { id: "r2", label: "Average event attendance", value: "76%" },
  { id: "r3", label: "Mentorship completion rate", value: "68%" },
  { id: "r4", label: "Articles published", value: "142" },
];

const analytics: AdminAnalytics = {
  memberGrowth: [
    { label: "Mar", members: 3120 },
    { label: "Apr", members: 3540 },
    { label: "May", members: 3980 },
    { label: "Jun", members: 4420 },
    { label: "Jul", members: 4910 },
    { label: "Aug", members: 5420 },
  ],
  engagement: [
    { label: "Feed posts / week", value: 312 },
    { label: "Event RSVPs / week", value: 186 },
    { label: "Mentorship sessions / week", value: 74 },
    { label: "New articles / week", value: 21 },
  ],
};

type MemberMentorshipSeed = {
  headline: string;
  skills: string[];
  interests: string[];
  mentorships: {
    mentorName: string;
    status: MentorshipRequestStatus;
    progress: number;
    startedDaysAgo: number;
    nextSessionInDays: number | null;
    sessions: { title: string; daysAgo: number; notes: string | null }[];
    goals: Goal[];
  }[];
};

const memberMentorshipSeeds: Record<string, MemberMentorshipSeed> = {
  m1: {
    headline: "Engineering Manager mentoring career switchers",
    skills: ["Leadership", "Career"],
    interests: ["Hiking", "Product"],
    mentorships: [
      {
        mentorName: "Prasetyo H.",
        status: "accepted",
        progress: 70,
        startedDaysAgo: 60,
        nextSessionInDays: -6,
        sessions: [
          { title: "Career mapping", daysAgo: 48, notes: "Set 90-day plan." },
          { title: "Stakeholder management", daysAgo: 20, notes: "Role play feedback." },
        ],
        goals: [
          { id: "m1g1", title: "Lead a cross-team project", progress: 80 },
          { id: "m1g2", title: "Mentor two juniors", progress: 100 },
        ],
      },
    ],
  },
  m2: {
    headline: "Product designer relocating to Amsterdam",
    skills: ["UX", "Research"],
    interests: ["Coffee", "Running"],
    mentorships: [
      {
        mentorName: "Dewi Ratna",
        status: "accepted",
        progress: 35,
        startedDaysAgo: 25,
        nextSessionInDays: 4,
        sessions: [{ title: "Portfolio review", daysAgo: 12, notes: "Three case studies picked." }],
        goals: [{ id: "m2g1", title: "Publish new portfolio", progress: 45 }],
      },
      {
        mentorName: "Nadia Wibowo",
        status: "completed",
        progress: 100,
        startedDaysAgo: 150,
        nextSessionInDays: null,
        sessions: [{ title: "Visa timeline planning", daysAgo: 120, notes: "Documents checklist." }],
        goals: [{ id: "m2g2", title: "Secure work permit", progress: 100 }],
      },
    ],
  },
  m3: {
    headline: "Staff engineer coaching system design",
    skills: ["System Design"],
    interests: ["Running"],
    mentorships: [
      {
        mentorName: "Yoga Pradana",
        status: "accepted",
        progress: 55,
        startedDaysAgo: 40,
        nextSessionInDays: -13,
        sessions: [
          { title: "Scaling fundamentals", daysAgo: 35, notes: null },
          { title: "Mock interview", daysAgo: 18, notes: "Needs depth on tradeoffs." },
        ],
        goals: [
          { id: "m3g1", title: "Pass staff-level interview", progress: 60 },
          { id: "m3g2", title: "Write a design doc", progress: 30 },
        ],
      },
    ],
  },
  m6: {
    headline: "Immigration consultant, new member",
    skills: ["EU Visa"],
    interests: ["Cooking"],
    mentorships: [
      {
        mentorName: "Sinta Larasati",
        status: "pending",
        progress: 0,
        startedDaysAgo: 5,
        nextSessionInDays: null,
        sessions: [],
        goals: [],
      },
    ],
  },
  m7: {
    headline: "Frontend engineer in Singapore",
    skills: ["React", "Frontend"],
    interests: ["Football"],
    mentorships: [
      {
        mentorName: "Bagas Setya",
        status: "accepted",
        progress: 20,
        startedDaysAgo: 15,
        nextSessionInDays: 2,
        sessions: [{ title: "Kickoff", daysAgo: 10, notes: "Discussed side project." }],
        goals: [{ id: "m7g1", title: "Ship a side project", progress: 25 }],
      },
    ],
  },
};

function buildMemberDetail(row: AdminMemberRow): AdminMemberDetail {
  const seed = memberMentorshipSeeds[row.id];
  const now = Date.now();
  const mentorships: AdminMentorshipRecord[] = (seed?.mentorships ?? []).map((m, i) => {
    const nextSessionAt =
      m.nextSessionInDays === null ? null : new Date(now + m.nextSessionInDays * 864e5).toISOString();
    const overdueDays =
      m.status === "accepted" && m.nextSessionInDays !== null && m.nextSessionInDays < 0
        ? Math.abs(m.nextSessionInDays)
        : null;
    return {
      id: `${row.id}-ms${i + 1}`,
      mentorName: m.mentorName,
      status: m.status,
      progress: m.progress,
      startedAt: new Date(now - m.startedDaysAgo * 864e5).toISOString(),
      nextSessionAt,
      overdueDays,
      sessions: m.sessions
        .map((s, j) => ({
          id: `${row.id}-s${i + 1}${j + 1}`,
          title: s.title,
          heldAt: new Date(now - s.daysAgo * 864e5).toISOString(),
          notes: s.notes,
        }))
        .sort((a, b) => +new Date(b.heldAt) - +new Date(a.heldAt)),
      goals: m.goals,
    };
  });

  const allGoals = mentorships.flatMap((m) => m.goals);
  const sessionCount = mentorships.reduce((sum, m) => sum + m.sessions.length, 0);

  return {
    member: row,
    headline: seed?.headline ?? null,
    skills: seed?.skills ?? [],
    interests: seed?.interests ?? [],
    mentorships,
    totals: {
      mentorships: mentorships.length,
      sessions: sessionCount,
      avgProgress: mentorships.length
        ? Math.round(mentorships.reduce((s, m) => s + m.progress, 0) / mentorships.length)
        : 0,
      overdueSessions: mentorships.filter((m) => m.overdueDays !== null).length,
      goalsCompleted: allGoals.filter((g) => g.progress >= 100).length,
      goalsTotal: allGoals.length,
    },
  };
}

export const mockAdmin: AdminApi = {
  stats: async () => adminStats,
  listMembers: async () => adminMembers,
  memberDetail: async (id) => {
    const row = adminMembers.find((m) => m.id === id);
    if (!row) throw new Error("Member not found");
    return buildMemberDetail(row);
  },
  listEvents: async () => adminEvents,
  listModeration: async () => moderation,
  listReports: async () => reports,
  setMemberStatus: async ({ id, status }) => {
    const row = adminMembers.find((m) => m.id === id);
    if (!row) throw new Error("Member not found");
    row.status = status;
    return row;
  },
  moderate: async ({ id, action }) => {
    const item = moderation.find((m) => m.id === id);
    if (!item) throw new Error("Item not found");
    item.status = action === "approve" ? "approved" : "rejected";
    return item;
  },
  analytics: async () => analytics,
  sessionReport: async () => ({
    totals: { sessions: 0, mentorships: 0, avgDurationMinutes: 0, overdueSessions: 0 },
    mentors: [],
  }),

  generateReport: async ({ range }) => {
    const factor = range === "7d" ? 0.25 : range === "30d" ? 1 : 2.8;
    return {
      id: `rep-${range}-${Date.now()}`,
      range,
      generatedAt: new Date().toISOString(),
      rows: [
        { id: "g1", label: "New members", value: Math.round(480 * factor).toLocaleString() },
        { id: "g2", label: "Events held", value: String(Math.max(1, Math.round(9 * factor))) },
        { id: "g3", label: "Articles published", value: String(Math.max(1, Math.round(24 * factor))) },
        { id: "g4", label: "Mentorship sessions", value: String(Math.max(1, Math.round(31 * factor))) },
        { id: "g5", label: "Moderation actions", value: String(Math.max(1, Math.round(7 * factor))) },
      ],
    };
  },
};

