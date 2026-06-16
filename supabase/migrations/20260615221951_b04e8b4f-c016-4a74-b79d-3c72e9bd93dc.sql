
-- Sequence for senha (00001 to 99999)
CREATE SEQUENCE IF NOT EXISTS public.senha_seq START 1 MINVALUE 1 MAXVALUE 99999;

-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Main entries table
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senha TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL,
  sexo TEXT NOT NULL,
  empregado BOOLEAN NOT NULL,
  empresa TEXT,
  interesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  termo_aceite BOOLEAN NOT NULL DEFAULT false,
  filled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  premio TEXT,
  spun BOOLEAN NOT NULL DEFAULT false,
  spun_at TIMESTAMPTZ,
  vr_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.entries TO service_role;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
-- No direct access from anon/authenticated; all access via server functions using service_role
