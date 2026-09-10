CREATE OR REPLACE FUNCTION public.set_mentorship_status(_request_id uuid, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  mentor_name text;
  msg text;
BEGIN
  IF _status NOT IN ('pending','accepted','declined','postponed','completed') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.mentorship_requests
     SET status = _status, updated_at = now()
   WHERE id = _request_id
  RETURNING * INTO r;

  IF r.id IS NULL THEN
    RAISE EXCEPTION 'Mentorship request not found';
  END IF;

  SELECT m.name INTO mentor_name FROM public.mentors m WHERE m.id = r.mentor_id;

  msg := CASE _status
    WHEN 'accepted' THEN 'Pengajuan mentorship Anda dengan ' || COALESCE(mentor_name, 'mentor') || ' telah diterima.'
    WHEN 'declined' THEN 'Pengajuan mentorship Anda dengan ' || COALESCE(mentor_name, 'mentor') || ' ditolak. Coba ajukan ke mentor lain.'
    WHEN 'postponed' THEN 'Pengajuan mentorship Anda dengan ' || COALESCE(mentor_name, 'mentor') || ' ditunda. Kami akan mengabari lagi.'
    WHEN 'completed' THEN 'Mentorship Anda dengan ' || COALESCE(mentor_name, 'mentor') || ' ditandai selesai.'
    ELSE 'Status pengajuan mentorship Anda dengan ' || COALESCE(mentor_name, 'mentor') || ' diperbarui.'
  END;

  INSERT INTO public.notifications (user_id, kind, text, dedupe_key)
  VALUES (r.mentee_id, 'mentorship', msg,
          'status:' || r.id || ':' || _status || ':' || to_char(now(), 'YYYYMMDDHH24MISS'))
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_mentorship_status(uuid, text) TO authenticated;