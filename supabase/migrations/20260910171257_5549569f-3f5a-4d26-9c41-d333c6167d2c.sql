REVOKE ALL ON FUNCTION public.set_mentorship_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_mentorship_status(uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION public.generate_overdue_session_notifications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_overdue_session_notifications() TO authenticated;