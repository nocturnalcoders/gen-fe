ALTER TABLE public.thread_messages
  ADD CONSTRAINT thread_messages_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS registrations_target_idx ON public.registrations (target_type, target_id);