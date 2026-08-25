// Temporary in-memory adapter for modules that do not have a backend yet.
// The shapes match src/api/types.ts exactly, so swapping in the cloud or rest
// implementation later requires no UI changes.

import type {
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
  { id: "f1", authorName: "Ayu Pratiwi", authorAvatarUrl: null, createdAt: new Date(Date.now() - 45 * 6e4).toISOString(), body: "Just wrapped a mentorship session on system design — sharing my notes in the articles section soon!", likes: 42, comments: 8 },
  { id: "f2", authorName: "Rendy Sinaga", authorAvatarUrl: null, createdAt: new Date(Date.now() - 5 * 36e5).toISOString(), body: "Amsterdam chapter coffee meetup was packed. Next one in two weeks — bring a friend.", likes: 67, comments: 12 },
  { id: "f3", authorName: "Farhan Aditya", authorAvatarUrl: null, createdAt: new Date(Date.now() - 26 * 36e5).toISOString(), body: "Looking for a running buddy in Singapore for weekend 10Ks. Anyone in?", likes: 23, comments: 15 },
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
  recommendedMentors: mentors.slice(0, 3).map((m) => ({ id: m.id, name: m.name, role: m.role })),
  communityUpdates: [
    "Singapore chapter passed 1,100 members",
    "New immigration guide published for the Netherlands",
    "ActiveGen added 6 new activities this week",
  ],
};

export const mockDashboard: DashboardApi = {
  feed: async () => feed,
  summary: async () => summary,
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
];

const adminEvents: AdminEventRow[] = [
  { id: "e1", title: "Product Management Bootcamp", date: new Date(Date.now() + 5 * 864e5).toISOString(), registered: 68, capacity: 80 },
  { id: "e2", title: "Diaspora Founders Roundtable", date: new Date(Date.now() + 9 * 864e5).toISOString(), registered: 42, capacity: 60 },
];

const moderation: ModerationItem[] = [
  { id: "mo1", title: "Blue Card in Germany: the honest 2026 guide", author: "Nadia W.", reason: "Contains external links", status: "pending" },
  { id: "mo2", title: "Bootstrapping a SaaS from a kost in Yogyakarta", author: "Bagas S.", reason: "Flagged as promotional", status: "pending" },
];

const reports: AdminReport[] = [
  { id: "r1", label: "Monthly active members", value: "3,180" },
  { id: "r2", label: "Average event attendance", value: "76%" },
  { id: "r3", label: "Mentorship completion rate", value: "68%" },
];

export const mockAdmin: AdminApi = {
  stats: async () => adminStats,
  listMembers: async () => adminMembers,
  listEvents: async () => adminEvents,
  listModeration: async () => moderation,
  listReports: async () => reports,
};
