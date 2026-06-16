CREATE OR REPLACE FUNCTION public.submit_roleta_entry(
  nome TEXT,
  telefone TEXT,
  email TEXT,
  cpf TEXT,
  sexo TEXT,
  empregado BOOLEAN,
  empresa TEXT,
  interesses JSONB,
  termo_aceite BOOLEAN
)
RETURNS TABLE(id UUID, senha TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_senha TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.entries e WHERE e.cpf = submit_roleta_entry.cpf) THEN
    RAISE EXCEPTION 'DUPLICATE_CPF';
  END IF;

  generated_senha := public.next_senha();

  RETURN QUERY
  INSERT INTO public.entries (
    senha, nome, telefone, email, cpf, sexo, empregado, empresa, interesses, termo_aceite
  )
  VALUES (
    generated_senha,
    submit_roleta_entry.nome,
    submit_roleta_entry.telefone,
    submit_roleta_entry.email,
    submit_roleta_entry.cpf,
    submit_roleta_entry.sexo,
    submit_roleta_entry.empregado,
    CASE WHEN submit_roleta_entry.empregado THEN submit_roleta_entry.empresa ELSE NULL END,
    submit_roleta_entry.interesses,
    submit_roleta_entry.termo_aceite
  )
  RETURNING entries.id, entries.senha;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_roleta_entry_by_id(entry_id UUID)
RETURNS TABLE(
  id UUID,
  senha TEXT,
  nome TEXT,
  premio TEXT,
  spun BOOLEAN,
  spun_at TIMESTAMPTZ,
  vr_used BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.senha, e.nome, e.premio, e.spun, e.spun_at, e.vr_used
  FROM public.entries e
  WHERE e.id = entry_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_roleta_entry_by_cpf(cpf_input TEXT)
RETURNS TABLE(
  id UUID,
  senha TEXT,
  nome TEXT,
  premio TEXT,
  spun BOOLEAN,
  spun_at TIMESTAMPTZ,
  vr_used BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.senha, e.nome, e.premio, e.spun, e.spun_at, e.vr_used
  FROM public.entries e
  WHERE e.cpf = regexp_replace(cpf_input, '\D', '', 'g')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.record_roleta_spin(entry_id UUID)
RETURNS TABLE(prize TEXT, "alreadySpun" BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_prize TEXT;
  has_spun BOOLEAN;
  picked_index INT;
  prizes TEXT[] := ARRAY[
    'NÃO FOI DESSA VEZ',
    'GANHOU BRINDE',
    'NÃO FOI DESSA VEZ',
    'CONDIÇÃO ESPECIAL FÓRUM IEL',
    'NÃO FOI DESSA VEZ',
    'CONDIÇÃO ESPECIAL ACADEMIA',
    'NÃO FOI DESSA VEZ',
    'GANHOU REALIDADE VIRTUAL',
    'NÃO FOI DESSA VEZ',
    'GANHOU BRINDE'
  ];
  weights INT[] := ARRAY[20, 8, 20, 5, 20, 5, 20, 2, 20, 8];
  roll NUMERIC := random() * 128;
BEGIN
  SELECT e.premio, e.spun
  INTO current_prize, has_spun
  FROM public.entries e
  WHERE e.id = entry_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entrada não encontrada';
  END IF;

  IF has_spun THEN
    RETURN QUERY SELECT current_prize, TRUE;
    RETURN;
  END IF;

  FOR picked_index IN 1..array_length(weights, 1) LOOP
    roll := roll - weights[picked_index];
    IF roll <= 0 THEN
      EXIT;
    END IF;
  END LOOP;

  current_prize := prizes[picked_index];

  UPDATE public.entries
  SET premio = current_prize, spun = TRUE, spun_at = now()
  WHERE entries.id = entry_id;

  RETURN QUERY SELECT current_prize, FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_roleta_entry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, JSONB, BOOLEAN) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_roleta_entry_by_id(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_roleta_entry_by_cpf(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_roleta_spin(UUID) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
