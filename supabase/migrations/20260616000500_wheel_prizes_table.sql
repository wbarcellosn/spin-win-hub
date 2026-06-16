CREATE TABLE IF NOT EXISTS public.wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(position)
);

ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.wheel_prizes TO service_role;
REVOKE ALL ON public.wheel_prizes FROM anon, authenticated;

INSERT INTO public.wheel_prizes (label, position)
SELECT label, position
FROM (
  VALUES
    ('NÃO FOI DESSA VEZ', 0),
    ('GANHOU BRINDE', 1),
    ('NÃO FOI DESSA VEZ', 2),
    ('CONDIÇÃO ESPECIAL FÓRUM IEL', 3),
    ('NÃO FOI DESSA VEZ', 4),
    ('CONDIÇÃO ESPECIAL ACADEMIA', 5),
    ('NÃO FOI DESSA VEZ', 6),
    ('GANHOU REALIDADE VIRTUAL', 7),
    ('NÃO FOI DESSA VEZ', 8),
    ('GANHOU BRINDE', 9)
) AS seed(label, position)
WHERE NOT EXISTS (SELECT 1 FROM public.wheel_prizes);

NOTIFY pgrst, 'reload schema';
