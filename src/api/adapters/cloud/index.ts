// Cloud adapter — implements the ApiClient contract on top of the current
// Lovable Cloud backend. Modules without a backend yet delegate to the mock
// adapter so the UI can already speak the final contract.

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type {
  ActivitiesApi,
  ApiClient,
  AuthApi,
  EventsApi,
  ID,
  Profile,
  ProfilesApi,
  RegistrationsApi,
  Session,
  ThreadsApi,
} from "../../types";
import { mockArticles, mockDiaspora, mockMembers } from "../mock/index";
import {
  cloudAdmin,
  cloudDashboard,
  cloudMentorship,
  cloudNotifications,
} from "./mentorship";

type SupabaseUser = { id: string; email?: string | null; user_metadata?: Record<string, unknown> };

function toSession(raw: { access_token?: string | null; user: SupabaseUser } | null): Session | null {
  if (!raw?.user) return null;
  const meta = raw.user.user_metadata ?? {};
  return {
    user: {
      id: raw.user.id,
      email: raw.user.email ?? null,
      displayName: (meta['full_name'] as string) ?? (meta['name'] as string) ?? null,
      avatarUrl: (meta['avatar_url'] as string) ?? null,
    },
    accessToken: raw.access_token ?? null,
  };
}

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  role: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  skills: string[] | null;
  interests: string[] | null;
  created_at: string | null;
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    headline: row.headline,
    role: row.role,
    company: row.company,
    location: row.location,
    bio: row.bio,
    website: row.website,
    linkedin: row.linkedin,
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    createdAt: row.created_at,
  };
}

const auth: AuthApi = {
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return toSession(data.session as never);
  },
  onAuthStateChange: (cb) => {
    const { data } = supabase.auth.onAuthStateChange((_evt, session) => {
      cb(toSession(session as never));
    });
    return () => data.subscription.unsubscribe();
  },
  signInWithPassword: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  },
  signUpWithPassword: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName ?? null },
      },
    });
    if (error) throw new Error(error.message);
    return { needsEmailConfirmation: !data.session };
  },
  signInWithGoogle: async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) throw new Error("Google sign-in failed. Please try again.");
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
};

async function currentUserId(): Promise<ID> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to sign in first.");
  return data.user.id;
}

const profiles: ProfilesApi = {
  getMyProfile: async () => {
    const id = await currentUserId();
    return profiles.getProfile(id);
  },
  getProfile: async (id) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toProfile(data as ProfileRow) : null;
  },
  updateMyProfile: async (input) => {
    const id = await currentUserId();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: input.displayName ?? null,
        avatar_url: input.avatarUrl ?? null,
        headline: input.headline ?? null,
        role: input.role ?? null,
        company: input.company ?? null,
        location: input.location ?? null,
        bio: input.bio ?? null,
        website: input.website ?? null,
        linkedin: input.linkedin ?? null,
        skills: input.skills ?? [],
        interests: input.interests ?? [],
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Profile not found.");
    return toProfile(data as ProfileRow);
  },
};

function subscribeTable(channelName: string, table: string, filter: string, onChange: () => void) {
  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table, filter }, () => onChange())
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// registrations is polymorphic (target_type + target_id), so PostgREST cannot
// embed a count. Fetch the ids and tally them client-side instead.
async function joinedCounts(targetType: "activity" | "event", targetIds?: ID[]) {
  let query = supabase.from("registrations").select("target_id").eq("target_type", targetType);
  if (targetIds && targetIds.length > 0) query = query.in("target_id", targetIds);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ target_id: string }>) {
    counts.set(row.target_id, (counts.get(row.target_id) ?? 0) + 1);
  }
  return counts;
}

const activities: ActivitiesApi = {
  list: async () => {
    const { data, error } = await supabase
      .from("activities")
      .select(
        "id, title, activity_type, activity_date, location, capacity, host_name, description",
      )
      .order("activity_date", { ascending: true });
    if (error) throw new Error(error.message);
    const counts = await joinedCounts("activity");
    return (data ?? []).map((a: Record<string, any>) => ({
      id: a['id'],
      title: a['title'],
      activityType: a['activity_type'],
      activityDate: a['activity_date'],
      location: a['location'],
      capacity: a['capacity'],
      hostName: a['host_name'],
      description: a['description'] ?? null,
      joined: counts.get(a['id']) ?? 0,
    }));
  },
  get: async (id) => {
    const { data, error } = await supabase
      .from("activities")
      .select(
        "id, title, activity_type, activity_date, location, capacity, host_name, description",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const counts = await joinedCounts("activity", [id]);
    const a = data as Record<string, any>;
    return {
      id: a['id'],
      title: a['title'],
      activityType: a['activity_type'],
      activityDate: a['activity_date'],
      location: a['location'],
      capacity: a['capacity'],
      hostName: a['host_name'],
      description: a['description'] ?? null,
      joined: counts.get(a['id']) ?? 0,
    };
  },
  subscribe: (id, onChange) =>
    subscribeTable(`activity-${id}-registrations`, "registrations", `target_id=eq.${id}`, onChange),
};

const events: EventsApi = {
  list: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, location, capacity, description")
      .order("event_date", { ascending: true });
    if (error) throw new Error(error.message);
    const counts = await joinedCounts("event");
    return (data ?? []).map((e: Record<string, any>) => ({
      id: e['id'],
      title: e['title'],
      eventType: e['event_type'],
      eventDate: e['event_date'],
      location: e['location'],
      capacity: e['capacity'],
      description: e['description'] ?? null,
      joined: counts.get(e['id']) ?? 0,
    }));
  },
  get: async (id) => {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, location, capacity, description")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const counts = await joinedCounts("event", [id]);
    const e = data as Record<string, any>;
    return {
      id: e['id'],
      title: e['title'],
      eventType: e['event_type'],
      eventDate: e['event_date'],
      location: e['location'],
      capacity: e['capacity'],
      description: e['description'] ?? null,
      joined: counts.get(e['id']) ?? 0,
    };
  },
  subscribe: (id, onChange) =>
    subscribeTable(`event-${id}-registrations`, "registrations", `target_id=eq.${id}`, onChange),
};

const registrations: RegistrationsApi = {
  isRegistered: async ({ targetType, targetId }) => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  },
  register: async ({ targetType, targetId }) => {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("registrations")
      .insert({ user_id: userId, target_type: targetType, target_id: targetId });
    if (error) throw new Error(error.message);
  },
  unregister: async ({ targetType, targetId }) => {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (error) throw new Error(error.message);
  },
};

const threads: ThreadsApi = {
  list: async ({ targetType, targetId }) => {
    const { data, error } = await supabase
      .from("thread_messages")
      .select("id, user_id, body, created_at, profiles(display_name, avatar_url)")
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((m: Record<string, any>) => ({
      id: m['id'],
      userId: m['user_id'],
      body: m['body'],
      createdAt: m['created_at'],
      authorName: m['profiles']?.display_name ?? null,
      authorAvatarUrl: m['profiles']?.avatar_url ?? null,
    }));
  },
  post: async ({ targetType, targetId, body }) => {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("thread_messages")
      .insert({ user_id: userId, target_type: targetType, target_id: targetId, body });
    if (error) throw new Error(error.message);
  },
  remove: async (id) => {
    const { error } = await supabase.from("thread_messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  subscribe: ({ targetType, targetId }, onChange) =>
    subscribeTable(
      `thread-${targetType}-${targetId}`,
      "thread_messages",
      `target_id=eq.${targetId}`,
      onChange,
    ),
};

export const cloudApi: ApiClient = {
  auth,
  profiles,
  activities,
  events,
  registrations,
  threads,
  members: mockMembers,
  mentorship: cloudMentorship,
  articles: mockArticles,
  diaspora: mockDiaspora,
  notifications: cloudNotifications,
  dashboard: cloudDashboard,
  admin: cloudAdmin,
};
