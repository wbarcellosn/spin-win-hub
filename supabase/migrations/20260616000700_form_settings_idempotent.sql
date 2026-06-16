create table if not exists public.form_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.form_settings enable row level security;

grant select on public.form_settings to anon, authenticated;
grant all on public.form_settings to service_role;

drop policy if exists "Anyone can read form settings" on public.form_settings;
create policy "Anyone can read form settings"
  on public.form_settings
  for select
  using (true);

insert into public.form_settings (key, value)
values
  ('title', '"Cadastro para a Roleta"'::jsonb),
  ('subtitle', '"Preencha seus dados com atenção. O CPF será usado para validar uma única participação."'::jsonb),
  ('submitLabel', '"Continuar para a Roleta"'::jsonb),
  ('sexoOptions', '["Masculino","Feminino","Prefiro não informar"]'::jsonb),
  ('empregadoSimLabel', '"Sim"'::jsonb),
  ('empregadoNaoLabel', '"Não"'::jsonb),
  ('term', '"Declaro que concordo com a utilização dos dados pessoais por parte do IEL-ES/FINDES para fins de avaliação de perfil profissional, participação em processos seletivos, divulgação de oportunidades profissionais, cursos, programas, eventos e demais iniciativas institucionais, bem como para a realização de pesquisas e levantamentos de interesse institucional.\n\nOs dados pessoais informados serão tratados com segurança, confidencialidade e em conformidade com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018), observando-se os princípios da finalidade, adequação, necessidade e proteção dos direitos dos titulares dos dados."'::jsonb)
on conflict (key) do nothing;

notify pgrst, 'reload schema';

