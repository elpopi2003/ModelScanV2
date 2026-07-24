-- Endurecer permisos de funciones SECURITY DEFINER (advisors de seguridad)
-- Rate limit: solo usuarios autenticados; anon no debe poder llamarla.
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) FROM anon;

-- handle_new_user es una función TRIGGER; nadie debe invocarla por RPC.
-- (El trigger sigue funcionando: se ejecuta con los privilegios del owner, no del rol que llama.)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
