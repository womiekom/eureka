CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    class TEXT NOT NULL, 
    phone TEXT NOT NULL,
    experience TEXT NOT NULL, 
    interests TEXT[] NOT NULL DEFAULT '{}', 
    motivation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow select for admin" ON public.registrations;
DROP POLICY IF EXISTS "Allow update for admin" ON public.registrations;

CREATE POLICY "Allow public insert" ON public.registrations
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow select for admin" ON public.registrations
    FOR SELECT
    TO public
    USING (coalesce(current_setting('request.headers', true)::json->>'x-admin-password', '') = 'eureka!');
