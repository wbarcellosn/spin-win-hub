
CREATE OR REPLACE FUNCTION public.next_senha()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT lpad(nextval('public.senha_seq')::text, 5, '0')
$$;
REVOKE EXECUTE ON FUNCTION public.next_senha() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_senha() TO service_role;
