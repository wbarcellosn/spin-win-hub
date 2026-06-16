CREATE TABLE public.form_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.form_settings TO anon, authenticated;
GRANT ALL ON public.form_settings TO service_role;

ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read form settings"
  ON public.form_settings FOR SELECT
  USING (true);