-- Estado físico del kit (Precintado / Abierto / Empezado), distinto de la
-- estantería/estado de progreso (status). Opcional.
ALTER TABLE public.user_kits
  ADD COLUMN IF NOT EXISTS condition TEXT
  CHECK (condition IN ('sealed', 'opened', 'started'));
