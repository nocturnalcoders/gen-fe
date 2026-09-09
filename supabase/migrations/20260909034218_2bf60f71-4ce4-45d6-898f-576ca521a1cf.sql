CREATE TABLE public.mentor_testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_role text,
  quote text NOT NULL,
  rating numeric NOT NULL DEFAULT 5.0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX mentor_testimonials_mentor_idx ON public.mentor_testimonials(mentor_id);

GRANT SELECT ON public.mentor_testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_testimonials TO authenticated;
GRANT ALL ON public.mentor_testimonials TO service_role;

ALTER TABLE public.mentor_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_read_all" ON public.mentor_testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials_insert_own" ON public.mentor_testimonials FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "testimonials_update_own" ON public.mentor_testimonials FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "testimonials_delete_own" ON public.mentor_testimonials FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE TRIGGER mentor_testimonials_updated_at BEFORE UPDATE ON public.mentor_testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.mentor_testimonials (mentor_id, author_name, author_role, quote, rating)
SELECT m.id, x.author_name, x.author_role, x.quote, x.rating
FROM public.mentors m
CROSS JOIN LATERAL (
  VALUES
    ('Dewi Anggraini', 'Product Designer', 'Sesi bersama ' || m.name || ' sangat terstruktur. Saya keluar dari tiap sesi dengan langkah konkret.', 5.0),
    ('Rangga Pratama', 'Software Engineer', 'Feedback-nya jujur dan membangun. Portofolio saya jauh lebih tajam setelah tiga sesi.', 4.5)
) AS x(author_name, author_role, quote, rating);