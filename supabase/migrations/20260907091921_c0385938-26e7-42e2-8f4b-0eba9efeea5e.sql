-- MENTORS
CREATE TABLE public.mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  sessions integer NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mentors TO anon;
GRANT SELECT ON public.mentors TO authenticated;
GRANT ALL ON public.mentors TO service_role;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentors_read_all" ON public.mentors FOR SELECT USING (true);

-- MENTORSHIP REQUESTS
CREATE TABLE public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  message text,
  next_session_at timestamptz,
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mentorship_requests_mentee_idx ON public.mentorship_requests (mentee_id);
CREATE INDEX mentorship_requests_mentor_idx ON public.mentorship_requests (mentor_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorship_requests TO authenticated;
GRANT ALL ON public.mentorship_requests TO service_role;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mr_read_auth" ON public.mentorship_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "mr_insert_own" ON public.mentorship_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "mr_update_own" ON public.mentorship_requests FOR UPDATE TO authenticated USING (auth.uid() = mentee_id) WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "mr_delete_own" ON public.mentorship_requests FOR DELETE TO authenticated USING (auth.uid() = mentee_id);

-- SESSIONS
CREATE TABLE public.mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  title text NOT NULL,
  held_at timestamptz NOT NULL DEFAULT now(),
  duration_minutes integer NOT NULL DEFAULT 60,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mentorship_sessions_request_idx ON public.mentorship_sessions (request_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorship_sessions TO authenticated;
GRANT ALL ON public.mentorship_sessions TO service_role;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msess_read_auth" ON public.mentorship_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "msess_write_own" ON public.mentorship_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mentorship_requests r WHERE r.id = request_id AND r.mentee_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentorship_requests r WHERE r.id = request_id AND r.mentee_id = auth.uid()));

-- GOALS
CREATE TABLE public.mentorship_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  title text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mentorship_goals_request_idx ON public.mentorship_goals (request_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorship_goals TO authenticated;
GRANT ALL ON public.mentorship_goals TO service_role;
ALTER TABLE public.mentorship_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mgoal_read_auth" ON public.mentorship_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "mgoal_write_own" ON public.mentorship_goals FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mentorship_requests r WHERE r.id = request_id AND r.mentee_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentorship_requests r WHERE r.id = request_id AND r.mentee_id = auth.uid()));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'system',
  text text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  dedupe_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX notifications_dedupe_idx ON public.notifications (user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mr_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mgoal_updated_at BEFORE UPDATE ON public.mentorship_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Overdue session notifications (idempotent, safe to call from the app)
CREATE OR REPLACE FUNCTION public.generate_overdue_session_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE inserted integer;
BEGIN
  WITH overdue AS (
    SELECT r.id, r.mentee_id, m.name AS mentor_name, r.next_session_at,
           GREATEST(1, (EXTRACT(EPOCH FROM (now() - r.next_session_at)) / 86400)::int) AS days
    FROM public.mentorship_requests r
    JOIN public.mentors m ON m.id = r.mentor_id
    WHERE r.status IN ('pending','accepted')
      AND r.next_session_at IS NOT NULL
      AND r.next_session_at < now()
      AND NOT EXISTS (
        SELECT 1 FROM public.mentorship_sessions s
        WHERE s.request_id = r.id AND s.held_at >= r.next_session_at
      )
  ), ins AS (
    INSERT INTO public.notifications (user_id, kind, text, dedupe_key)
    SELECT o.mentee_id, 'mentorship',
           'Sesi mentorship dengan ' || o.mentor_name || ' terlambat ' || o.days || ' hari. Jadwalkan ulang sesi Anda.',
           'overdue:' || o.id || ':' || to_char(o.next_session_at, 'YYYYMMDDHH24MI')
    FROM overdue o
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::int INTO inserted FROM ins;
  RETURN inserted;
END; $$;

GRANT EXECUTE ON FUNCTION public.generate_overdue_session_notifications() TO authenticated;

-- Demo mentors
INSERT INTO public.mentors (name, role, tags, rating, sessions) VALUES
  ('Prasetyo H.', 'Eng Manager · Airbnb', ARRAY['Leadership','Relocation'], 4.9, 128),
  ('Sinta Larasati', 'Senior PM · Grab', ARRAY['Product','Career'], 4.8, 84),
  ('Yoga Pradana', 'Staff Eng · Meta', ARRAY['System Design'], 5.0, 210),
  ('Dewi Ratna', 'Design Lead · Tokopedia', ARRAY['UX','Portfolio'], 4.7, 66),
  ('Bagas Setya', 'Founder · Rasa', ARRAY['Startup','Fundraising'], 4.8, 41),
  ('Nadia Wibowo', 'Immigration Consultant', ARRAY['Visa','EU'], 4.9, 55);