-- Precio medio de vendedores de Scalemates (EUR), poblado bajo demanda por la
-- edge function scalemates-price y cacheado en la fila del kit.
alter table public.kits add column if not exists avg_price numeric;
comment on column public.kits.avg_price is 'Precio medio de vendedores en Scalemates (EUR); poblado bajo demanda';
