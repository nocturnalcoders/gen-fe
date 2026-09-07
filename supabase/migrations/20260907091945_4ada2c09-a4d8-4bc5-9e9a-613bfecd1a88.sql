REVOKE ALL ON FUNCTION public.generate_overdue_session_notifications() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_overdue_session_notifications() FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_overdue_session_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_overdue_session_notifications() TO service_role;