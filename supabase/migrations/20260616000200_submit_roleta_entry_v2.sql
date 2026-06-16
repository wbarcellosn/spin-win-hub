CREATE OR REPLACE FUNCTION public.submit_roleta_entry_v2(payload JSONB)
RETURNS TABLE(id UUID, senha TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_senha TEXT;
  cpf_digits TEXT;
  is_employed BOOLEAN;
BEGIN
  cpf_digits := regexp_replace(coalesce(payload->>'cpf', ''), '\D', '', 'g');
  is_employed := coalesce((payload->>'empregado')::BOOLEAN, FALSE);

  IF cpf_digits = '' OR length(cpf_digits) <> 11 THEN
    RAISE EXCEPTION 'CPF_INVALIDO';
  END IF;

  IF EXISTS (SELECT 1 FROM public.entries e WHERE e.cpf = cpf_digits) THEN
    RAISE EXCEPTION 'DUPLICATE_CPF';
  END IF;

  generated_senha := public.next_senha();

  RETURN QUERY
  INSERT INTO public.entries (
    senha,
    nome,
    telefone,
    email,
    cpf,
    sexo,
    empregado,
    empresa,
    interesses,
    termo_aceite
  )
  VALUES (
    generated_senha,
    payload->>'nome',
    payload->>'telefone',
    payload->>'email',
    cpf_digits,
    payload->>'sexo',
    is_employed,
    CASE WHEN is_employed THEN nullif(payload->>'empresa', '') ELSE NULL END,
    coalesce(payload->'interesses', '[]'::jsonb),
    coalesce((payload->>'termo_aceite')::BOOLEAN, TRUE)
  )
  RETURNING entries.id, entries.senha;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_roleta_entry_v2(JSONB) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
