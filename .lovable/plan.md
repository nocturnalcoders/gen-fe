# Garuda Empowerment Network — Next Steps

## Current state

The platform has the full design system and page structure in place, with auth already wired up. Two modules are already connected to the live backend:

- **ActiveGen** — real activities, real-time registration counts, join/leave button, discussion thread per activity.
- **Events** — real events, real-time registration counts, register/cancel button, discussion thread per event.
- **Auth** — sign-up/sign-in with email and Google, profile auto-created via trigger.

The remaining modules are still using static mock data and need backend integration:

- Dashboard (feed, stats, upcoming events, mentorship progress)
- Profile (bio, skills, experience, articles, events, mentorship, badges)
- Mentorship (mentor directory, requests, active sessions, goals)
- Articles (browse, publish, drafts, comments, likes)
- Members (search, filter, skills, interests, country, connect)
- Diaspora (chapters, gatherings, guides)
- Notifications
- Admin dashboard (members, events, moderation, analytics)

There is also no auth-gated layout yet, so protected pages (dashboard, profile, admin, etc.) are publicly reachable.

## Proposed plan — phased

### Phase 1: Auth gating + real profile
1. Add the `_authenticated` protected layout so dashboard, profile, admin, etc. require sign-in.
2. Extend the `profiles` table with bio, skills, headline, location, social links.
3. Build `/profile` from the real signed-in user's data and add an edit-profile flow.

### Phase 2: Real notifications + member directory
4. Add a `notifications` table with user-scoped read/unread state.
5. Wire the `/notifications` page to read and mark-as-read real notifications.
6. Create notifications when a user joins an activity/event, gets a reply, or a mentorship request is updated.
7. Extend the `profiles` table with skills, interests, company, role, country, LinkedIn.
8. Build `/members` with real search/filter by skill, country, interest, and company.

### Phase 3: Articles + Mentorship
9. Add an `articles` table (title, body, excerpt, status, tags, author_id, likes_count).
10. Wire `/articles` read list, publish tab, drafts tab, and article detail.
11. Add article likes/comments and real counts.
12. Add a `mentorship_requests` table (mentor_id, mentee_id, status, message, goals).
13. Wire `/mentorship` browse, request, active sessions, and goals.

### Phase 4: Admin + diaspora
14. Add a `user_roles` table with `admin` role and `has_role()` helper.
15. Restrict `/admin` to admin role; build real manage-members, manage-events, and moderation tabs.
16. Add a `chapters` table and wire `/diaspora` with chapter join and gatherings.

### Phase 5: Polish
17. Replace the landing page's static stats, events, and articles with real top data.
18. Add empty states, loading skeletons, and error handling across all pages.
19. Add search metadata, sitemap updates, and accessibility passes.

## Decision needed

Tell me which phase to start with, or I can begin with Phase 1 (auth gating + profile) since that unlocks everything else and protects the private pages immediately.