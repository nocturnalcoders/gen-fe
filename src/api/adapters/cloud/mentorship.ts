// Real (database-backed) mentorship, notifications, dashboard-feed alerts and
// admin mentorship reporting for the Lovable Cloud adapter.

import { supabase } from "@/integrations/supabase/client";
import { mockAdmin, mockDashboard } from "../mock/index";
import type {
  AdminApi,
  AdminMemberDetail,
  AdminMemberRow,
  AdminMentorSessionRow,
  AdminMentorshipRecord,
  AdminSessionReport,
  AppNotification,
  DashboardApi,
  FeedPost,
  Goal,
  ID,
  Mentor,
  MentorshipApi,
  MentorshipRequest,
  MentorshipRequestStatus,
  MentorshipSession,
  NotificationKind,
  NotificationsApi,
} from "../../types";

type Row = Record<string, any>;

async function currentUserId(): Promise<ID> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to sign in first.");
  return data.user.id;
}

function toMentor(r: Row): Mentor {
  return {
    id: r['id'],
    name: r['name'],
    role: r['role'],
    tags: r['tags'] ?? [],
    sessions: r['sessions'] ?? 0,
    rating: Number(r['rating'] ?? 0),
    avatarUrl: r['avatar_url'] ?? null,
  };
}

function toRequest(r: Row): MentorshipRequest {
  return {
    id: r['id'],
    mentorId: r['mentor_id'],
    mentorName: r['mentors']?.name ?? "Mentor",
    menteeId: r['mentee_id'],
    status: (r['status'] ?? "pending") as MentorshipRequestStatus,
    message: r['message'] ?? null,
    nextSessionAt: r['next_session_at'] ?? null,
    progress: r['progress'] ?? 0,
    createdAt: r['created_at'],
  };
}

function toSession(r: Row): MentorshipSession {
  return {
    id: r['id'],
    requestId: r['request_id'],
    title: r['title'],
    heldAt: r['held_at'],
    notes: r['notes'] ?? null,
    durationMinutes: r['duration_minutes'] ?? 60,
  };
}

function overdueDaysOf(request: Row, sessions: Row[]): number | null {
  const next = request['next_session_at'] as string | null;
  if (!next) return null;
  const nextMs = +new Date(next);
  if (nextMs >= Date.now()) return null;
  if (!["pending", "accepted"].includes(request['status'])) return null;
  const held = sessions.some((s) => +new Date(s['held_at']) >= nextMs);
  if (held) return null;
  return Math.max(1, Math.round((Date.now() - nextMs) / 864e5));
}

// ---------------------------------------------------------------- mentorship

export const cloudMentorship: MentorshipApi = {
  listMentors: async (query) => {
    let q = supabase.from("mentors").select("*").order("rating", { ascending: false });
    const term = query?.q?.trim();
    if (term) q = q.or(`name.ilike.%${term}%,role.ilike.%${term}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toMentor);
  },
  getMentor: async (id) => {
    const { data, error } = await supabase.from("mentors").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toMentor(data as Row) : null;
  },
  listRequests: async () => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("mentorship_requests")
      .select("*, mentors(name)")
      .eq("mentee_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toRequest);
  },
  createRequest: async ({ mentorId, message, goals, nextSessionAt }) => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("mentorship_requests")
      .insert({
        mentor_id: mentorId,
        mentee_id: userId,
        message,
        status: "pending",
        next_session_at: nextSessionAt ?? null,
      })
      .select("*, mentors(name)")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Pengajuan mentorship gagal dibuat.");
    const created = toRequest(data as Row);
    const cleanGoals = (goals ?? []).map((g) => g.trim()).filter(Boolean);
    if (cleanGoals.length > 0) {
      const { error: goalError } = await supabase
        .from("mentorship_goals")
        .insert(cleanGoals.map((title) => ({ request_id: created.id, title, progress: 0 })));
      if (goalError) throw new Error(goalError.message);
    }
    return created;
  },
  listSessions: async () => {
    const userId = await currentUserId();
    const { data: reqs, error: reqError } = await supabase
      .from("mentorship_requests")
      .select("id")
      .eq("mentee_id", userId);
    if (reqError) throw new Error(reqError.message);
    const ids = (reqs ?? []).map((r: Row) => r['id']);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("mentorship_sessions")
      .select("*")
      .in("request_id", ids)
      .order("held_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toSession);
  },
  listGoals: async () => {
    const userId = await currentUserId();
    const { data: reqs, error: reqError } = await supabase
      .from("mentorship_requests")
      .select("id")
      .eq("mentee_id", userId);
    if (reqError) throw new Error(reqError.message);
    const ids = (reqs ?? []).map((r: Row) => r['id']);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("mentorship_goals")
      .select("*")
      .in("request_id", ids)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((g: Row) => ({
      id: g['id'],
      title: g['title'],
      progress: g['progress'] ?? 0,
    })) as Goal[];
  },
};

// ------------------------------------------------------------- notifications

/** Creates "session overdue" notifications; safe (idempotent) to call often. */
async function syncOverdueNotifications() {
  try {
    await supabase.rpc("generate_overdue_session_notifications");
  } catch {
    // Non-blocking: reading notifications must still work.
  }
}

function toNotification(r: Row): AppNotification {
  return {
    id: r['id'],
    kind: (r['kind'] ?? "system") as NotificationKind,
    text: r['text'],
    createdAt: r['created_at'],
    read: !!r['read'],
  };
}

export const cloudNotifications: NotificationsApi = {
  list: async () => {
    const userId = await currentUserId();
    await syncOverdueNotifications();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toNotification);
  },
  unreadCount: async () => {
    const userId = await currentUserId();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  markRead: async (id) => {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw new Error(error.message);
  },
  markAllRead: async () => {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw new Error(error.message);
  },
};

// ------------------------------------------------------------------ dashboard

export const cloudDashboard: DashboardApi = {
  summary: (query) => mockDashboard.summary(query),
  feed: async (query) => {
    const base = await mockDashboard.feed(query);
    try {
      const userId = await currentUserId();
      await syncOverdueNotifications();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("kind", "mentorship")
        .order("created_at", { ascending: false })
        .limit(3);
      const alerts: FeedPost[] = (data ?? []).map((n: Row) => ({
        id: `notif-${n['id']}`,
        authorName: "Mentorship Reminder",
        authorAvatarUrl: null,
        createdAt: n['created_at'],
        body: n['text'],
        likes: 0,
        comments: 0,
        topics: ["Mentorship"],
        source: "mentorship",
      }));
      return [...alerts, ...base];
    } catch {
      return base;
    }
  },
};

// ---------------------------------------------------------------------- admin

function matchScore(
  mentorTags: string[],
  mentorRole: string,
  rating: number,
  progress: number,
  interests: string[],
  skills: string[],
) {
  const wanted = [...interests, ...skills].map((s) => s.toLowerCase());
  const haystack = [...mentorTags, mentorRole].join(" ").toLowerCase();
  const overlap = wanted.filter((w) => w && haystack.includes(w)).length;
  const score =
    Math.min(45, overlap * 15) + Math.round((rating / 5) * 30) + Math.round(progress * 0.25);
  return Math.max(5, Math.min(100, score));
}

async function loadMentorshipData(menteeId?: ID) {
  let requestQuery = supabase
    .from("mentorship_requests")
    .select("*, mentors(id, name, role, tags, rating)")
    .order("created_at", { ascending: false });
  if (menteeId) requestQuery = requestQuery.eq("mentee_id", menteeId);
  const { data: requests, error } = await requestQuery;
  if (error) throw new Error(error.message);
  const ids = (requests ?? []).map((r: Row) => r['id']);
  const [sessionsRes, goalsRes] = await Promise.all([
    ids.length
      ? supabase.from("mentorship_sessions").select("*").in("request_id", ids)
      : Promise.resolve({ data: [], error: null } as never),
    ids.length
      ? supabase.from("mentorship_goals").select("*").in("request_id", ids)
      : Promise.resolve({ data: [], error: null } as never),
  ]);
  return {
    requests: (requests ?? []) as Row[],
    sessions: ((sessionsRes as Row)['data'] ?? []) as Row[],
    goals: ((goalsRes as Row)['data'] ?? []) as Row[],
  };
}

async function memberDetail(id: ID): Promise<AdminMemberDetail> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile) throw new Error("Member not found");
  const p = profile as Row;

  const { requests, sessions, goals } = await loadMentorshipData(id);

  const mentorships: AdminMentorshipRecord[] = requests.map((r) => {
    const own = sessions.filter((s) => s['request_id'] === r['id']);
    return {
      id: r['id'],
      mentorName: r['mentors']?.name ?? "Mentor",
      status: (r['status'] ?? "pending") as MentorshipRequestStatus,
      progress: r['progress'] ?? 0,
      startedAt: r['created_at'],
      nextSessionAt: r['next_session_at'] ?? null,
      overdueDays: overdueDaysOf(r, own),
      sessions: own
        .map((s) => ({
          id: s['id'],
          title: s['title'],
          heldAt: s['held_at'],
          notes: s['notes'] ?? null,
        }))
        .sort((a, b) => +new Date(b.heldAt) - +new Date(a.heldAt)),
      goals: goals
        .filter((g) => g['request_id'] === r['id'])
        .map((g) => ({ id: g['id'], title: g['title'], progress: g['progress'] ?? 0 })),
    };
  });

  const allGoals = mentorships.flatMap((m) => m.goals);
  const member: AdminMemberRow = {
    id: p['id'],
    name: p['display_name'] ?? "Anggota",
    country: p['location'] ?? "—",
    joined: p['created_at'] ?? new Date().toISOString(),
    status: "Active",
  };

  return {
    member,
    headline: p['headline'] ?? null,
    skills: p['skills'] ?? [],
    interests: p['interests'] ?? [],
    mentorships,
    totals: {
      mentorships: mentorships.length,
      sessions: mentorships.reduce((sum, m) => sum + m.sessions.length, 0),
      avgProgress: mentorships.length
        ? Math.round(mentorships.reduce((s, m) => s + m.progress, 0) / mentorships.length)
        : 0,
      overdueSessions: mentorships.filter((m) => m.overdueDays !== null).length,
      goalsCompleted: allGoals.filter((g) => g.progress >= 100).length,
      goalsTotal: allGoals.length,
    },
  };
}

async function sessionReport(): Promise<AdminSessionReport> {
  const { requests, sessions } = await loadMentorshipData();
  const { data: profileRows } = await supabase.from("profiles").select("id, skills, interests");
  const profileMap = new Map<string, Row>(
    ((profileRows ?? []) as Row[]).map((p) => [p['id'] as string, p]),
  );

  const byMentor = new Map<string, AdminMentorSessionRow & { _durations: number[]; _progress: number[] }>();

  for (const r of requests) {
    const mentor = r['mentors'] ?? {};
    const mentorId = mentor['id'] ?? r['mentor_id'];
    const own = sessions.filter((s) => s['request_id'] === r['id']);
    const profile = profileMap.get(r['mentee_id'] as string) ?? {};
    const score = matchScore(
      mentor['tags'] ?? [],
      mentor['role'] ?? "",
      Number(mentor['rating'] ?? 0),
      r['progress'] ?? 0,
      profile['interests'] ?? [],
      profile['skills'] ?? [],
    );

    const entry =
      byMentor.get(mentorId) ??
      {
        mentorId,
        mentorName: mentor['name'] ?? "Mentor",
        mentorships: 0,
        sessions: 0,
        avgDurationMinutes: 0,
        avgProgress: 0,
        matchScore: 0,
        overdueSessions: 0,
        _durations: [] as number[],
        _progress: [] as number[],
      };

    entry.mentorships += 1;
    entry.sessions += own.length;
    entry._durations.push(...own.map((s) => Number(s['duration_minutes'] ?? 60)));
    entry._progress.push(r['progress'] ?? 0);
    entry.matchScore = Math.round((entry.matchScore * (entry.mentorships - 1) + score) / entry.mentorships);
    if (overdueDaysOf(r, own) !== null) entry.overdueSessions += 1;
    byMentor.set(mentorId, entry);
  }

  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

  const mentors = [...byMentor.values()]
    .map(({ _durations, _progress, ...m }) => ({
      ...m,
      avgDurationMinutes: avg(_durations),
      avgProgress: avg(_progress),
    }))
    .sort((a, b) => b.sessions - a.sessions);

  return {
    totals: {
      sessions: sessions.length,
      mentorships: requests.length,
      avgDurationMinutes: avg(sessions.map((s) => Number(s['duration_minutes'] ?? 60))),
      overdueSessions: mentors.reduce((sum, m) => sum + m.overdueSessions, 0),
    },
    mentors,
  };
}

async function listMembers(): Promise<AdminMemberRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, location, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((p) => ({
    id: p['id'],
    name: p['display_name'] ?? "Anggota",
    country: p['location'] ?? "—",
    joined: p['created_at'],
    status: "Active" as const,
  }));
}

export const cloudAdmin: AdminApi = {
  ...mockAdmin,
  listMembers,
  memberDetail,
  sessionReport,
};
