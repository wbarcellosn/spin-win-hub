create table if not exists public.form_interest_options (
  id uuid primary key default gen_random_uuid(),
  group_label text not null,
  label text not null,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists form_interest_options_position_idx
  on public.form_interest_options(position);

alter table public.form_interest_options enable row level security;

revoke all on public.form_interest_options from anon, authenticated;
grant all on public.form_interest_options to service_role;

insert into public.form_interest_options (group_label, label, position)
select seed.group_label, seed.label, seed.position
from (
  values
    ('Estagios e carreira', 'Sou empresa, quero contratar estagiario e/ou CLT', 0),
    ('Estagios e carreira', 'Oportunidade de emprego/estagio', 1),
    ('Estagios e carreira', 'Gestao de estagio', 2),
    ('Academia Findes de Negocios', 'Cursos e eventos da Academia Findes de Negocios', 3),
    ('Academia Findes de Negocios', 'Forum IEL de Gestao 2026', 4)
) as seed(group_label, label, position)
where not exists (select 1 from public.form_interest_options);

