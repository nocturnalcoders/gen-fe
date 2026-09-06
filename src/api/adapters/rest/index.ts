// REST adapter — implements the ApiClient contract against your own API.
// Enabled automatically when VITE_API_BASE_URL is set.
// Endpoint shapes are documented in docs/api-contract.md.

import { http } from "../../http";
import { authStore } from "../../auth-store";
import type {
  ActivitiesApi,
  AdminApi,
  ApiClient,
  Article,
  ArticleComment,
  ArticlesApi,
  AppNotification,
  AuthApi,
  Chapter,
  CommunityEvent,
  DashboardApi,
  DashboardSummary,
  DiasporaApi,
  EventsApi,
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
  NotificationsApi,
  Profile,
  ProfilesApi,
  RegistrationsApi,
  Activity,
  Session,
  ThreadMessage,
  ThreadsApi,
} from "../../types";

type RegisterTarget = { targetType: "activity" | "event"; targetId: string };

type LoginResponse = {
  accessToken: string;
  refreshToken?: string | null;
  user: Session["user"];
};

function targetPath({ targetType, targetId }: RegisterTarget) {
  return `${targetType === "activity" ? "activities" : "events"}/${targetId}`;
}

// Polling interval used to emulate realtime for backends without websockets.
const POLL_MS = 8000;

function poll(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const timer = window.setInterval(onChange, POLL_MS);
  return () => window.clearInterval(timer);
}

const auth: AuthApi = {
  getSession: async () => {
    const cached = authStore.getSession();
    if (!cached) return null;
    try {
      const user = await http.get<Session["user"]>("/auth/me");
      authStore.setSession({ user, accessToken: cached.accessToken });
      return { user, accessToken: cached.accessToken };
    } catch {
      authStore.clear();
      return null;
    }
  },
  onAuthStateChange: (cb) => authStore.subscribe(cb),
  signInWithPassword: async ({ email, password }) => {
    const data = await http.post<LoginResponse>("/auth/login", { email, password }, false);
    authStore.setSession(
      { user: data.user, accessToken: data.accessToken },
      { refreshToken: data.refreshToken ?? null },
    );
  },
  signUpWithPassword: async ({ email, password, fullName }) => {
    const data = await http.post<LoginResponse & { needsEmailConfirmation?: boolean }>(
      "/auth/register",
      { email, password, fullName: fullName ?? null },
      false,
    );
    if (data.accessToken) {
      authStore.setSession(
        { user: data.user, accessToken: data.accessToken },
        { refreshToken: data.refreshToken ?? null },
      );
    }
    return { needsEmailConfirmation: data.needsEmailConfirmation ?? !data.accessToken };
  },
  signInWithGoogle: async () => {
    const { url } = await http.get<{ url: string }>(
      "/auth/oauth/google",
      { redirectUri: window.location.origin },
      false,
    );
    window.location.assign(url);
  },
  signOut: async () => {
    try {
      await http.post<void>("/auth/logout");
    } finally {
      authStore.clear();
    }
  },
};

const profiles: ProfilesApi = {
  getMyProfile: () => http.get<Profile | null>("/profiles/me"),
  getProfile: (id) => http.get<Profile | null>(`/profiles/${id}`),
  updateMyProfile: (input) => http.patch<Profile>("/profiles/me", input),
};

const activities: ActivitiesApi = {
  list: () => http.get<Activity[]>("/activities"),
  get: (id) => http.get<Activity | null>(`/activities/${id}`),
  subscribe: (_id, onChange) => poll(onChange),
};

const events: EventsApi = {
  list: () => http.get<CommunityEvent[]>("/events"),
  get: (id) => http.get<CommunityEvent | null>(`/events/${id}`),
  subscribe: (_id, onChange) => poll(onChange),
};

const registrations: RegistrationsApi = {
  isRegistered: async (input) => {
    const res = await http.get<{ registered: boolean }>(`/${targetPath(input)}/registration`);
    return res.registered;
  },
  register: (input) => http.post<void>(`/${targetPath(input)}/registration`),
  unregister: (input) => http.del<void>(`/${targetPath(input)}/registration`),
};

const threads: ThreadsApi = {
  list: (input) => http.get<ThreadMessage[]>(`/${targetPath(input)}/messages`),
  post: ({ body, ...input }) => http.post<void>(`/${targetPath(input)}/messages`, { body }),
  remove: (id) => http.del<void>(`/messages/${id}`),
  subscribe: (_input, onChange) => poll(onChange),
};

const members: MembersApi = {
  list: (query) => http.get<Member[]>("/members", query),
  get: (id) => http.get<Member | null>(`/members/${id}`),
};

const mentorship: MentorshipApi = {
  listMentors: (query) => http.get<Mentor[]>("/mentors", query),
  getMentor: (id) => http.get<Mentor | null>(`/mentors/${id}`),
  listRequests: () => http.get<MentorshipRequest[]>("/mentorship/requests"),
  createRequest: (input) => http.post<MentorshipRequest>("/mentorship/requests", input),
  listSessions: () => http.get<MentorshipSession[]>("/mentorship/sessions"),
  listGoals: () => http.get<Goal[]>("/mentorship/goals"),
};

const articles: ArticlesApi = {
  list: (query) => http.get<Article[]>("/articles", query),
  get: (slug) => http.get<Article | null>(`/articles/${slug}`),
  listMyDrafts: () => http.get<Article[]>("/articles/drafts"),
  create: (input) => http.post<Article>("/articles", input),
  toggleLike: (id) => http.post<{ liked: boolean; likes: number }>(`/articles/${id}/like`),
  toggleBookmark: (id) => http.post<{ bookmarked: boolean }>(`/articles/${id}/bookmark`),
  listComments: (id) => http.get<ArticleComment[]>(`/articles/${id}/comments`),
  addComment: ({ id, body }) => http.post<ArticleComment>(`/articles/${id}/comments`, { body }),
  categories: () => http.get<string[]>("/articles/categories"),
};

const diaspora: DiasporaApi = {
  listChapters: () => http.get<Chapter[]>("/diaspora/chapters"),
  toggleJoinChapter: (slug) => http.post<{ joined: boolean }>(`/diaspora/chapters/${slug}/join`),
  listGatherings: (slug) => http.get<Gathering[]>("/diaspora/gatherings", { chapter: slug }),
  listGuides: () => http.get<Guide[]>("/diaspora/guides"),
};

const notifications: NotificationsApi = {
  list: () => http.get<AppNotification[]>("/notifications"),
  unreadCount: async () => {
    const res = await http.get<{ count: number }>("/notifications/unread-count");
    return res.count;
  },
  markRead: (id) => http.post<void>(`/notifications/${id}/read`),
  markAllRead: () => http.post<void>("/notifications/read-all"),
};

function personalizationParams(query?: { interests?: string[]; skills?: string[] }) {
  return {
    interests: query?.interests?.length ? query.interests.join(",") : undefined,
    skills: query?.skills?.length ? query.skills.join(",") : undefined,
  };
}

const dashboard: DashboardApi = {
  feed: (query) => http.get<FeedPost[]>("/dashboard/feed", personalizationParams(query)),
  summary: (query) => http.get<DashboardSummary>("/dashboard/summary", personalizationParams(query)),
};

const admin: AdminApi = {
  stats: () => http.get("/admin/stats"),
  listMembers: () => http.get("/admin/members"),
  listEvents: () => http.get("/admin/events"),
  listModeration: () => http.get("/admin/moderation"),
  listReports: () => http.get("/admin/reports"),
  setMemberStatus: ({ id, status }) => http.patch(`/admin/members/${id}`, { status }),
  moderate: ({ id, action }) => http.post(`/admin/moderation/${id}/${action}`),
  analytics: () => http.get("/admin/analytics"),
  generateReport: ({ range }) => http.post("/admin/reports/generate", { range }),
};

export const restApi: ApiClient = {
  auth,
  profiles,
  activities,
  events,
  registrations,
  threads,
  members,
  mentorship,
  articles,
  diaspora,
  notifications,
  dashboard,
  admin,
};

