-- Rate limiting por usuario y función (protege APIs de pago: Gemini, Firecrawl)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fn TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, fn)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo la función SECURITY DEFINER de abajo accede a esta tabla.

-- Incrementa atómicamente el contador del usuario y devuelve si está permitido.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_fn TEXT, p_max INT, p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_count INT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (user_id, fn, window_start, count)
    VALUES (v_uid, p_fn, v_now, 1)
  ON CONFLICT (user_id, fn) DO UPDATE SET
    window_start = CASE
      WHEN public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
      THEN v_now ELSE public.rate_limits.window_start END,
    count = CASE
      WHEN public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
      THEN 1 ELSE public.rate_limits.count + 1 END
  RETURNING count INTO v_count;

  RETURN v_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) TO authenticated;
