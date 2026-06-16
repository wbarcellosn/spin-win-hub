CREATE TABLE public.wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wheel_prizes TO anon, authenticated;
GRANT ALL ON public.wheel_prizes TO service_role;
ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wheel prizes" ON public.wheel_prizes FOR SELECT USING (true);

CREATE TABLE public.form_interest_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_label TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.form_interest_options TO anon, authenticated;
GRANT ALL ON public.form_interest_options TO service_role;
ALTER TABLE public.form_interest_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read interest options" ON public.form_interest_options FOR SELECT USING (true);

INSERT INTO public.wheel_prizes (label, position) VALUES
  ('NÃO FOI DESSA VEZ', 0),
  ('GANHOU BRINDE', 1),
  ('NÃO FOI DESSA VEZ', 2),
  ('CONDIÇÃO ESPECIAL ACADEMIA', 3),
  ('NÃO FOI DESSA VEZ', 4),
  ('GANHOU REALIDADE VIRTUAL', 5),
  ('NÃO FOI DESSA VEZ', 6),
  ('CONDIÇÃO ESPECIAL FÓRUM IEL', 7),
  ('NÃO FOI DESSA VEZ', 8),
  ('GANHOU BRINDE', 9);

INSERT INTO public.form_interest_options (group_label, label, position) VALUES
  ('Estágios e carreira', 'Sou empresa, quero contratar estagiário e/ou CLT', 0),
  ('Estágios e carreira', 'Oportunidade de emprego/estágio', 1),
  ('Estágios e carreira', 'Gestão de estágio', 2),
  ('Academia Findes de Negócios', 'Cursos e eventos da Academia Findes de Negócios', 100),
  ('Academia Findes de Negócios', 'Fórum IEL de Gestão 2026', 101);