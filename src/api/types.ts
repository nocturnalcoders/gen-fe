// Domain types for the Garuda platform.
// These are backend-agnostic: they describe the shape the UI consumes,
// independent of Lovable Cloud or your own REST API.

export type ID = string;
export type Unsubscribe = () => void;
export type TargetType = "activity" | "event";

export type AuthUser = {
  id: ID;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Session = {
  user: AuthUser;
  accessToken: string | null;
};

export type Profile = {
  id: ID;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  role: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  skills: string[];
  interests: string[];
  createdAt: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, "id" | "createdAt">>;

export type Activity = {
  id: ID;
  title: string;
  activityType: string;
  activityDate: string;
  location: string;
  capacity: number;
  hostName: string | null;
  description: string | null;
  joined: number;
};

export type CommunityEvent = {
  id: ID;
  title: string;
  eventType: string;
  eventDate: string;
  location: string;
  capacity: number;
  description: string | null;
  joined: number;
};

export type ThreadMessage = {
  id: ID;
  userId: ID;
  body: string;
  createdAt: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
};

export type Member = {
  id: ID;
  name: string;
  role: string | null;
  company: string | null;
  country: string | null;
  avatarUrl: string | null;
  linkedin: string | null;
  skills: string[];
  interests: string[];
};

export type MemberQuery = {
  q?: string;
  skill?: string;
  country?: string;
  interest?: string;
  company?: string;
};

export type Mentor = {
  id: ID;
  name: string;
  role: string;
  tags: string[];
  sessions: number;
  rating: number;
  avatarUrl: string | null;
};

export type MentorTestimonial = {
  id: ID;
  mentorId: ID;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number;
  createdAt: string;
};

export type MentorProfile = {
  mentor: Mentor;
  /** 0-100 compatibility score for the signed-in member (0 when signed out) */
  score: number;
  matchedOn: string[];
  stats: {
    totalSessions: number;
    avgDurationMinutes: number;
    activeMentorships: number;
    avgProgress: number;
  };
  sessions: MentorshipSession[];
  testimonials: MentorTestimonial[];
};

export type MentorshipRequestStatus = "pending" | "accepted" | "declined" | "completed";

export type MentorshipRequest = {
  id: ID;
  mentorId: ID;
  mentorName: string;
  menteeId: ID;
  status: MentorshipRequestStatus;
  message: string | null;
  nextSessionAt: string | null;
  progress: number;
  createdAt: string;
};

export type MentorshipSession = {
  id: ID;
  requestId: ID;
  title: string;
  heldAt: string;
  notes: string | null;
  durationMinutes?: number;
};

export type MentorshipRequestInput = {
  mentorId: ID;
  message: string;
  goals?: string[];
  nextSessionAt?: string | null;
};


export type Goal = {
  id: ID;
  title: string;
  progress: number;
};

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  authorId: ID | null;
  authorName: string;
  readingMinutes: number;
  likes: number;
  comments: number;
  status: ArticleStatus;
  liked: boolean;
  bookmarked: boolean;
  createdAt: string;
};

export type ArticleInput = {
  title: string;
  body: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  status: ArticleStatus;
};

export type ArticleComment = {
  id: ID;
  articleId: ID;
  authorName: string;
  body: string;
  createdAt: string;
};

export type Chapter = {
  slug: string;
  flag: string;
  country: string;
  city: string;
  members: number;
  joined: boolean;
};

export type Gathering = {
  id: ID;
  chapterSlug: string;
  title: string;
  date: string;
};

export type Guide = {
  id: ID;
  kind: "career" | "immigration";
  title: string;
  author: string | null;
};

export type NotificationKind =
  | "like"
  | "reply"
  | "mentorship"
  | "mention"
  | "event"
  | "system";

export type AppNotification = {
  id: ID;
  kind: NotificationKind;
  text: string;
  createdAt: string;
  read: boolean;
};

export type FeedPost = {
  id: ID;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  body: string;
  likes: number;
  comments: number;
  topics: string[];
  source: "community" | "mentorship" | "activity" | "event" | "article";
};

export type CommunityUpdate = {
  id: ID;
  text: string;
  topic: string | null;
};

export type MentorMatchSignal = {
  kind: "interest" | "skill" | "history" | "session" | "goal" | "quality";
  label: string;
  points: number;
};

export type RecommendedMentor = {
  id: ID;
  name: string;
  role: string;
  matchedOn: string[];
  /** 0-100 compatibility score */
  score: number;
  signals: MentorMatchSignal[];
};

export type DashboardSummary = {
  stats: { label: string; value: string }[];
  upcomingEvents: { id: ID; title: string; date: string }[];
  activeMentorship: {
    mentorName: string;
    goal: string;
    progress: number;
    nextSession: string;
  } | null;
  recommendedMentors: RecommendedMentor[];
  communityUpdates: CommunityUpdate[];
};

export type PersonalizationQuery = {
  interests?: string[];
  skills?: string[];
};

export type AdminStats = { label: string; value: string }[];

export type AdminMemberStatus = "Active" | "Mentor" | "Pending" | "Suspended";

export type AdminMemberRow = {
  id: ID;
  name: string;
  country: string;
  joined: string;
  status: AdminMemberStatus;
};

export type AdminEventRow = {
  id: ID;
  title: string;
  date: string;
  registered: number;
  capacity: number;
};

export type ModerationItem = {
  id: ID;
  title: string;
  author: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

export type AdminReport = {
  id: ID;
  label: string;
  value: string;
};

export type AdminAnalytics = {
  memberGrowth: { label: string; members: number }[];
  engagement: { label: string; value: number }[];
};

export type AdminReportRange = "7d" | "30d" | "90d";

export type AdminGeneratedReport = {
  id: ID;
  range: AdminReportRange;
  generatedAt: string;
  rows: AdminReport[];
};

export type AdminMentorSessionRow = {
  mentorId: ID;
  mentorName: string;
  mentorships: number;
  sessions: number;
  avgDurationMinutes: number;
  avgProgress: number;
  /** 0-100 compatibility score across this mentor's mentees */
  matchScore: number;
  overdueSessions: number;
};

export type AdminSessionReport = {
  totals: {
    sessions: number;
    mentorships: number;
    avgDurationMinutes: number;
    overdueSessions: number;
  };
  mentors: AdminMentorSessionRow[];
};




// ---------------------------------------------------------------------------
// The API surface. Every adapter (cloud / rest / mock) implements this.
// ---------------------------------------------------------------------------

export type AuthApi = {
  getSession: () => Promise<Session | null>;
  onAuthStateChange: (cb: (session: Session | null) => void) => Unsubscribe;
  signInWithPassword: (input: { email: string; password: string }) => Promise<void>;
  signUpWithPassword: (input: {
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export type ProfilesApi = {
  getMyProfile: () => Promise<Profile | null>;
  updateMyProfile: (input: ProfileUpdate) => Promise<Profile>;
  getProfile: (id: ID) => Promise<Profile | null>;
};

export type ActivitiesApi = {
  list: () => Promise<Activity[]>;
  get: (id: ID) => Promise<Activity | null>;
  subscribe: (id: ID, onChange: () => void) => Unsubscribe;
};

export type EventsApi = {
  list: () => Promise<CommunityEvent[]>;
  get: (id: ID) => Promise<CommunityEvent | null>;
  subscribe: (id: ID, onChange: () => void) => Unsubscribe;
};

export type RegistrationsApi = {
  isRegistered: (input: { targetType: TargetType; targetId: ID }) => Promise<boolean>;
  register: (input: { targetType: TargetType; targetId: ID }) => Promise<void>;
  unregister: (input: { targetType: TargetType; targetId: ID }) => Promise<void>;
};

export type ThreadsApi = {
  list: (input: { targetType: TargetType; targetId: ID }) => Promise<ThreadMessage[]>;
  post: (input: { targetType: TargetType; targetId: ID; body: string }) => Promise<void>;
  remove: (id: ID) => Promise<void>;
  subscribe: (
    input: { targetType: TargetType; targetId: ID },
    onChange: () => void,
  ) => Unsubscribe;
};

export type MembersApi = {
  list: (query?: MemberQuery) => Promise<Member[]>;
  get: (id: ID) => Promise<Member | null>;
};

export type MentorshipApi = {
  listMentors: (query?: { q?: string }) => Promise<Mentor[]>;
  getMentor: (id: ID) => Promise<Mentor | null>;
  getMentorProfile: (id: ID) => Promise<MentorProfile | null>;
  addTestimonial: (input: { mentorId: ID; quote: string; rating: number }) => Promise<MentorTestimonial>;
  listRequests: () => Promise<MentorshipRequest[]>;
  createRequest: (input: MentorshipRequestInput) => Promise<MentorshipRequest>;
  listSessions: () => Promise<MentorshipSession[]>;
  listGoals: () => Promise<Goal[]>;
};

export type ArticlesApi = {
  list: (query?: { category?: string; q?: string }) => Promise<Article[]>;
  get: (slug: string) => Promise<Article | null>;
  listMyDrafts: () => Promise<Article[]>;
  create: (input: ArticleInput) => Promise<Article>;
  toggleLike: (id: ID) => Promise<{ liked: boolean; likes: number }>;
  toggleBookmark: (id: ID) => Promise<{ bookmarked: boolean }>;
  listComments: (id: ID) => Promise<ArticleComment[]>;
  addComment: (input: { id: ID; body: string }) => Promise<ArticleComment>;
  categories: () => Promise<string[]>;
};

export type DiasporaApi = {
  listChapters: () => Promise<Chapter[]>;
  toggleJoinChapter: (slug: string) => Promise<{ joined: boolean }>;
  listGatherings: (slug?: string) => Promise<Gathering[]>;
  listGuides: () => Promise<Guide[]>;
};

export type NotificationsApi = {
  list: () => Promise<AppNotification[]>;
  unreadCount: () => Promise<number>;
  markRead: (id: ID) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export type DashboardApi = {
  feed: (query?: PersonalizationQuery) => Promise<FeedPost[]>;
  summary: (query?: PersonalizationQuery) => Promise<DashboardSummary>;
};

export type AdminMentorshipRecord = {
  id: ID;
  mentorName: string;
  status: MentorshipRequestStatus;
  progress: number;
  startedAt: string;
  nextSessionAt: string | null;
  /** Set when nextSessionAt is in the past and the session was not held. */
  overdueDays: number | null;
  sessions: { id: ID; title: string; heldAt: string; notes: string | null }[];
  goals: Goal[];
};

export type AdminMemberDetail = {
  member: AdminMemberRow;
  headline: string | null;
  skills: string[];
  interests: string[];
  mentorships: AdminMentorshipRecord[];
  totals: {
    mentorships: number;
    sessions: number;
    avgProgress: number;
    overdueSessions: number;
    goalsCompleted: number;
    goalsTotal: number;
  };
};

export type AdminApi = {
  stats: () => Promise<AdminStats>;
  listMembers: () => Promise<AdminMemberRow[]>;
  memberDetail: (id: ID) => Promise<AdminMemberDetail>;
  listEvents: () => Promise<AdminEventRow[]>;
  listModeration: () => Promise<ModerationItem[]>;
  listReports: () => Promise<AdminReport[]>;
  setMemberStatus: (input: { id: ID; status: AdminMemberStatus }) => Promise<AdminMemberRow>;
  moderate: (input: { id: ID; action: "approve" | "reject" }) => Promise<ModerationItem>;
  analytics: () => Promise<AdminAnalytics>;
  generateReport: (input: { range: AdminReportRange }) => Promise<AdminGeneratedReport>;
  sessionReport: () => Promise<AdminSessionReport>;

};


export interface ApiClient {
  auth: AuthApi;
  profiles: ProfilesApi;
  activities: ActivitiesApi;
  events: EventsApi;
  registrations: RegistrationsApi;
  threads: ThreadsApi;
  members: MembersApi;
  mentorship: MentorshipApi;
  articles: ArticlesApi;
  diaspora: DiasporaApi;
  notifications: NotificationsApi;
  dashboard: DashboardApi;
  admin: AdminApi;
}