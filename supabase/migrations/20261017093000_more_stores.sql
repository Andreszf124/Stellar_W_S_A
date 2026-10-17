-- ============================================================================
-- Mas tiendas de EJEMPLO para el directorio (public.stores)
--
-- Como aplicarlo: Supabase > SQL Editor > New query > pegar todo este archivo > Run.
--
-- IMPORTANTE: todas las tiendas que crea este script son DATOS DE EJEMPLO para
-- la demo. No son negocios reales. Todas se llaman 'Tienda de ejemplo: ...' y
-- se pueden borrar con:
--   delete from public.stores where name like 'Tienda de ejemplo:%';
--
-- Es idempotente: se puede correr varias veces sin duplicar filas.
-- ============================================================================

-- 1. Columnas nuevas ---------------------------------------------------------
alter table public.stores add column if not exists city text;
alter table public.stores add column if not exists province text;
alter table public.stores add column if not exists tagline text;
alter table public.stores add column if not exists tags text[] not null default '{}';
alter table public.stores add column if not exists rating numeric(2,1);
alter table public.stores add column if not exists since_year int;
alter table public.stores add column if not exists featured boolean not null default false;
alter table public.stores add column if not exists instagram text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'stores_rating_range'
      and conrelid = 'public.stores'::regclass
  ) then
    alter table public.stores
      add constraint stores_rating_range
      check (rating is null or (rating >= 0 and rating <= 5));
  end if;
end $$;

-- Solo lectura publica: RLS activo, sin politicas de escritura.
alter table public.stores enable row level security;
grant select on public.stores to anon, authenticated;

-- 2. Completar las 3 filas de ejemplo existentes ------------------------------
with pending as (
  select id, row_number() over (order by created_at, id) as n
  from public.stores
  where name like 'Tienda de ejemplo:%' and city is null
)
update public.stores s
set city     = (array['San José', 'Heredia', 'Cartago'])[((p.n - 1) % 3) + 1],
    province = (array['San José', 'Heredia', 'Cartago'])[((p.n - 1) % 3) + 1],
    tagline  = (array[
                  'Datos de ejemplo para la demo',
                  'Otra tienda de ejemplo del directorio',
                  'Tienda ficticia para probar la app'
                ])[((p.n - 1) % 3) + 1],
    tags     = case s.category
                 when 'ropa'    then array['camisetas', 'pantalones']
                 when 'muebles' then array['sillas', 'mesas']
                 else                array['camisetas', 'sillas']
               end
from pending p
where s.id = p.id;

-- 3. 16 tiendas nuevas de EJEMPLO (6 ropa, 6 muebles, 4 ambos) ----------------
insert into public.stores
  (name, category, description, wallet, city, province, tagline, tags, since_year, featured, instagram)
select v.name, v.category, v.description, null, v.city, v.province, v.tagline, v.tags, v.since_year, v.featured, null
from (values
  -- Ropa (6)
  ('Tienda de ejemplo: Camisetas del Valle', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'San José', 'San José', 'Camisetas de algodón para todos los días',
   array['camisetas', 'gorras'], 2016, true),
  ('Tienda de ejemplo: Gorras y Más Pacífico', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Puntarenas', 'Puntarenas', 'Gorras y ropa fresca para el calor de la costa',
   array['gorras', 'camisetas'], 2019, false),
  ('Tienda de ejemplo: Chaquetas del Volcán', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Cartago', 'Cartago', 'Chaquetas livianas para las mañanas frías',
   array['chaquetas', 'pantalones'], 2014, true),
  ('Tienda de ejemplo: Tenis Rumbo Norte', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Liberia', 'Guanacaste', 'Tenis cómodos para caminar la ciudad',
   array['tenis', 'camisetas'], 2020, false),
  ('Tienda de ejemplo: Pantalones Cerro Verde', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Alajuela', 'Alajuela', 'Pantalones de mezclilla y de vestir',
   array['pantalones', 'chaquetas'], 2018, false),
  ('Tienda de ejemplo: Ropa Caribe Fresco', 'ropa',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Limón', 'Limón', 'Ropa ligera con colores del Caribe',
   array['camisetas', 'gorras', 'tenis'], 2021, false),

  -- Muebles (6)
  ('Tienda de ejemplo: Sillas del Roble', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Heredia', 'Heredia', 'Sillas de madera para comedor y oficina',
   array['sillas', 'mesas'], 2012, true),
  ('Tienda de ejemplo: Mesas Pura Madera', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'San Ramón', 'Alajuela', 'Mesas de comedor y de centro hechas a mano',
   array['mesas', 'sillas'], 2015, false),
  ('Tienda de ejemplo: Luz y Hogar Central', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'San José', 'San José', 'Lámparas y relojes para dar calor a tu sala',
   array['lámparas', 'relojes'], 2017, false),
  ('Tienda de ejemplo: Tapetes del Sol', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Nicoya', 'Guanacaste', 'Tapetes tejidos para cada rincón de la casa',
   array['tapetes', 'plantas'], 2013, false),
  ('Tienda de ejemplo: Cuadros y Marcos Aurora', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Cartago', 'Cartago', 'Cuadros y relojes de pared con diseño local',
   array['cuadros', 'relojes'], 2022, false),
  ('Tienda de ejemplo: Verde Interior', 'muebles',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Escazú', 'San José', 'Plantas, macetas y mesitas para espacios pequeños',
   array['plantas', 'mesas', 'tapetes'], 2019, false),

  -- Ambos (4)
  ('Tienda de ejemplo: Casa y Estilo Tico', 'ambos',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Heredia', 'Heredia', 'Ropa casual y muebles para toda la familia',
   array['camisetas', 'sillas', 'lámparas'], 2011, true),
  ('Tienda de ejemplo: Bazar Playa Dorada', 'ambos',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Santa Cruz', 'Guanacaste', 'Gorras, tapetes y decoración playera',
   array['gorras', 'tapetes', 'cuadros'], 2018, false),
  ('Tienda de ejemplo: Hogar y Moda Puerto', 'ambos',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Puerto Limón', 'Limón', 'Pantalones, chaquetas y mesas en un solo lugar',
   array['pantalones', 'chaquetas', 'mesas'], 2016, false),
  ('Tienda de ejemplo: Mercado Montaña', 'ambos',
   'Tienda inventada. Datos de ejemplo para la demo, no es un negocio real. El año de fundación es ficticio.',
   'Alajuela', 'Alajuela', 'Tenis, plantas y relojes con precios justos',
   array['tenis', 'plantas', 'relojes'], 2020, false)
) as v(name, category, description, city, province, tagline, tags, since_year, featured)
where not exists (select 1 from public.stores s where s.name = v.name);

-- 4. Verificacion (descomentar para correr) -----------------------------------
-- select count(*) as total_ejemplo,
--        count(*) filter (where featured) as destacadas
-- from public.stores
-- where name like 'Tienda de ejemplo:%';
-- -- Esperado: 19 tiendas de ejemplo (3 originales + 16 nuevas), 4 destacadas.
