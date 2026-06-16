CREATE UNIQUE INDEX IF NOT EXISTS entries_cpf_unique_idx ON public.entries (cpf);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.entries TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_roles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "public can create entries" ON public.entries;
DROP POLICY IF EXISTS "public can read entries" ON public.entries;
DROP POLICY IF EXISTS "public can update entries" ON public.entries;
DROP POLICY IF EXISTS "admins can read entries" ON public.entries;
DROP POLICY IF EXISTS "admins can update entries" ON public.entries;
DROP POLICY IF EXISTS "entries public insert" ON public.entries;
DROP POLICY IF EXISTS "entries public select" ON public.entries;
DROP POLICY IF EXISTS "entries public update" ON public.entries;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries public insert"
ON public.entries
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "entries public select"
ON public.entries
FOR SELECT
TO public
USING (true);

CREATE POLICY "entries public update"
ON public.entries
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "public can check admin existence" ON public.user_roles;
DROP POLICY IF EXISTS "bootstrap can create first admin" ON public.user_roles;
DROP POLICY IF EXISTS "admins can view roles" ON public.user_roles;

CREATE POLICY "public can check admin existence"
ON public.user_roles
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "bootstrap can create first admin"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  role = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles existing
    WHERE existing.role = 'admin'
  )
);

CREATE POLICY "admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

NOTIFY pgrst, 'reload schema';
