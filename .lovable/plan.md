# Lapisan API (API Layer) — siap pindah ke backend sendiri

Tujuan: semua akses data & auth di frontend tidak lagi memanggil backend Lovable Cloud secara langsung, tapi lewat satu lapisan `src/api/*`. Saat API Anda siap, cukup ganti implementasi adapter (1 folder) tanpa menyentuh halaman/komponen.

## Bentuk lapisan

```text
src/api/
  types.ts          # tipe domain (User, Profile, Activity, Event, Article, ...)
  http.ts           # fetch wrapper: baseUrl, Bearer JWT, error handling
  auth-store.ts     # simpan/refresh access token (localStorage) + subscriber
  client.ts         # pilih adapter: cloud (sekarang) atau rest (API Anda)
  contracts/        # daftar endpoint per modul (kontrak API Anda)
  adapters/
    cloud/*.ts      # implementasi memakai backend Lovable Cloud saat ini
    rest/*.ts       # implementasi memakai REST API Anda (Bearer JWT)
```

`VITE_API_BASE_URL` kosong = pakai adapter cloud; diisi = pakai adapter REST.

## Modul & kontrak endpoint (11 modul)

Semua endpoint memakai header `Authorization: Bearer <token>` kecuali yang ditandai publik.

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/oauth/google`
- Profiles / Members: `GET /members` (filter q, skill, country, interest, company), `GET /members/:id`, `GET /me/profile`, `PATCH /me/profile`
- Activities (ActiveGen): `GET /activities` (publik), `GET /activities/:id`, `POST /activities/:id/join`, `DELETE /activities/:id/join`, `GET /activities/:id/participants`
- Events: `GET /events` (publik), `GET /events/:id`, `POST /events/:id/register`, `DELETE /events/:id/register`, `GET /events/:id/agenda`, `GET /events/:id/speakers`
- Discussion: `GET /threads/:targetType/:targetId/messages`, `POST /threads/:targetType/:targetId/messages`, `DELETE /messages/:id` (+ opsi polling/SSE untuk realtime)
- Mentorship: `GET /mentors`, `GET /mentors/:id`, `POST /mentorship/requests`, `GET /mentorship/requests`, `PATCH /mentorship/requests/:id`, `GET /mentorship/:id/sessions`, `GET|POST|PATCH /mentorship/:id/goals`
- Articles: `GET /articles` (publik, filter kategori/tag), `GET /articles/:slug`, `POST /articles`, `PATCH /articles/:id`, `GET /me/articles/drafts`, `POST|DELETE /articles/:id/like`, `POST|DELETE /articles/:id/bookmark`, `GET|POST /articles/:id/comments`
- Diaspora: `GET /chapters`, `GET /chapters/:slug`, `POST|DELETE /chapters/:slug/join`, `GET /chapters/:slug/gatherings`, `GET /guides`
- Notifications: `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`, `GET /notifications/unread-count`
- Dashboard: `GET /feed`, `GET /me/summary` (stats, upcoming events, mentorship progress, recommended mentors)
- Admin: `GET /admin/members`, `PATCH /admin/members/:id`, `GET|POST|PATCH|DELETE /admin/events`, `GET /admin/articles/moderation`, `PATCH /admin/articles/:id/status`, `GET /admin/analytics`, `GET /admin/reports`

## Skema database (dokumen serah-terima)

`docs/database-schema.md` + `docs/api-contract.md`: seluruh tabel (profiles, activities, events, registrations, thread_messages, mentorship_requests, mentorship_sessions, goals, articles, article_likes, article_comments, bookmarks, chapters, chapter_members, gatherings, notifications, user_roles) dengan kolom, tipe, relasi, index, dan aturan akses dalam bahasa biasa — supaya API Anda bisa dibangun 1:1.

## Tahapan

1. Buat `src/api` (http, auth-store, types, client) + adapter cloud untuk modul yang sudah live (auth, profile, activities, events, registrations, threads).
2. Refactor halaman/komponen yang masih memanggil backend langsung (`auth.tsx`, `activegen*.tsx`, `events*.tsx`, `profile.tsx`, `thread.tsx`, `join-button.tsx`, `site-nav.tsx`, `use-session.ts`, `_authenticated/route.tsx`) agar memakai hook `src/api` + TanStack Query.
3. Definisikan kontrak + tipe untuk 6 modul yang masih mock (mentorship, articles, members, diaspora, notifications, admin) dan sambungkan UI-nya ke lapisan API dengan adapter mock sementara — jadi begitu API siap, tinggal aktif.
4. Tulis adapter REST lengkap (Bearer JWT, refresh token, error mapping) + `.env` `VITE_API_BASE_URL`.
5. Tulis dokumen skema DB & kontrak API di `docs/`.

## Catatan teknis

- Auth JWT: access token di memori + localStorage, refresh otomatis saat 401 sekali lalu logout; `useSession()` dipertahankan sebagai API-nya tetap sama.
- Route guard `_authenticated` memanggil `api.auth.me()` bukan Supabase langsung.
- Realtime discussion: adapter cloud tetap realtime; adapter REST memakai polling interval (atau SSE jika API Anda menyediakan).
- Backend Lovable Cloud tetap jalan sampai Anda mematikannya, jadi aplikasi tidak pernah "kosong" selama transisi.
