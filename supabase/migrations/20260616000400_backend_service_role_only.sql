CREATE UNIQUE INDEX IF NOT EXISTS entries_cpf_unique_idx ON public.entries (cpf);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.entries FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.entries TO service_role;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "public can create entries" ON public.entries;
DROP POLICY IF EXISTS "public can read entries" ON public.entries;
DROP POLICY IF EXISTS "public can update entries" ON public.entries;
DROP POLICY IF EXISTS "entries public insert" ON public.entries;
DROP POLICY IF EXISTS "entries public select" ON public.entries;
DROP POLICY IF EXISTS "entries public update" ON public.entries;
DROP POLICY IF EXISTS "admins can read entries" ON public.entries;
DROP POLICY IF EXISTS "admins can update entries" ON public.entries;

DROP POLICY IF EXISTS "users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "public can check admin existence" ON public.user_roles;
DROP POLICY IF EXISTS "bootstrap can create first admin" ON public.user_roles;
DROP POLICY IF EXISTS "admins can view roles" ON public.user_roles;

CREATE POLICY "users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
